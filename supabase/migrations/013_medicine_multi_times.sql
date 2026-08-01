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
