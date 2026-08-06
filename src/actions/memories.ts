"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";

const createMemorySchema = z.object({
  date: z.string().min(1, "Tarih gerekli").refine((val) => {
    const selectedDate = new Date(val);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return selectedDate <= today;
  }, "Gelecekteki bir tarih seçemezsiniz."),
  title: z.string().min(1, "Başlık gerekli").max(255),
  description: z.string().optional(),
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
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const file = formData.get("photo") as File | null;
  let image_url: string | undefined = undefined;

  const supabase = createServerClient();

  if (file && file.size > 0) {
    if (file.size > 2 * 1024 * 1024) {
      return { error: "Fotoğraf boyutu 2MB'den küçük olmalıdır." };
    }
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `memory_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const storagePath = `memories/${session.userId}/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from("couples-media")
      .upload(storagePath, fileBuffer, {
        contentType: file.type || "image/jpeg",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return { error: "Fotoğraf yüklenirken hata oluştu: " + uploadError.message };
    }

    image_url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/couples-media/${storagePath}`;
  }

  if (id) {
    // Update existing
    const updateData: any = {
      date: parsed.data.date,
      title: parsed.data.title,
      description: parsed.data.description || null,
    };
    if (image_url) {
      updateData.image_url = image_url;
    }

    const { error } = await supabase
      .from("memories")
      .update(updateData)
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
      image_url: image_url || null,
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
