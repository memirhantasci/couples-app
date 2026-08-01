-- ============================================================
-- Add file_size to photo_archive
-- ============================================================

ALTER TABLE photo_archive ADD COLUMN IF NOT EXISTS file_size BIGINT DEFAULT 0;
