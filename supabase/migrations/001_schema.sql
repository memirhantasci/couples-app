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
