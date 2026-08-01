"use server";

import { createServerClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function togglePeriodLogAction(date: string) {
  const session = await getSession();
  if (!session) return { error: "Oturum bulunamadı." };

  const nameLower = session.displayName?.toLowerCase() || "";
  const isOyku = session.username === "oyku" || nameLower.includes("öykü") || nameLower.includes("oyku");
  if (!isOyku) {
    return { error: "Bu işlemi sadece Öykü yapabilir." };
  }

  const supabase = createServerClient();

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
