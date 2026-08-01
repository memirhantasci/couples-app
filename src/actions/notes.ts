"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";
import { todayString } from "@/lib/date";
import { encrypt } from "@/utils/crypto";

const noteSchema = z.object({
  content: z.string().min(1, "Not boş olamaz").max(2000, "En fazla 2000 karakter"),
});

export async function upsertDailyNoteAction(
  prevState: { error?: string; success?: boolean },
  formData: FormData
) {
  const session = await getSession();
  if (!session) return { error: "Oturum bulunamadı." };

  const parsed = noteSchema.safeParse({ content: formData.get("content") });
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const supabase = createServerClient();
  const today = todayString();

  const { error } = await supabase.from("daily_notes").upsert(
    {
      user_id: session.userId,
      date: today,
      content: encrypt(parsed.data.content),
    },
    {
      onConflict: "user_id,date",
    }
  );

  if (error) {
    return { error: "Not kaydedilirken hata oluştu." };
  }

  revalidatePath("/home");
  revalidatePath("/admin");
  return { success: true };
}

export async function deleteDailyNoteAction(id: number) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Yetkisiz erişim." };

  const supabase = createServerClient();
  const { error } = await supabase.from("daily_notes").delete().eq("id", id);

  if (error) {
    return { error: "Not silinirken hata oluştu." };
  }

  revalidatePath("/admin/daily-notes");
  return { success: true };
}

export async function editDailyNoteAdminAction(id: number, content: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Yetkisiz erişim." };

  const parsed = z.string().min(1, "Not boş olamaz").max(2000, "En fazla 2000 karakter").safeParse(content);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const supabase = createServerClient();
  const { error } = await supabase
    .from("daily_notes")
    .update({ content: encrypt(parsed.data) })
    .eq("id", id);

  if (error) {
    return { error: "Not güncellenirken hata oluştu." };
  }

  revalidatePath("/admin/daily-notes");
  return { success: true };
}

const moodSchema = z.object({
  mood_type: z.enum(["😍", "😊", "😐", "😔", "😢", "😴", "😄", "😃", "😣", "😡", "😠"]),
});

export async function upsertMoodAction(moodType: string) {
  const session = await getSession();
  if (!session) return { error: "Oturum bulunamadı." };

  const parsed = moodSchema.safeParse({ mood_type: moodType });
  if (!parsed.success) {
    return { error: "Geçersiz ruh hali." };
  }

  const supabase = createServerClient();
  const today = todayString();

  const { error } = await supabase.from("moods").upsert(
    {
      user_id: session.userId,
      date: today,
      mood_type: parsed.data.mood_type,
    },
    {
      onConflict: "user_id,date",
    }
  );

  if (error) {
    return { error: "Ruh hali kaydedilirken hata oluştu." };
  }

  revalidatePath("/home");
  revalidatePath("/admin");
  return { success: true };
}
