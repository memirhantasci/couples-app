"use client";

import { useState } from "react";
import { upsertDailyNoteAction } from "@/actions/notes";
import { toast } from "sonner";

interface DailyNoteCardProps {
  existingNote?: string | null;
}

export function DailyNoteCard({ existingNote }: DailyNoteCardProps) {
  const [content, setContent] = useState(existingNote || "");
  const [saved, setSaved] = useState(!!existingNote);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (saved) return;
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const result = await upsertDailyNoteAction({}, formData);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Notun kaydedildi! 📝");
      setSaved(true);
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
        Günlük Notum
      </h2>

      {saved ? (
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "12px",
          padding: "14px",
        }}>
          <p style={{ fontSize: "14px", lineHeight: 1.6, color: "rgba(255,255,255,0.8)", whiteSpace: "pre-wrap", margin: 0 }}>
            {content}
          </p>
          <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginTop: "12px" }}>
            Yarın yeni bir not yazabilirsin 🌙
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <textarea
            name="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Bugün nasıldı? Ne hissediyorsun?..."
            rows={4}
            style={{
              width: "100%",
              resize: "none",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "12px",
              color: "rgba(255,255,255,0.85)",
              fontSize: "14px",
              lineHeight: 1.6,
              padding: "14px",
              outline: "none",
              fontFamily: "inherit",
              boxSizing: "border-box",
            }}
            maxLength={2000}
            required
          />
          <button
            type="submit"
            disabled={submitting}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "14px",
              background: "#D84257",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              padding: "13px",
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.7 : 1,
              transition: "opacity 0.15s ease",
            }}
          >
            {submitting ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </form>
      )}
    </div>
  );
}
