-- 019_period_logs_couple_id.sql
-- Fix missing couple_id from period_logs

ALTER TABLE period_logs ADD COLUMN IF NOT EXISTS couple_id INTEGER REFERENCES couples(id) ON DELETE CASCADE;

-- Backfill existing data if needed by finding the user's couple_id
UPDATE period_logs
SET couple_id = users.couple_id
FROM users
WHERE period_logs.user_id = users.id
  AND period_logs.couple_id IS NULL;
