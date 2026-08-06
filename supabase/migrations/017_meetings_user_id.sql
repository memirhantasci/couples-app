-- ============================================================
-- 017: Add user_id to meetings table
-- ============================================================

ALTER TABLE meetings ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_meetings_user_id ON meetings(user_id);
