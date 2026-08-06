-- ============================================================
-- 018_device_auth_fixes.sql
-- ============================================================

CREATE OR REPLACE FUNCTION verify_device_otp(
  p_user_id INTEGER,
  p_device_id VARCHAR,
  p_code VARCHAR
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_otp_id INTEGER;
  v_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- 1. Kodun geçerliliğini kontrol et
  SELECT id, expires_at INTO v_otp_id, v_expires_at
  FROM otp_codes
  WHERE user_id = p_user_id AND code = p_code
  ORDER BY created_at DESC
  LIMIT 1;

  -- Kod yoksa veya süresi geçmişse false dön
  IF v_otp_id IS NULL OR v_expires_at < NOW() THEN
    RETURN FALSE;
  END IF;

  -- 2. Cihazı onayla
  UPDATE device_authorizations
  SET is_authorized = TRUE
  WHERE user_id = p_user_id AND device_id = p_device_id;

  -- 3. Kullanılmış kodu temizle
  DELETE FROM otp_codes WHERE id = v_otp_id;

  RETURN TRUE;
END;
$$;
