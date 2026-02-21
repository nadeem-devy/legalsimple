// Conversation types
export type ConversationType = 'direct' | 'case';
export type ConversationStatus = 'active' | 'archived' | 'deleted';
export type ParticipantRole = 'client' | 'lawyer' | 'admin';
export type ParticipantStatus = 'active' | 'left' | 'removed';
export type MessageType = 'text' | 'attachment' | 'system' | 'case_update';
export type MessageStatus = 'sent' | 'delivered' | 'deleted' | 'edited';
export type PresenceStatus = 'online' | 'away' | 'busy' | 'offline';
export type ScanStatus = 'pending' | 'clean' | 'infected' | 'error';

// Database table types
export interface Conversation {
  id: string;
  type: ConversationType;
  case_id: string | null;
  title: string | null;
  created_by: string;
  status: ConversationStatus;
  encryption_enabled: boolean;
  created_at: string;
  updated_at: string;
  last_message_at: string | null;
}

export interface ConversationParticipant {
  id: string;
  conversation_id: string;
  user_id: string;
  role: ParticipantRole;
  status: ParticipantStatus;
  notifications_enabled: boolean;
  muted_until: string | null;
  last_read_at: string | null;
  last_read_message_id: string | null;
  unread_count: number;
  joined_at: string;
  left_at: string | null;
}

export interface DirectMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content_encrypted: string;
  content_iv: string;
  content_tag: string;
  content_hash: string;
  message_type: MessageType;
  reply_to_id: string | null;
  metadata: Record<string, unknown>;
  status: MessageStatus;
  edited_at: string | null;
  deleted_at: string | null;
  created_at: string;
}

export interface MessageAttachment {
  id: string;
  message_id: string;
  file_name_encrypted: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  storage_bucket: string;
  file_key_encrypted: string;
  file_iv: string;
  thumbnail_path: string | null;
  scan_status: ScanStatus;
  scanned_at: string | null;
  created_at: string;
}

export interface MessageReadReceipt {
  id: string;
  message_id: string;
  user_id: string;
  read_at: string;
}

export interface UserPresence {
  user_id: string;
  status: PresenceStatus;
  last_seen_at: string;
  current_conversation_id: string | null;
  is_typing: boolean;
  typing_started_at: string | null;
  device_type: 'web' | 'ios' | 'android' | null;
  updated_at: string;
}

export interface EncryptionKey {
  id: string;
  conversation_id: string;
  key_encrypted: string;
  key_iv: string;
  algorithm: string;
  key_version: number;
  rotated_at: string | null;
  previous_key_id: string | null;
  status: 'active' | 'rotated' | 'revoked';
  created_at: string;
}

// API Response types (decrypted)
export interface DecryptedMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: MessageType;
  reply_to_id: string | null;
  metadata: Record<string, unknown>;
  status: MessageStatus;
  created_at: string;
  sender?: UserProfile;
  attachments?: AttachmentInfo[];
  read_receipts?: ReadReceiptInfo[];
  reply_to?: DecryptedMessage;
}

export interface UserProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role: ParticipantRole;
}

export interface AttachmentInfo {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  thumbnail_url?: string;
}

export interface ReadReceiptInfo {
  user_id: string;
  read_at: string;
}

export interface ConversationWithDetails {
  id: string;
  type: ConversationType;
  case_id: string | null;
  title: string | null;
  status: ConversationStatus;
  created_at: string;
  last_message_at: string | null;
  unread_count: number;
  last_read_at: string | null;
  participants: UserProfile[];
  last_message?: {
    content: string;
    sender_id: string;
    created_at: string;
  };
}

// Real-time event types
export interface NewMessageEvent {
  type: 'new_message';
  message: DecryptedMessage;
}

export interface TypingEvent {
  type: 'typing';
  conversation_id: string;
  user_id: string;
  is_typing: boolean;
}

export interface PresenceEvent {
  type: 'presence';
  user_id: string;
  status: PresenceStatus;
}

export interface ReadReceiptEvent {
  type: 'read_receipt';
  message_id: string;
  user_id: string;
  read_at: string;
}

export type ChatEvent = NewMessageEvent | TypingEvent | PresenceEvent | ReadReceiptEvent;

// API Request types
export interface CreateConversationRequest {
  type: ConversationType;
  participant_ids: string[];
  case_id?: string;
  title?: string;
}

export interface SendMessageRequest {
  content: string;
  message_type?: MessageType;
  reply_to_id?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdatePresenceRequest {
  status: PresenceStatus;
  current_conversation_id?: string;
}

export interface MarkAsReadRequest {
  message_ids: string[];
}

// Component props types
export interface ConversationListProps {
  conversations: ConversationWithDetails[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

export interface ChatWindowProps {
  conversationId: string;
  currentUserId: string;
  onClose?: () => void;
}

export interface MessageInputProps {
  onSend: (content: string, attachments?: File[]) => void;
  onTyping: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export interface MessageItemProps {
  message: DecryptedMessage;
  isOwn: boolean;
  showAvatar?: boolean;
  showReadReceipts?: boolean;
}
