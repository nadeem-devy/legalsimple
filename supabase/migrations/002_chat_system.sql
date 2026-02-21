-- =====================================================
-- SECURE CHAT SYSTEM MIGRATION
-- Enables encrypted messaging between lawyers and clients
-- =====================================================

-- =====================================================
-- 1. CONVERSATIONS TABLE
-- =====================================================
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Conversation type: 'direct' (1:1) or 'case' (linked to a case)
  type TEXT NOT NULL CHECK (type IN ('direct', 'case')),

  -- Optional case link (for case-bound conversations)
  case_id UUID REFERENCES cases(id) ON DELETE SET NULL,

  -- Conversation metadata
  title TEXT,
  created_by UUID REFERENCES profiles(id),

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),

  -- Encryption metadata
  encryption_enabled BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ,

  -- One conversation per case
  CONSTRAINT case_conversation_unique UNIQUE(case_id)
);

-- =====================================================
-- 2. CONVERSATION_PARTICIPANTS TABLE
-- =====================================================
CREATE TABLE conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Participant role in conversation
  role TEXT NOT NULL CHECK (role IN ('client', 'lawyer', 'admin')),

  -- Participant status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'left', 'removed')),

  -- Notification preferences
  notifications_enabled BOOLEAN DEFAULT TRUE,
  muted_until TIMESTAMPTZ,

  -- Read tracking
  last_read_at TIMESTAMPTZ,
  last_read_message_id UUID,

  -- Unread counter (denormalized for performance)
  unread_count INTEGER DEFAULT 0,

  -- Timestamps
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,

  CONSTRAINT unique_participant UNIQUE(conversation_id, user_id)
);

-- =====================================================
-- 3. DIRECT_MESSAGES TABLE
-- =====================================================
CREATE TABLE direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,

  -- Sender info
  sender_id UUID NOT NULL REFERENCES profiles(id),

  -- Message content (encrypted at-rest)
  content_encrypted TEXT NOT NULL,
  content_iv TEXT NOT NULL,
  content_tag TEXT NOT NULL,

  -- Original content hash (for integrity verification)
  content_hash TEXT NOT NULL,

  -- Message type
  message_type TEXT DEFAULT 'text' CHECK (message_type IN (
    'text', 'attachment', 'system', 'case_update'
  )),

  -- Reply threading
  reply_to_id UUID REFERENCES direct_messages(id),

  -- Message metadata (non-sensitive, for display)
  metadata JSONB DEFAULT '{}',

  -- Status
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'deleted', 'edited')),
  edited_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. MESSAGE_ATTACHMENTS TABLE
-- =====================================================
CREATE TABLE message_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES direct_messages(id) ON DELETE CASCADE,

  -- File metadata
  file_name_encrypted TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,

  -- Storage
  storage_path TEXT NOT NULL,
  storage_bucket TEXT DEFAULT 'chat-attachments',

  -- Encryption
  file_key_encrypted TEXT NOT NULL,
  file_iv TEXT NOT NULL,

  -- Thumbnail for images (also encrypted)
  thumbnail_path TEXT,

  -- Virus scan status
  scan_status TEXT DEFAULT 'pending' CHECK (scan_status IN (
    'pending', 'clean', 'infected', 'error'
  )),
  scanned_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. MESSAGE_READ_RECEIPTS TABLE
-- =====================================================
CREATE TABLE message_read_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES direct_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_read_receipt UNIQUE(message_id, user_id)
);

-- =====================================================
-- 6. USER_PRESENCE TABLE
-- =====================================================
CREATE TABLE user_presence (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,

  -- Online status
  status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'away', 'busy', 'offline')),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),

  -- Current activity
  current_conversation_id UUID REFERENCES conversations(id),
  is_typing BOOLEAN DEFAULT FALSE,
  typing_started_at TIMESTAMPTZ,

  -- Device info
  device_type TEXT CHECK (device_type IN ('web', 'ios', 'android')),

  -- Timestamps
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 7. ENCRYPTION_KEYS TABLE
-- =====================================================
CREATE TABLE encryption_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,

  -- Key data (encrypted with master key)
  key_encrypted TEXT NOT NULL,
  key_iv TEXT NOT NULL,

  -- Key metadata
  algorithm TEXT DEFAULT 'AES-256-GCM',
  key_version INTEGER DEFAULT 1,

  -- Rotation tracking
  rotated_at TIMESTAMPTZ,
  previous_key_id UUID,

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'rotated', 'revoked')),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 8. AUDIT_LOGS TABLE (for compliance)
-- =====================================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_conversations_case ON conversations(case_id);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);
CREATE INDEX idx_conversations_created_by ON conversations(created_by);

CREATE INDEX idx_participants_user ON conversation_participants(user_id);
CREATE INDEX idx_participants_conversation ON conversation_participants(conversation_id);
CREATE INDEX idx_participants_unread ON conversation_participants(user_id, unread_count)
  WHERE unread_count > 0;

CREATE INDEX idx_messages_conversation ON direct_messages(conversation_id);
CREATE INDEX idx_messages_sender ON direct_messages(sender_id);
CREATE INDEX idx_messages_created ON direct_messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_reply ON direct_messages(reply_to_id) WHERE reply_to_id IS NOT NULL;

CREATE INDEX idx_attachments_message ON message_attachments(message_id);
CREATE INDEX idx_attachments_scan ON message_attachments(scan_status) WHERE scan_status = 'pending';

CREATE INDEX idx_read_receipts_message ON message_read_receipts(message_id);
CREATE INDEX idx_read_receipts_user ON message_read_receipts(user_id);

CREATE INDEX idx_presence_status ON user_presence(status) WHERE status != 'offline';
CREATE INDEX idx_presence_conversation ON user_presence(current_conversation_id)
  WHERE is_typing = TRUE;

CREATE INDEX idx_encryption_keys_conversation ON encryption_keys(conversation_id);
CREATE INDEX idx_encryption_keys_status ON encryption_keys(status);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update conversation last_message_at and increment unread counts
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Update conversation last_message_at
  UPDATE conversations
  SET last_message_at = NEW.created_at, updated_at = NOW()
  WHERE id = NEW.conversation_id;

  -- Increment unread count for all participants except sender
  UPDATE conversation_participants
  SET unread_count = unread_count + 1
  WHERE conversation_id = NEW.conversation_id
    AND user_id != NEW.sender_id
    AND status = 'active';

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation_on_message
  AFTER INSERT ON direct_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_on_message();

-- Update presence timestamp
CREATE OR REPLACE FUNCTION update_presence_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_presence_timestamp
  BEFORE UPDATE ON user_presence
  FOR EACH ROW
  EXECUTE FUNCTION update_presence_timestamp();

-- Update conversations updated_at
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation_timestamp
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_read_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE encryption_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Conversations: Users can view conversations they participate in
CREATE POLICY "Users can view their conversations"
  ON conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = conversations.id
        AND user_id = auth.uid()
        AND status = 'active'
    )
  );

CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Participants can update conversations"
  ON conversations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = conversations.id
        AND user_id = auth.uid()
        AND status = 'active'
    )
  );

-- Participants: Users can view participants of their conversations
CREATE POLICY "Users can view conversation participants"
  ON conversation_participants FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = conversation_participants.conversation_id
        AND cp.user_id = auth.uid()
        AND cp.status = 'active'
    )
  );

CREATE POLICY "Users can insert participants"
  ON conversation_participants FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE id = conversation_id
        AND created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update their own participation"
  ON conversation_participants FOR UPDATE
  USING (user_id = auth.uid());

-- Messages: Users can view and send messages in their conversations
CREATE POLICY "Users can view messages in their conversations"
  ON direct_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = direct_messages.conversation_id
        AND user_id = auth.uid()
        AND status = 'active'
    )
  );

CREATE POLICY "Users can send messages in their conversations"
  ON direct_messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = direct_messages.conversation_id
        AND user_id = auth.uid()
        AND status = 'active'
    )
  );

CREATE POLICY "Users can update their own messages"
  ON direct_messages FOR UPDATE
  USING (sender_id = auth.uid());

-- Attachments: Follow message visibility
CREATE POLICY "Users can view attachments in their conversations"
  ON message_attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM direct_messages dm
      JOIN conversation_participants cp ON cp.conversation_id = dm.conversation_id
      WHERE dm.id = message_attachments.message_id
        AND cp.user_id = auth.uid()
        AND cp.status = 'active'
    )
  );

CREATE POLICY "Users can insert attachments for their messages"
  ON message_attachments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM direct_messages dm
      WHERE dm.id = message_attachments.message_id
        AND dm.sender_id = auth.uid()
    )
  );

-- Read receipts
CREATE POLICY "Users can view read receipts"
  ON message_read_receipts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM direct_messages dm
      JOIN conversation_participants cp ON cp.conversation_id = dm.conversation_id
      WHERE dm.id = message_read_receipts.message_id
        AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create read receipts"
  ON message_read_receipts FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Presence: Everyone can view, users can update their own
CREATE POLICY "Users can view presence"
  ON user_presence FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can manage own presence"
  ON user_presence FOR ALL
  USING (user_id = auth.uid());

-- Encryption keys: Only accessible by conversation participants
CREATE POLICY "Users can view encryption keys for their conversations"
  ON encryption_keys FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = encryption_keys.conversation_id
        AND user_id = auth.uid()
        AND status = 'active'
    )
  );

-- Audit logs: Users can view their own, admins can view all
CREATE POLICY "Users can view own audit logs"
  ON audit_logs FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (TRUE);

-- Admin policies
CREATE POLICY "Admins can view all conversations"
  ON conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all messages"
  ON direct_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- ENABLE REALTIME
-- =====================================================
ALTER PUBLICATION supabase_realtime ADD TABLE direct_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE user_presence;
ALTER PUBLICATION supabase_realtime ADD TABLE conversation_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE message_read_receipts;
