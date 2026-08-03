-- ============================================================
-- Couples Website — Full Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Users table (custom auth, no Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL, -- plain text as per requirements
    role VARCHAR(20) NOT NULL DEFAULT 'USER', -- 'ADMIN' or 'USER'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Login logs for admin dashboard
CREATE TABLE IF NOT EXISTS login_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    logout_at TIMESTAMP WITH TIME ZONE,
    session_duration INTEGER, -- seconds
    ip_address VARCHAR(45),
    browser VARCHAR(100),
    operating_system VARCHAR(100),
    device_type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medicines
CREATE TABLE IF NOT EXISTS medicines (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    time TIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medicine logs (daily tracking)
CREATE TABLE IF NOT EXISTS medicine_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    medicine_id INTEGER REFERENCES medicines(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- 'DRANK', 'MISSED', 'PENDING'
    UNIQUE(medicine_id, date, user_id)
);

-- Memories / Timeline
CREATE TABLE IF NOT EXISTS memories (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily notes — one per user per day (PRD fix: UNIQUE on user_id + date)
CREATE TABLE IF NOT EXISTS daily_notes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Moods — one per user per day (PRD fix: UNIQUE on user_id + date)
CREATE TABLE IF NOT EXISTS moods (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    mood_type VARCHAR(50) NOT NULL, -- '😍', '😊', '😐', '😔', '😢', '😴'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Meeting countdowns (admin sets, everyone sees)
CREATE TABLE IF NOT EXISTS meetings (
    id SERIAL PRIMARY KEY,
    meeting_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    title VARCHAR(255) DEFAULT 'Buluşma',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Calendar notes
CREATE TABLE IF NOT EXISTS calendar_notes (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    note TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- Indexes for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_login_logs_user_id ON login_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_login_logs_login_at ON login_logs(login_at DESC);
CREATE INDEX IF NOT EXISTS idx_medicine_logs_medicine_date ON medicine_logs(medicine_id, date);
CREATE INDEX IF NOT EXISTS idx_medicine_logs_user_date ON medicine_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_notes_user_date ON daily_notes(user_id, date);
CREATE INDEX IF NOT EXISTS idx_moods_user_date ON moods(user_id, date);
CREATE INDEX IF NOT EXISTS idx_memories_date ON memories(date);
CREATE INDEX IF NOT EXISTS idx_calendar_notes_date ON calendar_notes(date);

-- ============================================================
-- Disable Row Level Security for all tables
-- (Custom auth via HttpOnly cookies — no Supabase Auth)
-- ============================================================
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE login_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE medicines DISABLE ROW LEVEL SECURITY;
ALTER TABLE medicine_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE memories DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE moods DISABLE ROW LEVEL SECURITY;
ALTER TABLE meetings DISABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_notes DISABLE ROW LEVEL SECURITY;
-- ============================================================
-- Couples Website — Letters (Time Capsule) Schema
-- Run this in Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS letters (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    unlock_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance when fetching a user's letters
CREATE INDEX IF NOT EXISTS idx_letters_receiver_id ON letters(receiver_id);
CREATE INDEX IF NOT EXISTS idx_letters_sender_id ON letters(sender_id);

-- Disable Row Level Security
ALTER TABLE letters DISABLE ROW LEVEL SECURITY;
-- ============================================================
-- Temizlik ve Şema Güncellemesi (Kullanıcılar Hariç)
-- ============================================================

-- 1. Kullanıcılar dışındaki tüm tabloların içini boşaltıyoruz (Truncate)
-- TRUNCATE işlemini CASCADE ile yapmak, bağlı olan verileri de sorunsuzca siler.
TRUNCATE TABLE login_logs RESTART IDENTITY CASCADE;
TRUNCATE TABLE medicine_logs RESTART IDENTITY CASCADE;
TRUNCATE TABLE medicines RESTART IDENTITY CASCADE;
TRUNCATE TABLE memories RESTART IDENTITY CASCADE;
TRUNCATE TABLE daily_notes RESTART IDENTITY CASCADE;
TRUNCATE TABLE moods RESTART IDENTITY CASCADE;
TRUNCATE TABLE meetings RESTART IDENTITY CASCADE;
TRUNCATE TABLE calendar_notes RESTART IDENTITY CASCADE;
TRUNCATE TABLE letters RESTART IDENTITY CASCADE;

-- 2. İlaçlar tablosuna user_id sütunu ekliyoruz
-- Bu sayede bir ilacın Öykü'ye mi yoksa Emirhan'a mı ait olduğunu bileceğiz.
ALTER TABLE medicines ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;

-- (İsteğe Bağlı) Önceden var olmayan bir index ekleyerek performansı artırıyoruz
CREATE INDEX IF NOT EXISTS idx_medicines_user_id ON medicines(user_id);
-- ============================================================
-- Takvim Notlarına Kullanıcı Ekleme ve Özel Günleri Girme
-- ============================================================

-- 1. Takvim notlarının kim tarafından eklendiğini bilmek için user_id ekliyoruz
ALTER TABLE calendar_notes ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;

-- (İsteğe Bağlı) Mevcut notları temizliyoruz ki hata çıkmasın (çünkü user_id boş kalmasın, gerçi eski veri yoksa sorun olmaz)
TRUNCATE TABLE calendar_notes RESTART IDENTITY CASCADE;

-- 2. Anılar tablosunu temizleyip, kullanıcının istediği 'Özel Günler'i ekliyoruz.
TRUNCATE TABLE memories RESTART IDENTITY CASCADE;

INSERT INTO memories (date, title, description, image_url, is_default) VALUES 
('2026-01-19', '❤️ Tanıştık', 'İlk tanışmamız...', '', true),
('2026-01-20', '🎂 Öykü''nün Doğum Günü', 'İyi ki doğdun bebeğim!', '', true),
('2026-01-26', '💍 Sevgili Olduk', 'Birlikte güzel bir yola başladık.', '', true),
('2026-02-14', '❤️ Sevgililer Günü', 'İlk sevgililer günümüz.', '', true),
('2026-03-13', '🎂 Emirhan''ın Doğum Günü', 'İyi ki doğdun!', '', true),
('2026-10-31', '🎃 Halloween', 'Cadılar bayramı eğlencesi', '', true),
('2026-12-31', '🎆 Yılbaşı', 'Yeni yıla birlikte giriyoruz', '', true);
-- ============================================================
-- Veritabanı Temizliği (Kullanıcılar, İlaçlar ve Özel Günler Hariç)
-- ============================================================

-- users, medicines ve memories tabloları DIŞINDAKİ tüm tabloların verilerini siliyoruz.
TRUNCATE TABLE login_logs RESTART IDENTITY CASCADE;
TRUNCATE TABLE medicine_logs RESTART IDENTITY CASCADE;
TRUNCATE TABLE daily_notes RESTART IDENTITY CASCADE;
TRUNCATE TABLE moods RESTART IDENTITY CASCADE;
TRUNCATE TABLE meetings RESTART IDENTITY CASCADE;
TRUNCATE TABLE calendar_notes RESTART IDENTITY CASCADE;
TRUNCATE TABLE letters RESTART IDENTITY CASCADE;
-- ============================================================
-- Couples Website — Admin Kullanıcısı Oluşturma
-- ============================================================

-- DİKKAT: Bu kod "adminadmin" adında bir kullanıcı oluşturur.
-- Şifresini "secretpassword" kısmını değiştirerek belirleyebilirsiniz.
-- Sadece SQL üzerinden çalıştırılmalıdır.

INSERT INTO public.users (username, password, role)
VALUES ('adminadmin', 'secretpassword', 'ADMIN')
ON CONFLICT (username) 
DO UPDATE SET password = EXCLUDED.password;
-- ============================================================
-- Add display_name to users
-- ============================================================

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS display_name VARCHAR(100);

-- Update existing users to have a display_name (fallback to username)
UPDATE users
SET display_name = CASE
    WHEN username = 'adminadmin' THEN 'Admin'
    WHEN username = 'emirhan' THEN 'Emirhan'
    WHEN username = 'oyku' THEN 'Öykü'
    ELSE INITCAP(username)
END
WHERE display_name IS NULL;
-- ============================================================
-- Photo Archive Table
-- ============================================================

CREATE TABLE IF NOT EXISTS photo_archive (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  image_url     TEXT NOT NULL,
  storage_path  TEXT NOT NULL,
  title         TEXT,
  description   TEXT NOT NULL,
  taken_date    DATE NOT NULL,
  taken_time    TIME,
  exif_found    BOOLEAN DEFAULT false,
  uploaded_at   TIMESTAMPTZ DEFAULT NOW(),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Index for date-based queries
CREATE INDEX IF NOT EXISTS photo_archive_taken_date_idx ON photo_archive(taken_date);
CREATE INDEX IF NOT EXISTS photo_archive_user_id_idx ON photo_archive(user_id);
-- Create period_logs table
CREATE TABLE IF NOT EXISTS period_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(user_id, date)
);

-- Disable Row Level Security (custom auth via HttpOnly cookies)
ALTER TABLE period_logs DISABLE ROW LEVEL SECURITY;
-- ============================================================
-- Add file_size to photo_archive
-- ============================================================

ALTER TABLE photo_archive ADD COLUMN IF NOT EXISTS file_size BIGINT DEFAULT 0;
-- ============================================================
-- Takvim Notları: Her kullanıcı aynı tarihe kendi notunu ekleyebilsin
-- ============================================================

-- Varsa sadece date üzerindeki unique constraint'i kaldır
DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  SELECT con.conname INTO constraint_name
  FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
  WHERE rel.relname = 'calendar_notes'
    AND con.contype = 'u'
    AND array_length(con.conkey, 1) = 1
    AND (
      SELECT attname FROM pg_attribute
      WHERE attrelid = rel.oid AND attnum = con.conkey[1]
    ) = 'date';

  IF constraint_name IS NOT NULL THEN
    EXECUTE 'ALTER TABLE calendar_notes DROP CONSTRAINT ' || quote_ident(constraint_name);
  END IF;
END $$;

-- (date, user_id) çifti için unique constraint ekle (yoksa)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    WHERE rel.relname = 'calendar_notes'
      AND con.contype = 'u'
      AND con.conname = 'uq_calendar_notes_date_user'
  ) THEN
    ALTER TABLE calendar_notes
      ADD CONSTRAINT uq_calendar_notes_date_user UNIQUE (date, user_id);
  END IF;
END $$;
-- ============================================================
-- İlaç içilme anı için zaman damgası ekleme
-- ============================================================

ALTER TABLE medicine_logs ADD COLUMN IF NOT EXISTS taken_at TIMESTAMP WITH TIME ZONE;
-- Migration: Multi-dose support for medicines and medicine_logs

-- 1. Add times array column to medicines table
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS times TEXT[] DEFAULT ARRAY[]::TEXT[];

-- 2. Populate existing medicines with their single time value into times array if empty
UPDATE medicines 
SET times = ARRAY[substring(time::text from 1 for 5)] 
WHERE times IS NULL OR cardinality(times) = 0;

-- 3. Add time column to medicine_logs table to track specific dose slot
ALTER TABLE medicine_logs ADD COLUMN IF NOT EXISTS time VARCHAR(10);

-- 4. Update existing medicine_logs with the medicine's primary time if null
UPDATE medicine_logs ml
SET time = substring(m.time::text from 1 for 5)
FROM medicines m
WHERE ml.medicine_id = m.id AND (ml.time IS NULL OR ml.time = '');

-- Default any remaining nulls to '08:00'
UPDATE medicine_logs SET time = '08:00' WHERE time IS NULL OR time = '';

-- 5. Update unique index/constraint for medicine_logs
ALTER TABLE medicine_logs DROP CONSTRAINT IF EXISTS medicine_logs_medicine_id_date_user_id_key;

DROP INDEX IF EXISTS idx_medicine_logs_med_date_user_time;
CREATE UNIQUE INDEX IF NOT EXISTS idx_medicine_logs_med_date_user_time 
ON medicine_logs(medicine_id, date, user_id, time);
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

-- ============================================================
-- 015: Pairing System — Race-safe, derived is_paired
-- ============================================================

-- 1. Add member_count to couples
ALTER TABLE couples ADD COLUMN IF NOT EXISTS member_count SMALLINT DEFAULT 0;

-- 2. is_paired: auto-derived from member_count
ALTER TABLE couples ADD COLUMN IF NOT EXISTS is_paired BOOLEAN GENERATED ALWAYS AS (member_count >= 2) STORED;

-- 3. Backfill member_count for existing data
UPDATE couples SET member_count = (
  SELECT COUNT(*)::SMALLINT FROM users WHERE users.couple_id = couples.id
);

-- 4. Trigger: auto-update member_count
CREATE OR REPLACE FUNCTION update_couple_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.couple_id IS NOT NULL THEN
    UPDATE couples SET member_count = member_count + 1 WHERE id = NEW.couple_id;
  ELSIF TG_OP = 'DELETE' AND OLD.couple_id IS NOT NULL THEN
    UPDATE couples SET member_count = member_count - 1 WHERE id = OLD.couple_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.couple_id IS DISTINCT FROM NEW.couple_id THEN
    IF OLD.couple_id IS NOT NULL THEN
      UPDATE couples SET member_count = member_count - 1 WHERE id = OLD.couple_id;
    END IF;
    IF NEW.couple_id IS NOT NULL THEN
      UPDATE couples SET member_count = member_count + 1 WHERE id = NEW.couple_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_couple_member_count ON users;
CREATE TRIGGER trg_update_couple_member_count
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW EXECUTE FUNCTION update_couple_member_count();

-- 5. Guard: max 2 members per couple
CREATE OR REPLACE FUNCTION enforce_couple_max_members()
RETURNS TRIGGER AS $$
DECLARE
  current_count SMALLINT;
BEGIN
  IF NEW.couple_id IS NOT NULL THEN
    SELECT member_count INTO current_count FROM couples WHERE id = NEW.couple_id FOR UPDATE;
    IF current_count >= 2 THEN
      RAISE EXCEPTION 'COUPLE_FULL: Bu eşleşme kodu artık kullanılamıyor.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_couple_max_members ON users;
CREATE TRIGGER trg_enforce_couple_max_members
BEFORE INSERT OR UPDATE ON users
FOR EACH ROW
WHEN (NEW.couple_id IS NOT NULL)
EXECUTE FUNCTION enforce_couple_max_members();

-- 6. RPC: Join couple by code — race-condition-safe
CREATE OR REPLACE FUNCTION join_couple_by_code(p_code TEXT, p_user_id INTEGER)
RETURNS TABLE(result_couple_id INTEGER, result_is_paired BOOLEAN) AS $$
DECLARE
  v_target_couple RECORD;
  v_old_couple_id INTEGER;
BEGIN
  SELECT * INTO v_target_couple FROM couples WHERE pairing_code = UPPER(p_code) FOR UPDATE;

  IF v_target_couple IS NULL THEN
    RAISE EXCEPTION 'INVALID_CODE: Girdiğiniz eşleşme kodu geçersiz veya kullanım dışıdır.';
  END IF;

  IF v_target_couple.member_count >= 2 THEN
    RAISE EXCEPTION 'CODE_ALREADY_USED: Bu eşleşme kodu daha önce kullanılmıştır.';
  END IF;

  IF EXISTS (
    SELECT 1 FROM users WHERE id = p_user_id AND couple_id = v_target_couple.id
  ) THEN
    RAISE EXCEPTION 'SELF_CODE: Kendi eşleşme kodunuzu kullanamazsınız.';
  END IF;

  SELECT users.couple_id INTO v_old_couple_id FROM users WHERE id = p_user_id;

  ALTER TABLE users DISABLE TRIGGER trg_enforce_couple_max_members;
  UPDATE users SET couple_id = v_target_couple.id WHERE id = p_user_id;
  ALTER TABLE users ENABLE TRIGGER trg_enforce_couple_max_members;

  IF v_old_couple_id IS NOT NULL AND v_old_couple_id != v_target_couple.id THEN
    DELETE FROM couples
    WHERE id = v_old_couple_id
      AND NOT EXISTS (SELECT 1 FROM users WHERE users.couple_id = v_old_couple_id);
  END IF;

  RETURN QUERY SELECT v_target_couple.id, (v_target_couple.member_count + 1) >= 2;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
