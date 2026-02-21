import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32; // 256 bits

// Master key from environment variable (base64 encoded)
const MASTER_KEY = process.env.ENCRYPTION_MASTER_KEY;

export interface EncryptedData {
  ciphertext: string;  // Base64 encoded
  iv: string;          // Base64 encoded
  tag: string;         // Base64 encoded
}

/**
 * Generate a new encryption key for a conversation
 */
export function generateConversationKey(): Buffer {
  return crypto.randomBytes(KEY_LENGTH);
}

/**
 * Get the master key buffer, with validation
 */
function getMasterKeyBuffer(): Buffer {
  if (!MASTER_KEY) {
    throw new Error('ENCRYPTION_MASTER_KEY environment variable is not set');
  }
  const buffer = Buffer.from(MASTER_KEY, 'base64');
  if (buffer.length !== KEY_LENGTH) {
    throw new Error('ENCRYPTION_MASTER_KEY must be a 32-byte base64-encoded key');
  }
  return buffer;
}

/**
 * Encrypt the conversation key with the master key for storage
 */
export function encryptConversationKey(conversationKey: Buffer): EncryptedData {
  const masterKeyBuffer = getMasterKeyBuffer();
  return encrypt(conversationKey.toString('base64'), masterKeyBuffer);
}

/**
 * Decrypt the conversation key from storage
 */
export function decryptConversationKey(encryptedKey: EncryptedData): Buffer {
  const masterKeyBuffer = getMasterKeyBuffer();
  const keyBase64 = decrypt(encryptedKey, masterKeyBuffer);
  return Buffer.from(keyBase64, 'base64');
}

/**
 * Encrypt plaintext content using AES-256-GCM
 */
export function encrypt(plaintext: string, key: Buffer): EncryptedData {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let ciphertext = cipher.update(plaintext, 'utf8', 'base64');
  ciphertext += cipher.final('base64');

  const tag = cipher.getAuthTag();

  return {
    ciphertext,
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
  };
}

/**
 * Decrypt ciphertext using AES-256-GCM
 */
export function decrypt(encryptedData: EncryptedData, key: Buffer): string {
  const iv = Buffer.from(encryptedData.iv, 'base64');
  const tag = Buffer.from(encryptedData.tag, 'base64');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let plaintext = decipher.update(encryptedData.ciphertext, 'base64', 'utf8');
  plaintext += decipher.final('utf8');

  return plaintext;
}

/**
 * Generate a SHA-256 hash for content integrity verification
 */
export function hashContent(content: string): string {
  return crypto.createHash('sha256').update(content).digest('base64');
}

/**
 * Verify content integrity using timing-safe comparison
 */
export function verifyHash(content: string, expectedHash: string): boolean {
  const actualHash = hashContent(content);
  try {
    return crypto.timingSafeEqual(
      Buffer.from(actualHash),
      Buffer.from(expectedHash)
    );
  } catch {
    return false;
  }
}

/**
 * Generate a secure random token
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('base64url');
}

/**
 * Encrypt a file buffer
 */
export function encryptFile(fileBuffer: Buffer, key: Buffer): {
  encryptedData: Buffer;
  iv: string;
  tag: string;
} {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encryptedData = Buffer.concat([
    cipher.update(fileBuffer),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return {
    encryptedData,
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
  };
}

/**
 * Decrypt a file buffer
 */
export function decryptFile(
  encryptedData: Buffer,
  key: Buffer,
  iv: string,
  tag: string
): Buffer {
  const ivBuffer = Buffer.from(iv, 'base64');
  const tagBuffer = Buffer.from(tag, 'base64');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, ivBuffer);
  decipher.setAuthTag(tagBuffer);

  return Buffer.concat([
    decipher.update(encryptedData),
    decipher.final(),
  ]);
}

/**
 * Generate a new master key (for initial setup)
 * Run: openssl rand -base64 32
 */
export function generateMasterKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString('base64');
}
