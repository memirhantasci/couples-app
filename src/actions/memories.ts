"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";

const createMemorySchema = z.object({
  date: z.string().min(1, "Tarih gerekli"),
  title: z.string().min(1, "Başlık gerekli").max(255),
  description: z.string().optional(),
  image_url: z.string().url().optional().or(z.literal("")),
});

export async function createMemoryAction(
  prevState: { error?: string; success?: boolean },
  formData: FormData
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { error: "Bu işlem için yetkiniz yok." };
  }

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
  const { error } = await supabase.from("memories").insert({
    date: parsed.data.date,
    title: parsed.data.title,
    description: parsed.data.description || null,
    image_url: parsed.data.image_url || null,
    is_default: false,
  });

  if (error) {
    return { error: "Anı eklenirken hata oluştu." };
  }

  revalidatePath("/memories");
  revalidatePath("/admin");
  return { success: true };
}

export async function deleteMemoryAction(id: number) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { error: "Bu işlem için yetkiniz yok." };
  }

  const supabase = createServerClient();
  const { error } = await supabase
    .from("memories")
    .delete()
    .eq("id", id)
    .eq("is_default", false); // Cannot delete default memories

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
