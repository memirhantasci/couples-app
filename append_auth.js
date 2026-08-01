const fs = require('fs');

const codeToAppend = `

export async function verifyResetAction(prevState: any, formData: FormData) {
  const code = formData.get("code") as string;
  const { cookies } = require("next/headers");
  const cookieStore = await cookies();
  const userId = cookieStore.get("pending_reset_user_id")?.value;
  const newHash = cookieStore.get("pending_reset_hash")?.value;

  if (!userId || !newHash) {
    return { error: "Oturum süresi dolmuş. Lütfen şifre sıfırlama işlemini baştan başlatın." };
  }
  if (!code || code.length !== 6) {
    return { error: "Geçersiz kod." };
  }

  const { createServerClient } = require("@/utils/supabase/server");
  const supabase = createServerClient();
  
  const { data: otpRecords } = await supabase
    .from("otp_codes")
    .select("*")
    .eq("user_id", userId)
    .eq("is_used", false)
    .gte("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });

  if (!otpRecords || otpRecords.length === 0) {
    return { error: "Geçersiz veya süresi dolmuş kod." };
  }

  const isValidCode = otpRecords.some((r: any) => r.code === code);
  
  if (!isValidCode) {
    return { error: "Kod hatalı." };
  }

  // Update Password
  const { error: updateError } = await supabase
    .from("users")
    .update({ password: newHash })
    .eq("id", userId);

  if (updateError) {
    return { error: "Şifre güncellenirken bir hata oluştu." };
  }

  // Mark OTP used
  await supabase
    .from("otp_codes")
    .update({ is_used: true })
    .eq("id", otpRecords[0].id);

  cookieStore.delete("pending_reset_user_id");
  cookieStore.delete("pending_reset_hash");
  
  const { redirect } = require("next/navigation");
  redirect("/login?reset=success");
}
`;

fs.appendFileSync('src/actions/auth.ts', codeToAppend, 'utf8');
console.log("Appended successfully");
