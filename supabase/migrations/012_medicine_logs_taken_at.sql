-- ============================================================
-- İlaç içilme anı için zaman damgası ekleme
-- ============================================================

ALTER TABLE medicine_logs ADD COLUMN IF NOT EXISTS taken_at TIMESTAMP WITH TIME ZONE;
