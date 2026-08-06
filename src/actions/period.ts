"use server";

import { createServerClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function togglePeriodLogAction(date: string) {
  const session = await getSession();
  if (!session) return { error: "Oturum bulunamadı." };

  const supabase = createServerClient();

  // Cinsiyeti DB'den çek — sadece kadın kullanıcılar regl takvimine veri girebilir
  const { data: userData } = await supabase
    .from("users")
    .select("gender")
    .eq("id", session.userId)
    .single();

  if (userData?.gender !== "female") {
    return { error: "Bu işlemi sadece kadın kullanıcılar yapabilir." };
  }

  // Check if log exists
  const { data: existing } = await supabase
    .from("period_logs")
    .select("id")
    .eq("user_id", session.userId)
    .eq("date", date)
    .single();

  if (existing) {
    // Delete
    const { error } = await supabase
      .from("period_logs")
      .delete()
      .eq("id", existing.id);
    if (error) return { error: "Kayıt silinirken hata oluştu: " + error.message };
  } else {
    // Check limit before insert
    const monthStart = date.substring(0, 8) + "01";
    const monthEnd = date.substring(0, 8) + "31";
    
    const { count } = await supabase
      .from("period_logs")
      .select("id", { count: 'exact' })
      .eq("user_id", session.userId)
      .gte("date", monthStart)
      .lte("date", monthEnd);

    if (count && count >= 2) {
      return { error: "Bir ay içerisinde en fazla 2 gün seçebilirsiniz." };
    }

    // Insert
    const { error } = await supabase
      .from("period_logs")
      .insert({
        user_id: session.userId,
        date: date,
      });
    if (error) return { error: "Kayıt eklenirken hata oluştu: " + error.message };
  }

  revalidatePath("/period-tracker");
  return { success: true };
}
