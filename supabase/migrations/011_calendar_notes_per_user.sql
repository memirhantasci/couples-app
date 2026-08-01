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
