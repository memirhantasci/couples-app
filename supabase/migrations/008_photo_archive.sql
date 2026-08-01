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
