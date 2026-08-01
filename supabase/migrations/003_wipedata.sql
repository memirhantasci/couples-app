-- ============================================================
-- Temizlik ve Şema Güncellemesi (Kullanıcılar Hariç)
-- ============================================================

-- 1. Kullanıcılar dışındaki tüm tabloların içini boşaltıyoruz (Truncate)
-- TRUNCATE işlemini CASCADE ile yapmak, bağlı olan verileri de sorunsuzca siler.
TRUNCATE TABLE login_logs RESTART IDENTITY CASCADE;
TRUNCATE TABLE medicine_logs RESTART IDENTITY CASCADE;
TRUNCATE TABLE medicines RESTART IDENTITY CASCADE;
TRUNCATE TABLE memories RESTART IDENTITY CASCADE;
TRUNCATE TABLE daily_notes RESTART IDENTITY CASCADE;
TRUNCATE TABLE moods RESTART IDENTITY CASCADE;
TRUNCATE TABLE meetings RESTART IDENTITY CASCADE;
TRUNCATE TABLE calendar_notes RESTART IDENTITY CASCADE;
TRUNCATE TABLE letters RESTART IDENTITY CASCADE;

-- 2. İlaçlar tablosuna user_id sütunu ekliyoruz
-- Bu sayede bir ilacın Öykü'ye mi yoksa Emirhan'a mı ait olduğunu bileceğiz.
ALTER TABLE medicines ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;

-- (İsteğe Bağlı) Önceden var olmayan bir index ekleyerek performansı artırıyoruz
CREATE INDEX IF NOT EXISTS idx_medicines_user_id ON medicines(user_id);
