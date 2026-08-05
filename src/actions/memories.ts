"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";

const createMemorySchema = z.object({
  date: z.string().min(1, "Tarih gerekli").refine((val) => {
    const selectedDate = new Date(val);
    const today = new Date();
    // Allow up to the end of today
    today.setHours(23, 59, 59, 999);
    return selectedDate <= today;
  }, "Gelecekteki bir tarih seçemezsiniz."),
  title: z.string().min(1, "Başlık gerekli").max(255),
  description: z.string().optional(),
  image_url: z.string().url().optional().or(z.literal("")),
});

export async function saveMemoryAction(
  prevState: { error?: string; success?: boolean },
  formData: FormData
) {
  const session = await getSession();
  if (!session || !session.coupleId) {
    return { error: "Bu işlem için yetkiniz yok." };
  }

  const id = formData.get("id") ? parseInt(formData.get("id") as string, 10) : null;

  const parsed = createMemorySchema.safeParse({
    date: formData.get("date"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    image_url: formData.get("image_url") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const supabase = createServerClient();

  if (id) {
    // Update existing
    const { error } = await supabase
      .from("memories")
      .update({
        date: parsed.data.date,
        title: parsed.data.title,
        description: parsed.data.description || null,
        // image_url: parsed.data.image_url || null,
      })
      .eq("id", id)
      .eq("couple_id", session.coupleId)
      .neq("is_default", true);

    if (error) {
      return { error: "Anı güncellenirken hata oluştu." };
    }
  } else {
    // Create new
    const { error } = await supabase.from("memories").insert({
      date: parsed.data.date,
      title: parsed.data.title,
      description: parsed.data.description || null,
      image_url: parsed.data.image_url || null,
      is_default: false,
      couple_id: session.coupleId,
    });

    if (error) {
      return { error: "Anı eklenirken hata oluştu." };
    }
  }

  revalidatePath("/memories");
  return { success: true };
}

export const createMemoryAction = saveMemoryAction;
export const updateMemoryAction = saveMemoryAction;

export async function deleteMemoryAction(id: number) {
  const session = await getSession();
  if (!session || !session.coupleId) {
    return { error: "Bu işlem için yetkiniz yok." };
  }

  const supabase = createServerClient();
  const { error } = await supabase
    .from("memories")
    .delete()
    .eq("id", id)
    .eq("couple_id", session.coupleId)
    .neq("is_default", true); // Cannot delete default memories

  if (error) {
    return { error: "Anı silinirken hata oluştu." };
  }

  revalidatePath("/memories");
  return { success: true };
}

// Upload image to Supabase Storage and return public URL
export async function getSupabaseUploadUrl(filename: string): Promise<{ url?: string; error?: string }> {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { error: "Yetki yok." };
  }

  const supabase = createServerClient();
  const path = `memories/${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

  const { data } = await supabase.storage
    .from("couples-media")
    .createSignedUploadUrl(path);

  if (!data) return { error: "Upload URL oluşturulamadı." };

  return {
    url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/couples-media/${path}`,
  };
}
