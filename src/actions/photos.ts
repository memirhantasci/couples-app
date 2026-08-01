"use server";

import { createServerClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { encrypt, encryptBuffer } from "@/utils/crypto";

export interface PhotoActionState {
  error?: string;
  success?: boolean;
}

export async function uploadPhotoAction(
  prevState: PhotoActionState,
  formData: FormData
): Promise<PhotoActionState> {
  const session = await getSession();
  if (!session) redirect("/login");

  const file = formData.get("photo") as File | null;
  const title = (formData.get("title") as string | null)?.trim() || null;
  const description = (formData.get("description") as string | null)?.trim();
  const takenDate = (formData.get("taken_date") as string | null)?.trim();
  const takenTime = (formData.get("taken_time") as string | null)?.trim() || null;
  const exifFound = formData.get("exif_found") === "true";

  if (!file || file.size === 0) {
    return { error: "Lütfen bir fotoğraf seçin." };
  }
  if (!description) {
    return { error: "Açıklama alanı zorunludur." };
  }
  if (!takenDate) {
    return { error: "Çekim tarihi zorunludur." };
  }

  const supabase = createServerClient();

  // Build storage path: photos/{user_id}/{year}/{month}/
  const date = new Date(takenDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const fileName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const storagePath = `photos/${session.userId}/${year}/${month}/${fileName}`;

  // Upload to Supabase Storage
  const arrayBuffer = await file.arrayBuffer();
  const fileBuffer = Buffer.from(arrayBuffer);
  
  // Encrypt the file buffer
  const encryptedFileBuffer = encryptBuffer(fileBuffer);

  const { error: uploadError } = await supabase.storage
    .from("photos")
    .upload(storagePath, encryptedFileBuffer, {
      contentType: "application/octet-stream", // It's encrypted binary now
      upsert: false,
    });

  if (uploadError) {
    console.error("Storage upload error:", uploadError);
    return { error: "Fotoğraf yüklenirken hata oluştu: " + uploadError.message };
  }

  // Save to database, leaving image_url temporary empty or placeholder
  const { data: dbData, error: dbError } = await supabase.from("photo_archive").insert({
    user_id: session.userId,
    image_url: "", // Will update in a second
    storage_path: storagePath,
    title: title ? encrypt(title) : null,
    description: encrypt(description),
    taken_date: takenDate,
    taken_time: takenTime || null,
    exif_found: exifFound,
    file_size: file.size,
  }).select("id").single();

  if (dbError || !dbData) {
    console.error("DB insert error:", dbError);
    await supabase.storage.from("photos").remove([storagePath]);
    return { error: "Veritabanına kaydedilirken hata oluştu: " + (dbError?.message || "") };
  }

  // Update image_url
  await supabase.from("photo_archive").update({
    image_url: `/api/photos/${dbData.id}`
  }).eq("id", dbData.id);

  revalidatePath("/photos");
  revalidatePath("/calendar");
  redirect("/photos");
}

export async function updatePhotoAction(
  prevState: PhotoActionState,
  formData: FormData
): Promise<PhotoActionState> {
  const session = await getSession();
  if (!session) redirect("/login");

  const photoId = formData.get("photo_id") as string;
  const title = (formData.get("title") as string | null)?.trim() || null;
  const description = (formData.get("description") as string | null)?.trim();
  const takenDate = (formData.get("taken_date") as string | null)?.trim();
  const takenTime = (formData.get("taken_time") as string | null)?.trim() || null;

  if (!photoId) return { error: "Fotoğraf ID eksik." };
  if (!description) return { error: "Açıklama alanı zorunludur." };
  if (!takenDate) return { error: "Çekim tarihi zorunludur." };

  const supabase = createServerClient();

  // Verify ownership
  const { data: photo } = await supabase
    .from("photo_archive")
    .select("user_id")
    .eq("id", photoId)
    .single();

  if (!photo || photo.user_id !== session.userId) {
    return { error: "Bu fotoğrafı düzenleme yetkiniz yok." };
  }

  const { error } = await supabase
    .from("photo_archive")
    .update({
      title: title ? encrypt(title) : null,
      description: encrypt(description),
      taken_date: takenDate,
      taken_time: takenTime || null,
    })
    .eq("id", photoId)
    .eq("user_id", session.userId);

  if (error) {
    return { error: "Güncellenirken hata oluştu: " + error.message };
  }

  revalidatePath("/photos");
  revalidatePath("/calendar");
  return { success: true };
}
