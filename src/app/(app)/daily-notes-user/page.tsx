import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import dayjs from "dayjs";
import "dayjs/locale/tr";
import { decrypt } from "@/utils/crypto";

export const metadata: Metadata = {
  title: "Günlüğüm — Emirhan & Öykü 💕",
};

export const dynamic = "force-dynamic";

export default async function DailyNotesUserPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const supabase = createServerClient();

  const { data: notesResult } = await supabase
    .from("daily_notes")
    .select("id, date, content")
    .eq("user_id", session.userId)
    .order("date", { ascending: false });

  const notes = (notesResult ?? []).map((n: any) => ({
    ...n,
    content: decrypt(n.content),
  }));

  return (
    <div
      className="px-4 pt-6 pb-8 flex flex-col max-w-lg mx-auto"
      style={{ background: "#0a0a0f", minHeight: "100%" }}
    >
      {/* ─── Header ─── */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{
          fontSize: 24,
          fontWeight: 800,
          color: "#E8002D",
          textAlign: "center",
          letterSpacing: "1px",
          marginBottom: 8,
        }}>
          GÜNLÜĞÜM 📓
        </h2>
        <p
          style={{
            color: "rgba(255,255,255,0.35)",
            fontSize: 14,
            marginTop: 4,
            textAlign: "center"
          }}
        >
          Sadece senin görebildiğin notların
        </p>
      </div>

      {/* ─── Empty state ─── */}
      {notes.length === 0 && (
        <div
          className="flex flex-col items-center justify-center"
          style={{
            padding: "80px 0",
            borderRadius: 20,
            background: "rgba(255,255,255,0.03)",
            border: "1px dashed rgba(255,255,255,0.1)",
          }}
        >
          <span style={{ fontSize: 48, marginBottom: 16 }}>📓</span>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>
            Henüz günlüğüne hiçbir şey yazmadın.
          </p>
        </div>
      )}

      {/* ─── Timeline ─── */}
      {notes.length > 0 && (
        <div className="relative flex flex-col" style={{ gap: 0 }}>


          {notes.map((note, index) => {
            const dateObj = dayjs(note.date).locale("tr");
            const day = dateObj.format("D");
            const monthYear = dateObj.format("MMMM YYYY").toUpperCase();
            const weekday = dateObj.format("dddd");

            return (
              <div
                key={note.id}
                className="flex items-stretch relative"
                style={{
                  gap: 0,
                  paddingBottom: index < notes.length - 1 ? 24 : 0,
                  paddingRight: 8,
                }}
              >
                {/* ── Date column ── */}
                <div
                  className="flex flex-col items-center flex-shrink-0"
                  style={{ width: 64, paddingTop: 4 }}
                >
                  <span
                    className="font-bold leading-none"
                    style={{ fontSize: 32, color: "#ffffff" }}
                  >
                    {day}
                  </span>
                  <span
                    className="font-semibold text-center leading-tight"
                    style={{
                      fontSize: 9,
                      color: "#c8922a",
                      letterSpacing: "0.5px",
                      marginTop: 2,
                    }}
                  >
                    {monthYear}
                  </span>
                  <span
                    className="font-medium text-center"
                    style={{
                      fontSize: 9,
                      color: "rgba(255,255,255,0.3)",
                      marginTop: 2,
                    }}
                  >
                    {weekday}
                  </span>
                </div>

                {/* ── Horizontal connector line ── */}
                <div
                  className="flex flex-col flex-shrink-0"
                  style={{ width: 16, paddingTop: 18 }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: 1,
                      background: "rgba(255,255,255,0.12)",
                    }}
                  />
                </div>

                {/* ── Content card ── */}
                <div
                  className="flex-1 min-w-0"
                  style={{
                    background: "#1a1a1e",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 14,
                    padding: 16,
                  }}
                >
                  <p
                    className="whitespace-pre-wrap break-words"
                    style={{
                      fontSize: 13.5,
                      color: "rgba(255,255,255,0.75)",
                      lineHeight: 1.6,
                    }}
                  >
                    {note.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
