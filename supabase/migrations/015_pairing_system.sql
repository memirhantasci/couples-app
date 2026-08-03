-- ============================================================
-- 015: Pairing System — Race-safe, derived is_paired
-- ============================================================

-- 1. Add member_count to couples (tracks how many users are in this couple)
ALTER TABLE couples ADD COLUMN IF NOT EXISTS member_count SMALLINT DEFAULT 0;

-- 2. is_paired: auto-derived from member_count, never set manually
ALTER TABLE couples ADD COLUMN IF NOT EXISTS is_paired BOOLEAN GENERATED ALWAYS AS (member_count >= 2) STORED;

-- 3. Backfill member_count for existing data
UPDATE couples SET member_count = (
  SELECT COUNT(*)::SMALLINT FROM users WHERE users.couple_id = couples.id
);

-- 4. Trigger: auto-update member_count when users.couple_id changes
CREATE OR REPLACE FUNCTION update_couple_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.couple_id IS NOT NULL THEN
    UPDATE couples SET member_count = member_count + 1 WHERE id = NEW.couple_id;
  ELSIF TG_OP = 'DELETE' AND OLD.couple_id IS NOT NULL THEN
    UPDATE couples SET member_count = member_count - 1 WHERE id = OLD.couple_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.couple_id IS DISTINCT FROM NEW.couple_id THEN
    IF OLD.couple_id IS NOT NULL THEN
      UPDATE couples SET member_count = member_count - 1 WHERE id = OLD.couple_id;
    END IF;
    IF NEW.couple_id IS NOT NULL THEN
      UPDATE couples SET member_count = member_count + 1 WHERE id = NEW.couple_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_couple_member_count ON users;
CREATE TRIGGER trg_update_couple_member_count
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW EXECUTE FUNCTION update_couple_member_count();

-- 5. Guard: max 2 members per couple (race-safe with row lock)
CREATE OR REPLACE FUNCTION enforce_couple_max_members()
RETURNS TRIGGER AS $$
DECLARE
  current_count SMALLINT;
BEGIN
  IF NEW.couple_id IS NOT NULL THEN
    SELECT member_count INTO current_count FROM couples WHERE id = NEW.couple_id FOR UPDATE;
    IF current_count >= 2 THEN
      RAISE EXCEPTION 'COUPLE_FULL: Bu eşleşme kodu artık kullanılamıyor.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_couple_max_members ON users;
CREATE TRIGGER trg_enforce_couple_max_members
BEFORE INSERT OR UPDATE ON users
FOR EACH ROW
WHEN (NEW.couple_id IS NOT NULL)
EXECUTE FUNCTION enforce_couple_max_members();

-- 6. RPC: Join couple by code — transaction + row lock, race-condition-safe
CREATE OR REPLACE FUNCTION join_couple_by_code(p_code TEXT, p_user_id INTEGER)
RETURNS TABLE(result_couple_id INTEGER, result_is_paired BOOLEAN) AS $$
DECLARE
  v_target_couple RECORD;
  v_old_couple_id INTEGER;
BEGIN
  -- Lock target couple row (serializes concurrent requests)
  SELECT * INTO v_target_couple FROM couples WHERE pairing_code = UPPER(p_code) FOR UPDATE;

  IF v_target_couple IS NULL THEN
    RAISE EXCEPTION 'INVALID_CODE: Girdiğiniz eşleşme kodu geçersiz veya kullanım dışıdır.';
  END IF;

  IF v_target_couple.member_count >= 2 THEN
    RAISE EXCEPTION 'CODE_ALREADY_USED: Bu eşleşme kodu daha önce kullanılmıştır.';
  END IF;

  -- Prevent user from entering their own code
  IF EXISTS (
    SELECT 1 FROM users WHERE id = p_user_id AND couple_id = v_target_couple.id
  ) THEN
    RAISE EXCEPTION 'SELF_CODE: Kendi eşleşme kodunuzu kullanamazsınız.';
  END IF;

  -- Get user's current (old) couple
  SELECT users.couple_id INTO v_old_couple_id FROM users WHERE id = p_user_id;

  -- Temporarily disable the enforce trigger for this transaction
  -- (we already checked manually with FOR UPDATE lock)
  ALTER TABLE users DISABLE TRIGGER trg_enforce_couple_max_members;

  -- Move user to new couple (trigger will update member_count automatically)
  UPDATE users SET couple_id = v_target_couple.id WHERE id = p_user_id;

  -- Re-enable the trigger
  ALTER TABLE users ENABLE TRIGGER trg_enforce_couple_max_members;

  -- Delete old couple if it's now empty
  IF v_old_couple_id IS NOT NULL AND v_old_couple_id != v_target_couple.id THEN
    DELETE FROM couples
    WHERE id = v_old_couple_id
      AND NOT EXISTS (SELECT 1 FROM users WHERE users.couple_id = v_old_couple_id);
  END IF;

  RETURN QUERY SELECT v_target_couple.id, (v_target_couple.member_count + 1) >= 2;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
