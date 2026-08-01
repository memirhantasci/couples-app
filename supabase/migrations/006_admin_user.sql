-- ============================================================
-- Couples Website — Admin Kullanıcısı Oluşturma
-- ============================================================

-- DİKKAT: Bu kod "adminadmin" adında bir kullanıcı oluşturur.
-- Şifresini "secretpassword" kısmını değiştirerek belirleyebilirsiniz.
-- Sadece SQL üzerinden çalıştırılmalıdır.

INSERT INTO public.users (username, password, role)
VALUES ('adminadmin', 'secretpassword', 'ADMIN')
ON CONFLICT (username) 
DO UPDATE SET password = EXCLUDED.password;
