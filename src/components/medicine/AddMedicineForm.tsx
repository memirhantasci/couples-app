"use client";

import { useState } from "react";
import { useActionState } from "react";
import { createMedicineAction } from "@/actions/medicine";
import { toast } from "sonner";
import { Plus, X, Trash2, Clock } from "lucide-react";

export function AddMedicineForm({ users }: { users: { id: number; username: string }[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [times, setTimes] = useState<string[]>(["08:00"]);

  const initialState: { error?: string; success?: boolean } = {};
  const [state, formAction, isPending] = useActionState(
    async (prev: { error?: string; success?: boolean }, formData: FormData) => {
      const result = await createMedicineAction(prev, formData);
      if (result.success) {
        toast.success("İlaç eklendi! 💊");
        setIsOpen(false);
        setTimes(["08:00"]);
      } else if (result.error) {
        toast.error(result.error);
      }
      return result;
    },
    initialState
  );

  const today = new Date().toISOString().split("T")[0];

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

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="btn-primary w-full shadow-lg">
        <Plus size={18} />
        Yeni İlaç Ekle
      </button>
    );
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4 pb-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <h3 className="font-bold text-white flex items-center gap-2">
          <Plus size={18} style={{ color: "var(--gs-red)" }} />
          Yeni İlaç Ekle
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
        >
          <X size={16} style={{ color: "rgba(255,255,255,0.6)" }} />
        </button>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
            Kime Eklenecek?
          </label>
          <select name="user_id" required className="input-glass w-full" defaultValue="">
            <option value="" disabled style={{ background: "#1f1f23" }}>Seçiniz...</option>
            {users.map(u => (
              <option key={u.id} value={u.id} style={{ background: "#1f1f23", color: "#f4f4f5" }}>{u.username}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
            İlaç Adı
          </label>
          <input name="name" type="text" placeholder="ör: Vitamin D" required className="input-glass w-full" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
              Başlangıç
            </label>
            <input name="start_date" type="date" defaultValue={today} required className="input-glass w-full" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
              Bitiş
            </label>
            <input name="end_date" type="date" required className="input-glass w-full" />
          </div>
        </div>

        {/* Frequency & Times */}
        <div>
          <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
            Günde Kaç Kez Alınacak?
          </label>
          
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[1, 2, 3].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => handleSetFrequency(f)}
                className="py-2 px-3 rounded-xl text-xs font-bold transition-all"
                style={{
                  background: times.length === f ? "rgba(232,0,45,0.18)" : "var(--surface-3)",
                  border: `1px solid ${times.length === f ? "var(--gs-red)" : "var(--border-subtle)"}`,
                  color: times.length === f ? "white" : "var(--text-secondary)",
                }}
              >
                Günde {f} Kez
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            {times.map((t, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
                  <Clock size={14} className="text-white/50" />
                  <span className="text-xs font-semibold text-white/60">Doz {idx + 1}:</span>
                  <input
                    name="times"
                    type="time"
                    value={t}
                    onChange={(e) => handleTimeChange(idx, e.target.value)}
                    required
                    className="bg-transparent text-white font-bold text-sm outline-none ml-auto"
                  />
                </div>
                {times.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveTimeSlot(idx)}
                    className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddTimeSlot}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold border border-dashed border-white/20 text-white/70 hover:bg-white/5 transition-colors mt-1"
            >
              <Plus size={14} />
              Saat Ekle
            </button>
          </div>
        </div>

        <button type="submit" disabled={isPending} className="btn-secondary w-full mt-2" style={{ color: "#4ade80", borderColor: "rgba(34,197,94,0.3)", background: "rgba(34,197,94,0.10)" }}>
          {isPending ? (
            <div className="w-4 h-4 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin" />
          ) : (
            <>
              <Plus size={16} />
              İlacı Kaydet
            </>
          )}
        </button>
      </form>
    </div>
  );
}
