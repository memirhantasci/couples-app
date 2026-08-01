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
