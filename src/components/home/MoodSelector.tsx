"use client";

import { useState } from "react";
import { upsertMoodAction } from "@/actions/notes";
import { toast } from "sonner";

const MOODS = [
  { emoji: "😍", label: "Çok Mutlu" },
  { emoji: "😊", label: "Mutlu" },
  { emoji: "😐", label: "Normal" },
  { emoji: "😢", label: "Üzgün" },
  { emoji: "😡", label: "Kızgın" },
  { emoji: "😴", label: "Yorgun" },
] as const;

interface MoodSelectorProps {
  currentMood?: string | null;
  moodLocked?: boolean;
}

export function MoodSelector({ currentMood, moodLocked = false }: MoodSelectorProps) {
  const [selected, setSelected] = useState<string | null>(currentMood || null);
  const [locked, setLocked] = useState(moodLocked);
  const [loading, setLoading] = useState(false);

  async function handleMoodSelect(emoji: string) {
    if (locked || loading) return;
    setLoading(true);
    const result = await upsertMoodAction(emoji);
    setLoading(false);
    if (result?.error) {
      toast.error(result.error);
    } else {
      setSelected(emoji);
      setLocked(true);
      toast.success("Ruh halin kaydedildi! " + emoji);
    }
  }

  return (
    <div style={{
      background: "#181a20",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "20px",
      padding: "20px",
    }}>
      <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#fff", margin: "0 0 14px 0" }}>
        Bugün nasılsın?
      </h2>

      <div style={{ display: "flex", gap: "6px", width: "100%" }}>
        {MOODS.map((mood) => {
          const isSelected = selected === mood.emoji;
          return (
            <button
              key={mood.emoji}
              onClick={() => handleMoodSelect(mood.emoji)}
              disabled={loading || locked}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "10px 4px",
                borderRadius: "12px",
                border: isSelected ? "2px solid #D84257" : "1px solid rgba(255,255,255,0.06)",
                background: isSelected ? "rgba(216,66,87,0.1)" : "rgba(255,255,255,0.03)",
                cursor: locked ? "default" : "pointer",
                opacity: locked && !isSelected ? 0.35 : 1,
                WebkitTapHighlightColor: "transparent",
                transition: "all 0.15s ease",
              }}
            >
              <span style={{ fontSize: "28px", lineHeight: 1, marginBottom: "4px" }}>{mood.emoji}</span>
              <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.6)", fontWeight: 500, textAlign: "center" }}>
                {mood.label}
              </span>
            </button>
          );
        })}
      </div>

      {locked && selected && (
        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", textAlign: "center", marginTop: "10px" }}>
          Bugün için kaydedildi 💛
        </p>
      )}
    </div>
  );
}
