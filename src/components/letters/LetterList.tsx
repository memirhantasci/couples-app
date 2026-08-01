"use client";

import { useState } from "react";
import { dayjs } from "@/lib/date";
import { Lock } from "lucide-react";

interface Letter {
  id: number;
  sender_id: number;
  receiver_id?: number;
  title: string;
  content: string;
  unlock_date: string;
  created_at: string;
  sender?: { username: string; display_name?: string };
  receiver?: { username: string; display_name?: string };
}

export function LetterList({ letters, type = "received" }: { letters: Letter[], type?: "received" | "sent" }) {
  const [openLetterId, setOpenLetterId] = useState<number | null>(null);

  const today = dayjs().startOf("day");

  if (!letters || letters.length === 0) {
    return (
      <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>
        {type === "received" ? "Henüz sana yazılmış bir mektup yok." : "Henüz kimseye mektup göndermedin."}
      </p>
    );
  }

  return (
    <div className="flex flex-col" style={{ gap: 12 }}>
      {letters.slice(0, 3).map(letter => {
        const unlockDate = dayjs(letter.unlock_date);
        const isLockedDate = unlockDate.isAfter(today);
        const canOpen = type === "sent" || !isLockedDate;
        const isOpen = openLetterId === letter.id;

        const personName = type === "received"
          ? (letter.sender?.display_name || letter.sender?.username || "Bilinmeyen")
          : (letter.receiver?.display_name || letter.receiver?.username || "Bilinmeyen");

        const dateObj = new Date(letter.created_at);
        const dateStr = dateObj.toLocaleDateString("tr-TR", {
          day: "2-digit", month: "2-digit", year: "numeric"
        }) + " " + dateObj.toLocaleTimeString("tr-TR", {
          hour: "2-digit", minute: "2-digit"
        });

        return (
          <div key={letter.id} style={{ display: "flex", flexDirection: "column" }}>
            <div
              onClick={() => canOpen && setOpenLetterId(isOpen ? null : letter.id)}
              style={{
                cursor: canOpen ? "pointer" : "not-allowed",
                padding: "4px 0",
                display: "flex",
                flexDirection: "column",
                opacity: !canOpen ? 0.7 : 1,
              }}
            >
              <div className="flex items-center gap-2">
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                  {dateStr}
                </p>
                {isLockedDate && (
                  <div className="flex items-center gap-1" style={{ color: "#E8002D", fontSize: 11, fontWeight: 500 }}>
                    <Lock size={10} />
                    <span>
                      {type === "received" ? `Kilitli (Açılış: ${unlockDate.format("DD.MM.YYYY")})` : `Alıcıya Kilitli (${unlockDate.format("DD.MM.YYYY")})`}
                    </span>
                  </div>
                )}
              </div>
              
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 1 }}>
                {type === "received" ? "Gönderen:" : "Alıcı:"}{" "}
                <span style={{ color: "#c8922a", fontWeight: 500 }}>{personName}</span>
              </p>
            </div>

            {/* Content Body */}
            {canOpen && isOpen && (
              <div
                style={{
                  marginTop: 8,
                  marginBottom: 8,
                  background: "rgba(255,255,255,0.02)",
                  borderLeft: "2px solid #c8922a",
                  padding: "12px 16px",
                  borderRadius: "0 8px 8px 0",
                }}
              >
                <h4 style={{ fontSize: 14, fontWeight: "bold", color: "#f4f4f5", marginBottom: 6 }}>
                  {letter.title}
                </h4>
                <p
                  className="whitespace-pre-wrap leading-relaxed"
                  style={{ fontSize: 13, color: "rgba(255,255,255,0.75)" }}
                >
                  {letter.content}
                </p>
              </div>
            )}
          </div>
        );
      })}

      {letters.length > 3 && (
        <div style={{ textAlign: "right", marginTop: 4 }}>
          <span
            className="font-semibold uppercase"
            style={{ fontSize: 11, color: "#E8002D", letterSpacing: "0.5px", cursor: "pointer" }}
          >
            TÜMÜNÜ GÖR
          </span>
        </div>
      )}
    </div>
  );
}
