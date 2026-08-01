"use server";

import { createServerClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { encrypt } from "@/utils/crypto";

export async function createLetterAction(
  prevState: { error?: string; success?: boolean },
  formData: FormData
) {
  const session = await getSession();
  if (!session) return { error: "Oturum süresi doldu." };

  const receiver_id = formData.get("receiver_id")?.toString();
  const title = formData.get("title")?.toString().trim();
  const content = formData.get("content")?.toString().trim();
  const unlock_date = formData.get("unlock_date")?.toString();

  if (!receiver_id || !title || !content || !unlock_date) {
    return { error: "Lütfen tüm alanları doldur." };
  }

  const supabase = createServerClient();

  const { error } = await supabase.from("letters").insert({
    sender_id: session.userId,
    receiver_id: parseInt(receiver_id),
    title,
    content: encrypt(content),
    unlock_date,
  });

  if (error) {
    console.error("Error creating letter:", error);
    return { error: "Mektup gönderilemedi, lütfen tekrar dene." };
  }

  revalidatePath("/admin/letters");
  return { success: true };
}

export async function deleteLetterAction(id: number) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Yetkisiz erişim." };

  const supabase = createServerClient();
  const { error } = await supabase.from("letters").delete().eq("id", id);

  if (error) {
    return { error: "Mektup silinirken hata oluştu." };
  }

  revalidatePath("/letters");
  revalidatePath("/admin/letters");
  return { success: true };
}

export async function editLetterAdminAction(id: number, content: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Yetkisiz erişim." };

  if (!content.trim()) {
    return { error: "Mektup içeriği boş olamaz." };
  }

  const supabase = createServerClient();
  const { error } = await supabase
    .from("letters")
    .update({ content: encrypt(content.trim()) })
    .eq("id", id);

  if (error) {
    return { error: "Mektup güncellenirken hata oluştu." };
  }

  revalidatePath("/letters");
  revalidatePath("/admin/letters");
  return { success: true };
}
