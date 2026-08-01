import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getTodayHitap, daysSince, getLoveMeter, dayOfYear, todayString, dayjs } from "@/lib/date";
import { decrypt, deterministicDecrypt } from "@/utils/crypto";
import { getQuoteForDay } from "@/lib/quotes";
import { MeetingCountdown } from "@/components/home/MeetingCountdown";
import { LoveMeter } from "@/components/home/LoveMeter";
import { MoodSelector } from "@/components/home/MoodSelector";
import { DailyNoteCard } from "@/components/home/DailyNoteCard";
import { PendingLettersCard } from "@/components/home/PendingLettersCard";

export const metadata: Metadata = {
  title: "Ana Sayfa — Emirhan & Öykü 💕",
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const supabase = createServerClient();
  const today = todayString();
  const doy = dayOfYear();

  const [moodResult, noteResult, meetingResult, pendingLettersResult] = await Promise.all([
    supabase
      .from("moods")
      .select("mood_type")
      .eq("user_id", session.userId)
      .eq("date", today)
      .single(),
    supabase
      .from("daily_notes")
      .select("content")
      .eq("user_id", session.userId)
      .eq("date", today)
      .single(),
    supabase
      .from("meetings")
      .select("id, meeting_datetime, title")
      .eq("is_active", true)
      .order("meeting_datetime", { ascending: true })
      .limit(1)
      .single(),
    supabase
      .from("letters")
      .select("id, unlock_date, sender:users!letters_sender_id_fkey(username, display_name)")
      .eq("receiver_id", session.userId)
      .gt("unlock_date", today)
      .order("unlock_date", { ascending: true }),
  ]);

  const hitap = getTodayHitap();
  const daysSinceMeeting = daysSince(dayjs("2026-01-19"));
  const daysSinceTogether = daysSince(dayjs("2026-01-26"));
  const loveMeter = getLoveMeter();
  const quote = getQuoteForDay(doy);
  const currentMood = moodResult.data?.mood_type ?? null;
  const currentNote = noteResult.data?.content ? decrypt(noteResult.data.content) : null;
  const activeMeeting = meetingResult.data;
  const pendingLetters = ((pendingLettersResult.data as any[]) ?? []).map(l => ({
    ...l,
    sender: { ...l.sender, username: deterministicDecrypt(l.sender?.username) || l.sender?.username }
  }));
  const dateStr = dayjs().locale("tr").format("DD MMMM dddd").toUpperCase();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "16px 16px 100px 16px", maxWidth: "512px", margin: "0 auto" }}>

      {/* ── HERO CARD ─────────────────────────────────── */}
      <div style={{
        background: "#181a20",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "20px",
        padding: "20px",
        display: "flex",
        flexDirection: "row",
        alignItems: "stretch",
        justifyContent: "space-between",
        gap: "12px",
      }}>
        {/* Sol: tarih + selamlama */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <p style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", marginBottom: "6px" }}>
            {dateStr}
          </p>
          <h1 style={{ fontSize: "24px", fontWeight: 700, lineHeight: 1.2, color: "#fff", margin: 0 }}>
            Günaydın,<br />{hitap} <span style={{ fontSize: "20px" }}>❤️</span>
          </h1>
        </div>

        {/* Sağ: sayaçlar */}
        <div style={{ display: "flex", gap: "8px", alignItems: "stretch" }}>
          <div style={{
            border: "2px solid #C4A15A",
            background: "rgba(196,161,90,0.06)",
            borderRadius: "14px",
            minWidth: "78px",
            padding: "12px 8px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <span style={{ fontSize: "24px", fontWeight: 700, color: "#fff", lineHeight: 1 }}>{daysSinceMeeting}</span>
            <span style={{ fontSize: "9px", fontWeight: 500, color: "rgba(255,255,255,0.6)", textAlign: "center", marginTop: "4px" }}>gün tanışalı 🤝</span>
          </div>
          <div style={{
            border: "2px solid #D84257",
            background: "rgba(216,66,87,0.06)",
            borderRadius: "14px",
            minWidth: "78px",
            padding: "12px 8px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <span style={{ fontSize: "24px", fontWeight: 700, color: "#fff", lineHeight: 1 }}>{daysSinceTogether}</span>
            <span style={{ fontSize: "9px", fontWeight: 500, color: "rgba(255,255,255,0.6)", textAlign: "center", marginTop: "4px" }}>gün sevgili ❤️</span>
          </div>
        </div>
      </div>

      {/* ── GÜNÜN SÖZÜ ────────────────────────────────── */}
      <div style={{
        background: "#181a20",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "20px",
        padding: "20px",
      }}>
        <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#fff", margin: "0 0 8px 0" }}>Günün Sözü</h2>
        <p style={{ fontSize: "13px", lineHeight: 1.5, color: "rgba(255,255,255,0.65)", fontStyle: "italic", margin: 0 }}>
          &quot;{quote}&quot;
        </p>
      </div>

      {/* ── AŞK ÖLÇERİ ────────────────────────────────── */}
      <LoveMeter value={loveMeter} />

      {/* ── BULUŞMA GERİ SAYIMI ────────────────────────── */}
      {activeMeeting && (
        <MeetingCountdown
          targetDate={activeMeeting.meeting_datetime}
          title={activeMeeting.title || "Buluşma"}
        />
      )}

      {/* ── RUH HALİ ──────────────────────────────────── */}
      <MoodSelector currentMood={currentMood} moodLocked={!!currentMood} />

      {/* ── GÜNLÜK NOT ────────────────────────────────── */}
      <DailyNoteCard existingNote={currentNote} />

      {/* ── BEKLEYEN MEKTUPLAR ─────────────────────────── */}
      <PendingLettersCard letters={pendingLetters} />

    </div>
  );
}
