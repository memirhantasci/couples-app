"use server";

import { getSession, destroySession, createSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// ─── Profil Güncelleme ────────────────────────────────────────────────────────

export interface ProfileState {
  error?: string;
  success?: string;
}

export async function updateProfileAction(
  prevState: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const session = await getSession();
  if (!session) return { error: "Oturum bulunamadı." };

  const displayName = (formData.get("displayName") as string)?.trim();
  const gender = formData.get("gender") as string;

  if (!displayName || displayName.length < 2) {
    return { error: "İsim en az 2 karakter olmalı." };
  }
  if (!["male", "female"].includes(gender)) {
    return { error: "Geçersiz cinsiyet seçimi." };
  }

  const supabase = createServerClient();

  const { error } = await supabase
    .from("users")
    .update({ display_name: displayName, gender })
    .eq("id", session.userId);

  if (error) return { error: "Profil güncellenirken hata oluştu: " + error.message };

  revalidatePath("/profile");
  return { success: "Profilin başarıyla güncellendi! 🎉" };
}

// ─── İlişki Tarihleri Güncelleme ─────────────────────────────────────────────

export async function updateCoupleDatesProfileAction(
  prevState: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const session = await getSession();
  if (!session) return { error: "Oturum bulunamadı." };
  if (!session.coupleId) return { error: "Çift bilgisi bulunamadı." };

  const meetDate = formData.get("meetDate") as string;
  const relationshipStartDate = formData.get("relationshipStartDate") as string;

  if (!meetDate || !relationshipStartDate) {
    return { error: "Her iki tarih de gereklidir." };
  }

  const supabase = createServerClient();

  const { error } = await supabase
    .from("couples")
    .update({ meet_date: meetDate, relationship_start_date: relationshipStartDate })
    .eq("id", session.coupleId);

  if (error) return { error: "Tarihler güncellenirken hata oluştu: " + error.message };

  revalidatePath("/profile");
  revalidatePath("/home");
  return { success: "İlişki tarihleri güncellendi! 💕" };
}

// ─── Çıkış Yap ───────────────────────────────────────────────────────────────

export async function logoutAction(): Promise<void> {
  const session = await getSession();

  if (session) {
    const supabase = createServerClient();
    // Logout logunu güncelle
    await supabase
      .from("login_logs")
      .update({ logout_at: new Date().toISOString() })
      .eq("id", session.loginLogId ?? 0);
  }

  await destroySession();
  redirect("/login");
}

// ─── Hesap Silme İsteği (1 Haftalık Grace Period) ────────────────────────────

export async function scheduleAccountDeletionAction(
  prevState: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const session = await getSession();
  if (!session) return { error: "Oturum bulunamadı." };

  const confirmed = formData.get("confirmed") === "yes";
  if (!confirmed) return { error: "Lütfen onay kutusunu işaretleyin." };

  const supabase = createServerClient();

  const deletionDate = new Date();
  deletionDate.setDate(deletionDate.getDate() + 7);

  const { error } = await supabase
    .from("couples")
    .update({ deletion_scheduled_at: deletionDate.toISOString() })
    .eq("id", session.coupleId);

  if (error) return { error: "Silme zamanlaması yapılırken hata oluştu: " + error.message };

  await destroySession();
  redirect("/login?deleted=scheduled");
}

// ─── Silme İptal Etme (Giriş Yaparken Çağrılacak) ───────────────────────────

export async function cancelDeletionIfScheduled(coupleId: number): Promise<void> {
  const supabase = createServerClient();
  await supabase
    .from("couples")
    .update({ deletion_scheduled_at: null })
    .eq("id", coupleId)
    .not("deletion_scheduled_at", "is", null);
}
