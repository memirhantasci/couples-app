-- ============================================================
-- Veritabanı Temizliği (Kullanıcılar, İlaçlar ve Özel Günler Hariç)
-- ============================================================

-- users, medicines ve memories tabloları DIŞINDAKİ tüm tabloların verilerini siliyoruz.
TRUNCATE TABLE login_logs RESTART IDENTITY CASCADE;
TRUNCATE TABLE medicine_logs RESTART IDENTITY CASCADE;
TRUNCATE TABLE daily_notes RESTART IDENTITY CASCADE;
TRUNCATE TABLE moods RESTART IDENTITY CASCADE;
TRUNCATE TABLE meetings RESTART IDENTITY CASCADE;
TRUNCATE TABLE calendar_notes RESTART IDENTITY CASCADE;
TRUNCATE TABLE letters RESTART IDENTITY CASCADE;
