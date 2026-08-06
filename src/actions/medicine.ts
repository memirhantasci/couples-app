"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";
import { todayString } from "@/lib/date";

// ─── Zod Schema for Medicine ──────────────────────────────────────────────────
const medicineSchema = z.object({
  name: z.string().min(2, "İlaç adı en az 2 karakter olmalı."),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Geçersiz tarih formatı."),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Geçersiz tarih formatı."),
  times: z.array(z.string().regex(/^\d{2}:\d{2}$/, "Geçersiz saat formatı.")).min(1, "En az 1 alım saati eklenmeli."),
  is_partner: z.boolean().optional(),
});

// ─── Create Medicine (Admin only) ─────────────────────────────────────────────
export async function createMedicineAction(
  prevState: { error?: string; success?: boolean },
  formData: FormData
) {
  const session = await getSession();
  if (!session || !session.coupleId) return { error: "Yetkisiz erişim." };

  const rawTimes = formData.getAll("times").map((t) => (t as string).substring(0, 5)).filter(Boolean);
  // Support single 'time' fallback if passed instead of 'times'
  if (rawTimes.length === 0 && formData.get("time")) {
    rawTimes.push((formData.get("time") as string).substring(0, 5));
  }

  const rawData = {
    name: formData.get("name"),
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date"),
    times: rawTimes,
    is_partner: formData.get("is_partner") === "true",
  };

  const parsed = medicineSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const supabase = createServerClient();
  
  let targetUserId = session.userId;
  if (parsed.data.is_partner) {
    const { data: partner } = await supabase.from("users").select("id").eq("couple_id", session.coupleId).neq("id", session.userId).single();
    if (partner) {
      targetUserId = partner.id;
    } else {
      return { error: "Partner bulunamadı." };
    }
  }

  const sortedTimes = [...parsed.data.times].sort();
  const primaryTime = sortedTimes[0];

  const { error } = await supabase.from("medicines").insert({
    name: parsed.data.name,
    start_date: parsed.data.start_date,
    end_date: parsed.data.end_date,
    time: primaryTime,
    times: sortedTimes,
    user_id: targetUserId,
    is_active: true,
    couple_id: session.coupleId,
  });

  if (error) {
    console.error("Supabase insert error:", error);
    return { error: "İlaç eklenirken hata oluştu." };
  }

  revalidatePath("/medicine");
  revalidatePath("/admin");
  return { success: true };
}

// ─── Update Medicine Log (mark as DRANK or MISSED for a specific dose time) ───
export async function updateMedicineLogAction(
  medicineId: number,
  status: "DRANK" | "MISSED" | "PENDING",
  timeSlot?: string
) {
  const session = await getSession();
  if (!session || !session.coupleId) return { error: "Oturum bulunamadı." };

  const supabase = createServerClient();
  const today = todayString();

  // If timeSlot is not provided, fetch the medicine to get its primary time or default to 08:00
  let slotTime = timeSlot ? timeSlot.substring(0, 5) : "";
  if (!slotTime) {
    const { data: med } = await supabase
      .from("medicines")
      .select("time, times")
      .eq("id", medicineId)
      .single();
    if (med?.times && med.times.length > 0) {
      slotTime = med.times[0].substring(0, 5);
    } else if (med?.time) {
      slotTime = med.time.substring(0, 5);
    } else {
      slotTime = "08:00";
    }
  }

  const { data: existing } = await supabase
    .from("medicine_logs")
    .select("id")
    .eq("medicine_id", medicineId)
    .eq("date", today)
    .eq("user_id", session.userId)
    .eq("time", slotTime)
    .single();

  let error;
  if (existing) {
    const updatePayload = {
      status: status ?? "PENDING",
      taken_at: status === "DRANK" ? new Date().toISOString() : null,
    };
    const res = await supabase.from("medicine_logs").update(updatePayload).eq("id", existing.id);
    error = res.error;
  } else {
    const insertPayload = {
      user_id: session.userId ?? null,
      medicine_id: medicineId ?? null,
      date: today ?? null,
      time: slotTime ?? "08:00",
      status: status ?? "PENDING",
      taken_at: status === "DRANK" ? new Date().toISOString() : null,
      couple_id: session.coupleId ?? null,
    };
    const res = await supabase.from("medicine_logs").insert(insertPayload);
    error = res.error;
  }

  if (error) {
    return { error: "Kayıt güncellenirken hata oluştu." };
  }

  revalidatePath("/medicine");
  return { success: true };
}

// ─── Toggle Medicine Active Status (Admin only) ───────────────────────────────
export async function toggleMedicineActiveAction(id: number, isActive: boolean) {
  const session = await getSession();
  if (!session || !session.coupleId) {
    return { error: "Bu işlem için yetkiniz yok." };
  }

  const supabase = createServerClient();
  const { error } = await supabase
    .from("medicines")
    .update({ is_active: isActive })
    .eq("id", id)
    .eq("couple_id", session.coupleId);

  if (error) return { error: "Güncellenirken hata oluştu." };

  revalidatePath("/medicine");
  revalidatePath("/admin");
  return { success: true };
}

// ─── Delete Medicine (Admin only) ─────────────────────────────────────────────
export async function deleteMedicineAction(id: number) {
  const session = await getSession();
  if (!session || !session.coupleId) {
    return { error: "Bu işlem için yetkiniz yok." };
  }

  const supabase = createServerClient();
  const { error } = await supabase.from("medicines").delete().eq("id", id).eq("couple_id", session.coupleId);

  if (error) return { error: "Silinirken hata oluştu." };

  revalidatePath("/medicine");
  revalidatePath("/admin");
  return { success: true };
}

// ─── Edit Medicine (Admin only) ─────────────────────────────────────────────
export async function editMedicineAction(
  id: number,
  data: { name: string; start_date: string; end_date: string; times: string[]; user_id: number }
) {
  const session = await getSession();
  if (!session || !session.coupleId) return { error: "Yetkisiz erişim." };

  const parsed = medicineSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const sortedTimes = [...parsed.data.times].sort();
  const primaryTime = sortedTimes[0];

  const supabase = createServerClient();
  const { error } = await supabase
    .from("medicines")
    .update({
      name: parsed.data.name,
      start_date: parsed.data.start_date,
      end_date: parsed.data.end_date,
      time: primaryTime,
      times: sortedTimes,
      user_id: parsed.data.user_id,
    })
    .eq("id", id)
    .eq("couple_id", session.coupleId);

  if (error) {
    return { error: "İlaç güncellenirken hata oluştu." };
  }

  // Update today's logs if the number of doses hasn't changed to prevent losing today's progress
  const today = todayString();
  const { data: todayLogs } = await supabase
    .from("medicine_logs")
    .select("id, time")
    .eq("medicine_id", id)
    .eq("date", today)
    .order("time");

  if (todayLogs && todayLogs.length > 0 && todayLogs.length === sortedTimes.length) {
    for (let i = 0; i < todayLogs.length; i++) {
      if (todayLogs[i].time !== sortedTimes[i]) {
        await supabase
          .from("medicine_logs")
          .update({ time: sortedTimes[i] })
          .eq("id", todayLogs[i].id);
      }
    }
  }

  revalidatePath("/medicine");
  revalidatePath("/admin");
  return { success: true };
}
