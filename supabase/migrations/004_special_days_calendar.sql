-- ============================================================
-- Takvim Notlarına Kullanıcı Ekleme ve Özel Günleri Girme
-- ============================================================

-- 1. Takvim notlarının kim tarafından eklendiğini bilmek için user_id ekliyoruz
ALTER TABLE calendar_notes ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;

-- (İsteğe Bağlı) Mevcut notları temizliyoruz ki hata çıkmasın (çünkü user_id boş kalmasın, gerçi eski veri yoksa sorun olmaz)
TRUNCATE TABLE calendar_notes RESTART IDENTITY CASCADE;

-- 2. Anılar tablosunu temizleyip, kullanıcının istediği 'Özel Günler'i ekliyoruz.
TRUNCATE TABLE memories RESTART IDENTITY CASCADE;

INSERT INTO memories (date, title, description, image_url, is_default) VALUES 
('2026-01-19', '❤️ Tanıştık', 'İlk tanışmamız...', '', true),
('2026-01-20', '🎂 Öykü''nün Doğum Günü', 'İyi ki doğdun bebeğim!', '', true),
('2026-01-26', '💍 Sevgili Olduk', 'Birlikte güzel bir yola başladık.', '', true),
('2026-02-14', '❤️ Sevgililer Günü', 'İlk sevgililer günümüz.', '', true),
('2026-03-13', '🎂 Emirhan''ın Doğum Günü', 'İyi ki doğdun!', '', true),
('2026-10-31', '🎃 Halloween', 'Cadılar bayramı eğlencesi', '', true),
('2026-12-31', '🎆 Yılbaşı', 'Yeni yıla birlikte giriyoruz', '', true);
