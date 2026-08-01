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
