import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { encrypt, deterministicEncrypt, decrypt } from "@/utils/crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;
    const supabase = createServerClient();

    if (action === "login") {
      const { username, password } = body;
      const encryptedUsername = deterministicEncrypt(username.trim().toLowerCase());

      const { data: user, error } = await supabase
        .from("users")
        .select("id, password")
        .eq("username", encryptedUsername)
        .single();

      if (error || !user) {
        return NextResponse.json({ error: "Kullanıcı adı veya şifre hatalı." }, { status: 400 });
      }

      let isPasswordValid = false;
      if (user.password.startsWith("enc:")) {
        isPasswordValid = decrypt(user.password) === password.trim();
      } else {
        isPasswordValid = user.password === password.trim();
      }

      if (!isPasswordValid) {
        return NextResponse.json({ error: "Kullanıcı adı veya şifre hatalı." }, { status: 400 });
      }

      return NextResponse.json({ success: true, userId: user.id });
    }

    if (action === "register") {
      const { displayName, username, email, password, gender, pairingCode } = body;
      const encryptedUsername = deterministicEncrypt(username.trim().toLowerCase());

      const { data: existing } = await supabase
        .from("users")
        .select("id")
        .eq("username", encryptedUsername)
        .single();

      if (existing) {
        return NextResponse.json({ error: "Bu kullanıcı adı zaten alınmış." }, { status: 400 });
      }

      let coupleIdToAssign = null;
      if (pairingCode) {
        const { data: coupleFound } = await supabase
          .from("couples")
          .select("id")
          .eq("pairing_code", pairingCode)
          .single();
        if (!coupleFound) {
          return NextResponse.json({ error: "Girdiğiniz eşleşme kodu geçersiz." }, { status: 400 });
        }
        coupleIdToAssign = coupleFound.id;
      } else {
        const generatedCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const { data: newCouple } = await supabase
          .from("couples")
          .insert({ pairing_code: generatedCode })
          .select("id")
          .single();
        if (newCouple) coupleIdToAssign = newCouple.id;
      }

      const hashedPassword = encrypt(password.trim());
      const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert({
          display_name: displayName,
          username: encryptedUsername,
          email: deterministicEncrypt(email.trim().toLowerCase()),
          password: hashedPassword,
          role: "USER",
          gender: gender,
          couple_id: coupleIdToAssign
        })
        .select("id")
        .single();

      if (insertError || !newUser) {
        return NextResponse.json({ error: "Kayıt olurken hata oluştu." }, { status: 400 });
      }

      return NextResponse.json({ success: true, userId: newUser.id });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
