-- ============================================================
-- Couples Website — Seed Data
-- Run AFTER 001_schema.sql
-- ============================================================

-- Users (plain text passwords as per requirements)
INSERT INTO users (username, password, role) VALUES
    ('emirhan', 'Muharrem1071.', 'ADMIN'),
    ('oyku', '1234', 'USER')
ON CONFLICT (username) DO NOTHING;

-- Default memories (7 special dates)
INSERT INTO memories (date, title, description, is_default) VALUES
    ('2026-01-19', 'Tanıştık 💫', 'Her şeyin başladığı gün. İki yabancı, bir anda hayatlarını değiştirdi.', TRUE),
    ('2026-01-20', 'Öykü''nün Doğum Günü 🎂', 'En güzel günde doğmuş, en güzel insanın günü.', TRUE),
    ('2026-01-26', 'Sevgili Olduk 💕', 'Artık resmi olarak birlikte; kalbimiz tek attı.', TRUE),
    ('2026-02-14', 'Sevgililer Günü ❤️', 'Aşkı kutladığımız, birlikte geçirdiğimiz ilk Sevgililer Günü.', TRUE),
    ('2026-03-13', 'Emirhan''ın Doğum Günü 🎉', 'Dünyaya gelmesine şükredilen, hayatıma renk katan günün yıldönümü.', TRUE),
    ('2026-10-31', 'Halloween 🎃', 'Birlikte kostüm giyip eğlendiğimiz sihirli bir gece.', TRUE),
    ('2026-12-31', 'Yılbaşı 🎆', 'Yeni yıla birlikte merhaba; geçen yılı hep beraber uğurlayacağız.', TRUE)
ON CONFLICT DO NOTHING;
