-- ============================================================
-- 014: Multi-Tenant Architecture (Couples / Pairing)
-- ============================================================

-- 1. Create couples table
CREATE TABLE IF NOT EXISTS couples (
    id SERIAL PRIMARY KEY,
    pairing_code VARCHAR(10) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Modify users table
ALTER TABLE users ADD COLUMN couple_id INTEGER REFERENCES couples(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_users_couple_id ON users(couple_id);

-- 3. Modify all data tables
ALTER TABLE medicines ADD COLUMN couple_id INTEGER REFERENCES couples(id) ON DELETE CASCADE;
ALTER TABLE medicine_logs ADD COLUMN couple_id INTEGER REFERENCES couples(id) ON DELETE CASCADE;
ALTER TABLE memories ADD COLUMN couple_id INTEGER REFERENCES couples(id) ON DELETE CASCADE;
ALTER TABLE daily_notes ADD COLUMN couple_id INTEGER REFERENCES couples(id) ON DELETE CASCADE;
ALTER TABLE moods ADD COLUMN couple_id INTEGER REFERENCES couples(id) ON DELETE CASCADE;
ALTER TABLE meetings ADD COLUMN couple_id INTEGER REFERENCES couples(id) ON DELETE CASCADE;
ALTER TABLE calendar_notes ADD COLUMN couple_id INTEGER REFERENCES couples(id) ON DELETE CASCADE;
ALTER TABLE photo_archive ADD COLUMN couple_id INTEGER REFERENCES couples(id) ON DELETE CASCADE;
ALTER TABLE letters ADD COLUMN couple_id INTEGER REFERENCES couples(id) ON DELETE CASCADE;

-- 4. Create Indexes for performance
CREATE INDEX IF NOT EXISTS idx_medicines_couple_id ON medicines(couple_id);
CREATE INDEX IF NOT EXISTS idx_medicine_logs_couple_id ON medicine_logs(couple_id);
CREATE INDEX IF NOT EXISTS idx_memories_couple_id ON memories(couple_id);
CREATE INDEX IF NOT EXISTS idx_daily_notes_couple_id ON daily_notes(couple_id);
CREATE INDEX IF NOT EXISTS idx_moods_couple_id ON moods(couple_id);
CREATE INDEX IF NOT EXISTS idx_meetings_couple_id ON meetings(couple_id);
CREATE INDEX IF NOT EXISTS idx_calendar_notes_couple_id ON calendar_notes(couple_id);
CREATE INDEX IF NOT EXISTS idx_photo_archive_couple_id ON photo_archive(couple_id);
CREATE INDEX IF NOT EXISTS idx_letters_couple_id ON letters(couple_id);

-- 5. Drop constraints that assume single-tenant
-- daily_notes and moods previously had UNIQUE(user_id, date). 
-- This is still fine since a user can only have one note/mood per day.
-- We keep them as is.

-- Disable RLS for couples table (since we use backend bypass)
ALTER TABLE couples DISABLE ROW LEVEL SECURITY;
