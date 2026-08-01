# Regl Takvimi Arayüzü İçin Unutulmaması Gerekenler

## 1. Yetki Kontrolü
- Eğer giriş yapan kişi Öykü değilse (`isOyku` false ise): "Bu tabloyu sadece Öykü güncelleyebilir." uyarısı (toast.error) verilmeli ve işlem engellenmeli.

## 2. Kural / Limitler
- Bir ay içinde en fazla 2 kayıt eklenebilir. Eğer aynı ay içinde 3. bir kayıt eklenmeye çalışılırsa: "Bir ay içerisinde en fazla 2 gün seçebilirsiniz." (toast.error) verilmeli.

## 3. Pop-up (Modal) Metinleri
- **Yeni Kayıt Eklerken:** "Sıkıntılı günler başladı mı?" (Evet / İptal butonları)
- **Kayıt Silerken:** "Bu günkü kaydı silmek istediğine emin misin?" (Kaydı Sil / İptal butonları)

## 4. Başarılı İşlem (Toast) Mesajları
- **Ekleme Başarılı:** "Regl günü kaydedildi. ❤️"
- **Silme Başarılı:** "Kayıt silindi."

## 5. Diğer UI Metinleri
- "Geçmiş Kayıtlar" başlığı.
- "Henüz hiç regl kaydı bulunmuyor." (Eğer hiç kayıt yoksa).
