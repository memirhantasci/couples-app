import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileClient } from "@/components/profile/ProfileClient";

export const metadata: Metadata = {
  title: "Ayarlar — Couples App 💕",
  description: "Profil ve hesap ayarları",
};

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const supabase = createServerClient();

  // Güncel kullanıcı verilerini DB'den çek
  const { data: userData } = await supabase
    .from("users")
    .select("display_name, gender, username")
    .eq("id", session.userId)
    .single();

  // Çift tarihlerini çek
  const { data: coupleData } = session.coupleId
    ? await supabase
        .from("couples")
        .select("meet_date, relationship_start_date, deletion_scheduled_at")
        .eq("id", session.coupleId)
        .single()
    : { data: null };

  return (
    <ProfileClient
      initialDisplayName={userData?.display_name ?? session.displayName ?? ""}
      initialGender={(userData?.gender as "male" | "female") ?? "male"}
      initialMeetDate={coupleData?.meet_date ?? ""}
      initialRelationshipStartDate={coupleData?.relationship_start_date ?? ""}
      deletionScheduledAt={coupleData?.deletion_scheduled_at ?? null}
      isPaired={!!session.coupleId}
    />
  );
}
