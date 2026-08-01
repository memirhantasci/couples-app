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
