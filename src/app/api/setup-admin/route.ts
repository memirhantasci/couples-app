import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { encrypt, deterministicEncrypt } from "@/utils/crypto";

// Bu route sadece admin kullanicisini olusturmak/sifresini sifirlamak icin kullanilir.
// Kullanim: GET /api/setup-admin?secret=kur2024
// PRODUCTION'DA SIL!

export async function GET(req: Request) {
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret");
  
  if (secret !== "kur2024") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const supabase = createServerClient();

  const username = "adminadmin";
  const password = "1234";
  const displayName = "Admin";

  const encryptedUsername = deterministicEncrypt(username);
  const encryptedPassword = encrypt(password);

  // Mevcut admin var mi kontrol et
  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("username", encryptedUsername)
    .single();

  if (existing) {
    // Sadece sifreyi guncelle
    const { error } = await supabase
      .from("users")
      .update({ password: encryptedPassword })
      .eq("id", existing.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Admin sifresi guncellendi! Kullanici: adminadmin | Sifre: 1234",
    });
  }

  // Yeni admin olustur
  const { error } = await supabase.from("users").insert({
    username: encryptedUsername,
    password: encryptedPassword,
    display_name: displayName,
    role: "ADMIN",
    email: null,
    couple_id: null,
    gender: "male",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    message: "Admin kullanicisi olusturuldu! Kullanici: adminadmin | Sifre: 1234",
  });
}
