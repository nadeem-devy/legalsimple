-- Track when each user last read each conversation
CREATE TABLE IF NOT EXISTS chat_conversation_reads (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  conversation_key TEXT NOT NULL,
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, conversation_key)
);

-- Index for quick lookup by user
CREATE INDEX IF NOT EXISTS idx_chat_conversation_reads_user
  ON chat_conversation_reads(user_id);
