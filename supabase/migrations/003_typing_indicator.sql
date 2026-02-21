-- =====================================================
-- TYPING INDICATOR ENHANCEMENT
-- Adds conversation_key tracking for typing indicators
-- so typing status is scoped to a specific conversation
-- =====================================================

ALTER TABLE user_presence
  ADD COLUMN typing_conversation_key TEXT;

CREATE INDEX idx_presence_typing_conv
  ON user_presence(typing_conversation_key)
  WHERE is_typing = TRUE;
