"use server";

import { createServerClient } from "@/lib/supabase/server";
import { getSession, createSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export async function updateCoupleDatesAction(prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session || !session.coupleId) {
    return { error: "Yetkisiz işlem veya eşleşme bulunamadı." };
  }

  const meetDate = formData.get("meetDate") as string;
  const relationshipStartDate = formData.get("relationshipStartDate") as string;

  if (!meetDate || !relationshipStartDate) {
    return { error: "Lütfen her iki tarihi de giriniz." };
  }

  const meet = new Date(meetDate);
  const relStart = new Date(relationshipStartDate);
  const now = new Date();

  // Reset hours to compare dates only
  now.setHours(23, 59, 59, 999);

  if (meet > now || relStart > now) {
    return { error: "Gelecek bir tarih seçemezsiniz." };
  }

  if (meet > relStart) {
    return { error: "Tanışma tarihi, sevgili olma tarihinden sonra olamaz." };
  }

  const supabase = createServerClient();

  // Check if dates are already set by the partner
  const { data: couple, error: coupleError } = await supabase
    .from("couples")
    .select("meet_date, relationship_start_date")
    .eq("id", session.coupleId)
    .single();

  if (coupleError) {
    return { error: "Eşleşme bilgileri alınırken hata oluştu." };
  }

  // If partner already set the dates, skip updating and just redirect to home
  if (!couple.meet_date && !couple.relationship_start_date) {
    const { error } = await supabase
      .from("couples")
      .update({
        meet_date: meetDate,
        relationship_start_date: relationshipStartDate,
      })
      .eq("id", session.coupleId);

    if (error) {
      return { error: "Tarihler kaydedilirken bir hata oluştu." };
    }
  }

  // Update session to reflect the new dates so they don't see the setup screen again
  await createSession({
    userId: session.userId,
    coupleId: session.coupleId,
    isPaired: session.isPaired,
    username: session.username,
    displayName: session.displayName,
    role: session.role,
    loginDate: session.loginDate,
    loginLogId: session.loginLogId,
  });

  return { redirectUrl: "/home" };
}
