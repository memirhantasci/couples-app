"use client";

import { X, Pill, Save, Plus, Trash2, Clock } from "lucide-react";
import { editMedicineAction } from "@/actions/medicine";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

export function EditMedicineModal({ 
  med, 
  users, 
  onClose 
}: { 
  med: any; 
  users: any[]; 
  onClose: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  const initialTimes: string[] = Array.isArray(med.times) && med.times.length > 0
    ? med.times.map((t: string) => t.substring(0, 5))
    : [med.time ? med.time.substring(0, 5) : "08:00"];

  const [times, setTimes] = useState<string[]>(initialTimes);

  useEffect(() => {
    setMounted(true);
  }, []);

  function handleSetFrequency(freq: number) {
    if (freq === 1) setTimes(["08:00"]);
    else if (freq === 2) setTimes(["08:00", "20:00"]);
    else if (freq === 3) setTimes(["08:00", "14:00", "20:00"]);
  }

  function handleTimeChange(index: number, val: string) {
    const updated = [...times];
    updated[index] = val;
    setTimes(updated);
  }

  function handleAddTimeSlot() {
    setTimes([...times, "12:00"]);
  }

  function handleRemoveTimeSlot(index: number) {
    if (times.length <= 1) return;
    setTimes(times.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    const data = {
      name: formData.get("name") as string,
      start_date: formData.get("start_date") as string,
      end_date: formData.get("end_date") as string,
      times: times.map((t) => t.substring(0, 5)).filter(Boolean),
      user_id: Number(formData.get("user_id")),
    };

    if (data.times.length === 0) {
      toast.error("En az 1 alım saati eklenmelidir.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await editMedicineAction(med.id, data);
      setSubmitting(false);
      if (res?.error) toast.error(res.error);
      else {
        toast.success("İlaç başarıyla güncellendi.");
        onClose();
      }
    } catch (err) {
      setSubmitting(false);
      toast.error("Sunucu ile iletişim kurulamadı veya beklenmeyen bir hata oluştu.");
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
          maxHeight: "90vh",
          overflowY: "auto",
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
          <Pill size={20} style={{ color: "var(--gs-red)" }} />
          İlacı Düzenle
        </h3>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={labelStyle}>İlaç Adı</label>
            <input
              name="name"
              type="text"
              defaultValue={med.name}
              required
              style={inputStyle}
            />
          </div>

          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Başlangıç</label>
              <input
                name="start_date"
                type="date"
                defaultValue={med.start_date?.substring(0, 10)}
                required
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Bitiş</label>
              <input
                name="end_date"
                type="date"
                defaultValue={med.end_date?.substring(0, 10)}
                required
                style={inputStyle}
              />
            </div>
          </div>

          {/* Times / Frequency Selection */}
          <div>
            <label style={labelStyle}>Günde Kaç Kez Alınacak?</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "12px" }}>
              {[1, 2, 3].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => handleSetFrequency(f)}
                  style={{
                    padding: "8px",
                    borderRadius: "10px",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    background: times.length === f ? "rgba(232,0,45,0.18)" : "var(--surface-1)",
                    border: `1px solid ${times.length === f ? "var(--gs-red)" : "var(--border-default)"}`,
                    color: times.length === f ? "white" : "var(--text-secondary)",
                  }}
                >
                  Günde {f} Kez
                </button>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {times.map((t, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px 14px",
                      borderRadius: "12px",
                      background: "var(--surface-1)",
                      border: "1px solid var(--border-default)",
                    }}
                  >
                    <Clock size={14} style={{ color: "rgba(255,255,255,0.5)" }} />
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>
                      Doz {idx + 1}:
                    </span>
                    <input
                      type="time"
                      value={t}
                      onChange={(e) => handleTimeChange(idx, e.target.value)}
                      required
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "white",
                        fontWeight: 700,
                        fontSize: "14px",
                        outline: "none",
                        marginLeft: "auto",
                      }}
                    />
                  </div>
                  {times.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTimeSlot(idx)}
                      style={{
                        padding: "10px",
                        borderRadius: "12px",
                        background: "rgba(248,113,113,0.12)",
                        color: "#f87171",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddTimeSlot}
                style={{
                  padding: "8px",
                  borderRadius: "10px",
                  fontSize: "12px",
                  fontWeight: 600,
                  border: "1px dashed rgba(255,255,255,0.2)",
                  background: "transparent",
                  color: "rgba(255,255,255,0.7)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  marginTop: "4px",
                }}
              >
                <Plus size={14} />
                Saat Ekle
              </button>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Kullanıcı</label>
            <select
              name="user_id"
              defaultValue={med.user_id}
              required
              style={{ ...inputStyle, appearance: "none" }}
            >
              <option value="">Seçiniz</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.username}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", marginTop: "10px" }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                flex: 1,
                padding: "14px",
                borderRadius: "14px",
                background: submitting ? "rgba(255,255,255,0.1)" : "var(--gs-red)",
                color: submitting ? "rgba(255,255,255,0.3)" : "white",
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
