import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CalendarPageClient } from "@/components/calendar/CalendarPageClient";
import { dayjs } from "@/lib/date";
import { decrypt, deterministicDecrypt } from "@/utils/crypto";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Takvim — Emirhan & Öykü 💕",
};

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const supabase = createServerClient();

  const threeMonthsAgo = dayjs().subtract(1, "month").startOf("month").tz("Europe/Istanbul").format("YYYY-MM-DD");
  const twoMonthsLater = dayjs().add(2, "month").endOf("month").tz("Europe/Istanbul").format("YYYY-MM-DD");

  const [notesResult, moodsResult, photosResult] = await Promise.all([
    supabase
      .from("calendar_notes")
      .select("id, date, note, user:users(username, display_name)")
      .gte("date", threeMonthsAgo)
      .lte("date", twoMonthsLater)
      .order("date"),
    supabase
      .from("moods")
      .select("date, mood_type, user:users(username, display_name)")
      .gte("date", threeMonthsAgo)
      .lte("date", twoMonthsLater)
      .order("date"),
    supabase
      .from("photo_archive")
      .select(`
        id, user_id, image_url, storage_path, title, description,
        taken_date, taken_time, uploaded_at, exif_found, file_size,
        uploader:users(username, display_name)
      `)
      .order("taken_date", { ascending: false })
      .order("taken_time", { ascending: false }),
  ]);

  const notes = ((notesResult.data as any) ?? []).map((n: any) => ({
    ...n,
    user: { ...n.user, username: deterministicDecrypt(n.user?.username) || n.user?.username }
  }));
  
  const moods = (moodsResult.data ?? []).map((m: any) => ({
    ...m,
    user: { ...m.user, username: deterministicDecrypt(m.user?.username) || m.user?.username }
  }));

  const photos = ((photosResult.data as any[]) ?? []).map(p => ({
    ...p,
    title: p.title ? decrypt(p.title) : null,
    description: decrypt(p.description),
    uploader: { ...p.uploader, username: deterministicDecrypt(p.uploader?.username) || p.uploader?.username }
  }));

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        padding: "16px 16px 100px 16px",
        maxWidth: "512px",
        margin: "0 auto",
        background: "#0a0a0f",
        minHeight: "100%",
      }}
    >
      {/* ── HEADER ─── */}
      <div style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginTop: 8,
      }}>
        <div>
          <h1 style={{
            fontSize: 28,
            fontWeight: 800,
            color: "#ffffff",
            margin: 0,
            lineHeight: 1.2,
          }}>
            Takvim
          </h1>
          <p style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.4)",
            marginTop: 4,
          }}>
            Notlar, ruh halleri ve anılar
          </p>
        </div>

        <Link
          href="/photos/upload"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "10px 18px",
            borderRadius: 14,
            background: "#E8002D",
            color: "#fff",
            fontWeight: 700,
            fontSize: 13,
            textDecoration: "none",
            boxShadow: "0 4px 16px rgba(232,0,45,0.3)",
          }}
        >
          📤 Yükle
        </Link>
      </div>

      {/* ── CLIENT COMPONENT (Tabs + Calendar + Photos) ─── */}
      <CalendarPageClient
        notes={notes}
        moods={moods}
        photos={photos}
        currentUserId={session.userId}
        currentUsername={session.username}
      />
    </div>
  );
}
