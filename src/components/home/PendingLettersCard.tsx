"use client";

import { Lock, Mail, CalendarClock } from "lucide-react";
import { dayjs } from "@/lib/date";

interface PendingLetter {
  id: number;
  unlock_date: string;
  sender?: { display_name?: string; username: string };
}

export function PendingLettersCard({ letters }: { letters: PendingLetter[] }) {
  if (!letters || letters.length === 0) return null;

  const today = dayjs().startOf("day");

  const pendingLetters = letters.filter(letter => {
    const unlockDate = dayjs(letter.unlock_date);
    return !unlockDate.isBefore(today, "day");
  });

  if (pendingLetters.length === 0) return null;

  return (
    <div style={{
      background: "#181a20",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "20px",
      padding: "20px",
    }}>
      <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#fff", margin: "0 0 12px 0" }}>
        Bekleyen Mektuplar
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {pendingLetters.map(letter => {
          const unlockDate = dayjs(letter.unlock_date);
          const daysLeft = unlockDate.diff(today, "day");
          const senderName = letter.sender?.display_name || letter.sender?.username || "Bilinmeyen";

          return (
            <div
              key={letter.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "14px",
                borderRadius: "14px",
                background: "rgba(196,161,90,0.06)",
                border: "1px solid rgba(196,161,90,0.18)",
              }}
            >
              <div style={{
                width: 36,
                height: 36,
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(196,161,90,0.12)",
                color: "#C4A15A",
                flexShrink: 0,
              }}>
                <Mail size={16} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "#fff", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  Kimden: {senderName}
                </p>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", margin: "2px 0 0 0", display: "flex", alignItems: "center", gap: "4px" }}>
                  <CalendarClock size={10} />
                  {unlockDate.tz("Europe/Istanbul").format("DD MMMM YYYY")}
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0 }}>
                <span style={{ fontSize: "17px", fontWeight: 700, color: "#C4A15A" }}>{daysLeft}</span>
                <span style={{ fontSize: "9px", fontWeight: 600, color: "rgba(255,255,255,0.4)" }}>gün kaldı</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
