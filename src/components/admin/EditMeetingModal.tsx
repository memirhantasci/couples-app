"use client";

import { X, CalendarClock, Save } from "lucide-react";
import { updateMeetingAction } from "@/actions/meetings";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { dayjs } from "@/lib/date";

export function EditMeetingModal({ 
  meeting, 
  onClose 
}: { 
  meeting: any; 
  onClose: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Format meeting_datetime for datetime-local input
  const initialDate = new Date(meeting.meeting_datetime);
  initialDate.setMinutes(initialDate.getMinutes() - initialDate.getTimezoneOffset());
  const initialDatetimeStr = initialDate.toISOString().slice(0, 16);

  const [datetime, setDatetime] = useState(initialDatetimeStr);

  // Min datetime: now
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const minDateTime = now.toISOString().slice(0, 16);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    
    if (!datetime) {
      toast.error("Tarih ve saat gereklidir.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await updateMeetingAction(meeting.id, datetime);
      setSubmitting(false);
      if (res?.error) toast.error(res.error);
      else {
        toast.success("Buluşma tarihi başarıyla güncellendi.");
        onClose();
      }
    } catch (err) {
      setSubmitting(false);
      toast.error("Beklenmeyen bir hata oluştu.");
    }
  }

  const inputStyle = {
    width: "100%",
    padding: "14px",
    borderRadius: "14px",
    background: "var(--surface-1)",
    border: "1.5px solid var(--border-default)",
    color: "var(--text-primary)",
    fontSize: "14px",
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box" as const,
  };

  const labelStyle = {
    fontSize: "12px",
    fontWeight: "bold",
    color: "rgba(255,255,255,0.7)",
    marginBottom: "6px",
    display: "block",
  };

  const modalContent = (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.70)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          backgroundColor: "var(--surface-2)",
          borderRadius: "20px",
          padding: "24px",
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow: "0 20px 48px rgba(0,0,0,0.5)",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "transparent",
            border: "none",
            color: "rgba(255,255,255,0.5)",
            cursor: "pointer",
            padding: "4px",
          }}
        >
          <X size={16} />
        </button>

        <h3
          style={{
            color: "white",
            fontSize: "18px",
            fontWeight: 700,
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <CalendarClock size={20} style={{ color: "var(--gs-gold)" }} />
          Buluşmayı Düzenle
        </h3>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={labelStyle}>Tarih & Saat</label>
            <input
              type="datetime-local"
              value={datetime}
              onChange={(e) => setDatetime(e.target.value)}
              min={minDateTime}
              required
              style={inputStyle}
            />
          </div>

          <div style={{ display: "flex", marginTop: "10px", gap: "10px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: "14px",
                borderRadius: "14px",
                background: "rgba(255,255,255,0.1)",
                color: "#fff",
                border: "none",
                fontWeight: 700,
                fontSize: "14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <X size={18} />
              İptal
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                flex: 1,
                padding: "14px",
                borderRadius: "14px",
                background: submitting ? "rgba(255,255,255,0.1)" : "var(--gs-gold)",
                color: submitting ? "rgba(255,255,255,0.3)" : "black",
                border: "none",
                fontWeight: 700,
                fontSize: "14px",
                cursor: submitting ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <Save size={18} />
              {submitting ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (!mounted) return null;

  return createPortal(modalContent, document.body);
}
