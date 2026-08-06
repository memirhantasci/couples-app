"use client";

import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { updateMedicineLogAction, createMedicineAction, deleteMedicineAction, editMedicineAction } from "@/actions/medicine";
import { toast } from "sonner";
import { Check, X, Save, Trash2, Settings, User, Users, Edit2, Pill } from "lucide-react";
import { dayjs, todayString } from "@/lib/date";

interface Medicine {
  id: number;
  name: string;
  time: string;
  times?: string[];
  start_date: string;
  end_date: string;
  user_id: number;
}

interface MedicineLog {
  medicine_id: number;
  status: "DRANK" | "MISSED" | "PENDING";
  date: string;
  time?: string;
  user_id: number;
}

interface MedicineTrackerProps {
  medicines: Medicine[];
  todayLogs: MedicineLog[];
  historicalLogs: MedicineLog[];
  userId: number;
}

export function MedicineTracker({ medicines, todayLogs, historicalLogs, userId }: MedicineTrackerProps) {
  const [activeTab, setActiveTab] = useState<"me" | "partner">("me");
  
  const filteredMedicines = medicines.filter(m => activeTab === "me" ? m.user_id === userId : m.user_id !== userId);
  const filteredTodayLogs = todayLogs.filter(l => activeTab === "me" ? l.user_id === userId : l.user_id !== userId);
  const filteredHistoricalLogs = historicalLogs.filter(l => activeTab === "me" ? l.user_id === userId : l.user_id !== userId);

  const [logs, setLogs] = useState<Record<string, "DRANK" | "MISSED" | "PENDING">>(
    () => {
      const map: Record<string, "DRANK" | "MISSED" | "PENDING"> = {};
      todayLogs.forEach((log) => {
        const timeKey = log.time ? log.time.substring(0, 5) : "";
        if (timeKey) {
          map[`${log.medicine_id}_${timeKey}`] = log.status;
        }
      });
      medicines.forEach((m) => {
        const medTimes = Array.isArray(m.times) && m.times.length > 0
          ? m.times.map((t) => t.substring(0, 5))
          : [m.time ? m.time.substring(0, 5) : "08:00"];

        medTimes.forEach((t) => {
          const key = `${m.id}_${t}`;
          if (!map[key]) {
            const legacyLog = todayLogs.find((l) => l.medicine_id === m.id && (!l.time || l.time === ""));
            map[key] = legacyLog ? legacyLog.status : "PENDING";
          }
        });
      });
      return map;
    }
  );

  const [loadingSlot, setLoadingSlot] = useState<string | null>(null);
  const [showManagerModal, setShowManagerModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [isPartnerAdd, setIsPartnerAdd] = useState(false);
  
  // Form State
  const [editingMedicineId, setEditingMedicineId] = useState<number | null>(null);
  const [medName, setMedName] = useState("");
  const [medStartDate, setMedStartDate] = useState(todayString());
  const [medEndDate, setMedEndDate] = useState(todayString());
  const [medFrequency, setMedFrequency] = useState<1 | 2 | 3>(1);
  const [medTimes, setMedTimes] = useState<string[]>(["08:00"]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleMarkDrank(medicineId: number, slotTime: string) {
    if (activeTab === "partner") return;
    const key = `${medicineId}_${slotTime}`;
    const current = logs[key] || "PENDING";
    if (current === "DRANK") {
      toast.info("Alındı olarak işaretlendi, değiştirilemez 🔒");
      return;
    }
    setLoadingSlot(key);
    setLogs((prev) => ({ ...prev, [key]: "DRANK" }));
    const result = await updateMedicineLogAction(medicineId, "DRANK", slotTime);
    setLoadingSlot(null);
    if (result?.error) {
      toast.error(result.error);
      setLogs((prev) => ({ ...prev, [key]: current }));
    } else {
      toast.success(`💊 Saat ${slotTime} dozu alındı olarak işaretlendi!`);
    }
  }

  async function handleMarkMissed(medicineId: number, slotTime: string) {
    if (activeTab === "partner") return;
    const key = `${medicineId}_${slotTime}`;
    const current = logs[key] || "PENDING";
    if (current === "DRANK") {
      toast.info("Alındı olarak işaretlendi, değiştirilemez 🔒");
      return;
    }
    setLoadingSlot(key);
    setLogs((prev) => ({ ...prev, [key]: "MISSED" }));
    const result = await updateMedicineLogAction(medicineId, "MISSED", slotTime);
    setLoadingSlot(null);
    if (result?.error) {
      toast.error(result.error);
      setLogs((prev) => ({ ...prev, [key]: current }));
    } else {
      toast.error(`❌ Saat ${slotTime} dozu atlandı olarak işaretlendi.`);
    }
  }

  async function handleDeleteMedicine(id: number) {
    if (!confirm("Bu ilacı silmek istediğinize emin misiniz?")) return;
    setIsDeleting(id);
    const res = await deleteMedicineAction(id);
    setIsDeleting(null);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("İlaç silindi.");
    }
  }

  const handleEditMedicine = (med: Medicine) => {
    setEditingMedicineId(med.id);
    setMedName(med.name);
    setMedStartDate(med.start_date);
    setMedEndDate(med.end_date);
    setIsPartnerAdd(med.user_id !== userId);
    
    if (med.times && Array.isArray(med.times) && med.times.length > 0) {
      setMedFrequency(Math.min(3, med.times.length) as 1 | 2 | 3);
      setMedTimes(med.times.slice(0, 3).map(t => t.substring(0, 5)));
    } else if (med.time) {
      setMedFrequency(1);
      setMedTimes([med.time.substring(0, 5)]);
    }
  };

  const resetForm = () => {
    setEditingMedicineId(null);
    setMedName("");
    setMedStartDate(todayString());
    setMedEndDate(todayString());
    setMedFrequency(1);
    setMedTimes(["08:00"]);
  };

  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Istanbul",
    hour: "2-digit",
    minute: "2-digit",
  });
  const currentTimeStr = formatter.format(new Date());

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName) {
      toast.error("İlaç adı boş olamaz.");
      return;
    }

    const todayStrFormat = todayString();
    if (dayjs(medStartDate).isBefore(dayjs(todayStrFormat))) {
      toast.error("Geçmiş bir tarihe ilaç ekleyemezsiniz!");
      return;
    }
    
    if (medStartDate === todayStrFormat) {
      const now = new Date();
      const allPast = medTimes.every(t => {
        const [hours, minutes] = t.split(":").map(Number);
        const timeDate = new Date();
        timeDate.setHours(hours, minutes, 0, 0);
        return timeDate < now;
      });
      if (allPast && !editingMedicineId) {
        toast.error("Seçtiğiniz saatler geçmişte. Lütfen ileri bir saat seçin veya tarihi yarına alın.");
        return;
      }
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("name", medName);
    formData.append("start_date", medStartDate);
    formData.append("end_date", medEndDate);
    formData.append("is_partner", isPartnerAdd ? "true" : "false");
    medTimes.forEach(t => formData.append("times", t));
    
    formData.append("time", medTimes[0]);

    if (editingMedicineId) {
       const originalMed = medicines.find(m => m.id === editingMedicineId);
       
       const result = await editMedicineAction(editingMedicineId, {
         name: medName,
         start_date: medStartDate,
         end_date: medEndDate,
         times: medTimes,
         user_id: isPartnerAdd ? (originalMed?.user_id !== userId ? originalMed!.user_id : -1) : userId 
       });
       
       if (result.success) {
         toast.success("İlaç başarıyla güncellendi! 💊");
         resetForm();
       } else {
         toast.error(result.error);
       }
    } else {
      const result = await createMedicineAction({}, formData);
      if (result.success) {
        toast.success("İlaç başarıyla eklendi! 💊");
        resetForm();
      } else {
        toast.error(result.error);
      }
    }
    
    setIsSubmitting(false);
  };

  const managerModal = showManagerModal ? (
    <div
      style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0,0,0,0.85)", zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20, backdropFilter: "blur(5px)"
      }}
    >
      <div
        style={{
          width: "100%", maxWidth: 450, maxHeight: "90vh",
          background: "#1c1c1e", borderRadius: 24, padding: 24,
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 20px 48px rgba(0,0,0,0.5)",
          position: "relative", display: "flex", flexDirection: "column",
          overflowY: "auto"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setShowManagerModal(false)}
          style={{
            position: "absolute", top: 20, right: 20,
            background: "transparent", border: "none",
            color: "rgba(255,255,255,0.5)", cursor: "pointer", padding: 4,
          }}
        >
          <X size={20} />
        </button>

        <h3 style={{
          color: "white", fontSize: 18, fontWeight: 700,
          marginBottom: 16, display: "flex", alignItems: "center", gap: 8,
        }}>
          <Settings size={20} style={{ color: "#E8002D" }} />
          İlaç Yönetimi
        </h3>

        {/* Mevcut İlaçlar */}
        <div style={{ marginBottom: 24 }}>
          <h4 style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginBottom: 8, fontWeight: 600 }}>Mevcut İlaçlar</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {medicines.length === 0 && <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>Kayıtlı ilaç yok.</p>}
            {medicines.map(m => (
              <div key={m.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: 12, background: "rgba(255,255,255,0.03)", borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.05)"
              }}>
                <div>
                  <p style={{ color: "white", fontSize: 14, fontWeight: 600 }}>{m.name}</p>
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
                    {m.user_id === userId ? "Benim İlacım" : "Sevgilimin İlacı"}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => handleEditMedicine(m)}
                    style={{
                      background: "rgba(255,255,255,0.1)", border: "none",
                      color: "white", padding: 8, borderRadius: 8, cursor: "pointer"
                    }}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteMedicine(m.id)}
                    disabled={isDeleting === m.id}
                    style={{
                      background: "rgba(239,68,68,0.15)", border: "none",
                      color: "#ef4444", padding: 8, borderRadius: 8, cursor: "pointer"
                    }}
                  >
                    {isDeleting === m.id ? <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" /> : <Trash2 size={16} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Yeni İlaç Ekle */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 20 }}>
          <h4 style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginBottom: 12, fontWeight: 600 }}>
            {editingMedicineId ? "İlacı Düzenle" : "Yeni İlaç Ekle"}
          </h4>
          <form onSubmit={handleSubmitForm} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <button 
                type="button"
                onClick={() => setIsPartnerAdd(false)}
                style={{
                  flex: 1, padding: 12, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  background: !isPartnerAdd ? "rgba(232,0,45,0.1)" : "rgba(255,255,255,0.05)",
                  border: !isPartnerAdd ? "1px solid #E8002D" : "1px solid rgba(255,255,255,0.1)",
                  color: !isPartnerAdd ? "#E8002D" : "rgba(255,255,255,0.5)", fontWeight: 600, fontSize: 14, cursor: "pointer"
                }}
              >
                <User size={16} /> Ben
              </button>
              <button 
                type="button"
                onClick={() => setIsPartnerAdd(true)}
                style={{
                  flex: 1, padding: 12, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  background: isPartnerAdd ? "rgba(232,0,45,0.1)" : "rgba(255,255,255,0.05)",
                  border: isPartnerAdd ? "1px solid #E8002D" : "1px solid rgba(255,255,255,0.1)",
                  color: isPartnerAdd ? "#E8002D" : "rgba(255,255,255,0.5)", fontWeight: 600, fontSize: 14, cursor: "pointer"
                }}
              >
                <Users size={16} /> Sevgilim
              </button>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>İlaç Adı</label>
              <input 
                name="name"
                value={medName}
                onChange={e => setMedName(e.target.value)}
                required
                placeholder="Örn: Parol"
                style={{
                  width: "100%", padding: 14, borderRadius: 12, background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)", color: "white", fontSize: 14, outline: "none"
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>Başlangıç</label>
                <input 
                  name="start_date" 
                  type="date"
                  required
                  value={medStartDate}
                  onChange={e => setMedStartDate(e.target.value)}
                  style={{
                    width: "100%", padding: 14, borderRadius: 12, background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)", color: "white", fontSize: 14, outline: "none",
                    colorScheme: "dark"
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>Bitiş</label>
                <input 
                  name="end_date" 
                  type="date"
                  required
                  value={medEndDate}
                  onChange={e => setMedEndDate(e.target.value)}
                  style={{
                    width: "100%", padding: 14, borderRadius: 12, background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)", color: "white", fontSize: 14, outline: "none",
                    colorScheme: "dark"
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>Günde Kaç Kez?</label>
              <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                {[1, 2, 3].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      setMedFrequency(num as 1 | 2 | 3);
                      const newTimes = [...medTimes];
                      if (newTimes.length < num) {
                        while (newTimes.length < num) newTimes.push("08:00");
                      } else if (newTimes.length > num) {
                        newTimes.splice(num);
                      }
                      setMedTimes(newTimes);
                    }}
                    style={{
                      flex: 1, padding: 12, borderRadius: 12, cursor: "pointer",
                      background: medFrequency === num ? "rgba(232,0,45,0.1)" : "rgba(255,255,255,0.05)",
                      border: medFrequency === num ? "1px solid #E8002D" : "1px solid rgba(255,255,255,0.1)",
                      color: medFrequency === num ? "#E8002D" : "rgba(255,255,255,0.5)",
                      fontWeight: 600, fontSize: 14
                    }}
                  >
                    {num} Kez
                  </button>
                ))}
              </div>

              <label style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>Alım Saatleri</label>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {medTimes.map((t, index) => (
                  <input
                    key={index}
                    type="time"
                    required
                    value={t}
                    onChange={(e) => {
                      const newTimes = [...medTimes];
                      newTimes[index] = e.target.value;
                      setMedTimes(newTimes);
                    }}
                    style={{
                      flex: 1, minWidth: "30%", padding: 14, borderRadius: 12, background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)", color: "white", fontSize: 14, outline: "none",
                      textAlign: "center",
                      colorScheme: "dark"
                    }}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: "100%", padding: 14, borderRadius: 12, background: "transparent", color: "white",
                border: "none", fontWeight: 700, fontSize: 15, marginTop: 4, cursor: isSubmitting ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: isSubmitting ? 0.7 : 1,
                // Because mobile ui has no red background on "İlacı Kaydet" but wait, actually in screenshot 1 there is NO "İlacı Kaydet" button visible without scroll. But the mobile code has `#E8002D` background. Wait, mobile code for save is `#E8002D`. 
                // Wait, looking at the code for mobile, save btn has backgroundColor: "#E8002D".
                backgroundColor: "#E8002D"
              }}
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
              ) : (
                <><Save size={18} /> {editingMedicineId ? "Güncelle" : "İlacı Kaydet"}</>
              )}
            </button>
            {editingMedicineId && (
              <button
                type="button"
                onClick={resetForm}
                style={{
                  width: "100%", padding: 14, borderRadius: 12, background: "transparent", color: "rgba(255,255,255,0.5)",
                  border: "none", fontWeight: 600, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
                }}
              >
                İptal
              </button>
            )}
          </form>
        </div>

      </div>
    </div>
  ) : null;

  return (
    <div className="flex flex-col gap-0 relative w-full h-full">
      {typeof document !== 'undefined' && createPortal(managerModal, document.body)}

      {/* ── TABS ──────────────────── */}
      <div className="flex mx-4 mb-6 rounded-[12px] p-1" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
        <button 
          onClick={() => setActiveTab("me")}
          className="flex-1 py-3 text-sm font-bold rounded-[8px] transition-all"
          style={{
            background: activeTab === "me" ? "white" : "transparent",
            color: activeTab === "me" ? "black" : "rgba(255,255,255,0.5)"
          }}
        >
          Ben
        </button>
        <button 
          onClick={() => setActiveTab("partner")}
          className="flex-1 py-3 text-sm font-bold rounded-[8px] transition-all"
          style={{
            background: activeTab === "partner" ? "white" : "transparent",
            color: activeTab === "partner" ? "black" : "rgba(255,255,255,0.5)"
          }}
        >
          Sevgilim
        </button>
      </div>

      <div className="mb-3 px-4 flex items-center justify-between">
        <h2 className="font-normal text-[15px] flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.8)" }}>
          Bugünün İlaçları {activeTab === "partner" ? "(Sevgilimin)" : ""}
        </h2>
      </div>

      {/* ── MEDICINE CARDS ───────────────────────────── */}
      <div className="flex flex-col gap-4 px-4">
        {filteredMedicines.length === 0 ? (
          <div
            className="flex flex-col items-center gap-4 py-12"
            style={{
              background: "#181a20",
              border: "1px dashed rgba(255,255,255,0.1)",
              borderRadius: "16px",
            }}
          >
            <span className="text-4xl">💊</span>
            <p className="text-[14px]" style={{ color: "rgba(255,255,255,0.5)" }}>
              {activeTab === "partner" ? "Sevgilinin aktif ilacı yok" : "Bugün için aktif ilaç yok"}
            </p>
          </div>
        ) : (
          filteredMedicines.map((medicine) => {
            const medTimes = Array.isArray(medicine.times) && medicine.times.length > 0
              ? medicine.times.map((t) => t.substring(0, 5))
              : [medicine.time ? medicine.time.substring(0, 5) : "08:00"];

            return (
              <motion.div
                key={medicine.id}
                layout
                className="w-full overflow-hidden"
                style={{
                  background: "#181a20",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "16px",
                }}
              >
                <div className="flex flex-col items-center justify-evenly py-4 px-4 text-center w-full gap-2">
                  <p className="font-bold text-[18px] tracking-tight leading-tight text-white text-center">
                    {medicine.name}
                  </p>
                  <p className="text-[12px] text-center text-neutral-400 mb-2">
                    Günde {medTimes.length} kez ({medTimes.join(", ")})
                  </p>

                  <div className="flex flex-col gap-2 w-full items-center justify-center mt-1">
                    {medTimes.map((slotTime) => {
                      const key = `${medicine.id}_${slotTime}`;
                      const status = logs[key] || "PENDING";
                      const isDrank = status === "DRANK";
                      const isMissed = status === "MISSED";
                      const isLoading = loadingSlot === key;
                      const isTimePassed = currentTimeStr >= slotTime;

                      return (
                        <div key={slotTime} className="flex items-center justify-center w-full">
                          {isLoading ? (
                            <div className="py-3 px-3.5 flex items-center justify-center rounded-xl bg-white/5 w-full max-w-[220px]">
                              <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: "rgba(255,255,255,0.2)", borderTopColor: "#fff" }} />
                            </div>
                          ) : isDrank ? (
                            <div className="py-3 px-5 w-full max-w-[220px] rounded-xl flex items-center justify-center shadow-[0_0_12px_rgba(34,197,94,0.2)]" style={{ background: "rgba(34,197,94,0.15)", border: "1px solid #22C55E", color: "#22C55E" }}>
                              <span className="font-bold text-[14px] flex items-center gap-1.5 justify-center text-center">
                                <Check size={18} /> Alındı ({slotTime})
                              </span>
                            </div>
                          ) : isMissed ? (
                            <div className="py-3 px-5 w-full max-w-[220px] rounded-xl flex items-center justify-center shadow-[0_0_12px_rgba(239,68,68,0.2)]" style={{ background: "rgba(239,68,68,0.15)", border: "1px solid #ef4444", color: "#ef4444" }}>
                              <span className="font-bold text-[14px] flex items-center gap-1.5 justify-center text-center">
                                <X size={18} /> Atlandı ({slotTime})
                              </span>
                            </div>
                          ) : !isTimePassed ? (
                            <div className="py-3 px-5 w-full max-w-[220px] rounded-xl flex items-center justify-center bg-white/5 text-white/50 text-[14px] font-bold text-center border border-white/10">
                              Bekliyor ({slotTime})
                            </div>
                          ) : (
                            // Action buttons only available for 'me'
                            activeTab === "me" ? (
                              <div className="flex items-center justify-center gap-2.5 w-full">
                                <button
                                  onClick={() => handleMarkMissed(medicine.id, slotTime)}
                                  className="flex-1 max-w-[105px] py-3 px-4 rounded-xl font-bold text-[14px] transition-all active:scale-95 flex items-center justify-center text-center"
                                  style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}
                                >
                                  Atla
                                </button>
                                <button
                                  onClick={() => handleMarkDrank(medicine.id, slotTime)}
                                  className="flex-1 max-w-[105px] py-3 px-4 rounded-xl font-bold text-[14px] transition-all active:scale-95 flex items-center justify-center text-center"
                                  style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.3)" }}
                                >
                                  İçtim
                                </button>
                              </div>
                            ) : (
                              <div className="py-3 px-5 w-full max-w-[220px] rounded-xl flex items-center justify-center bg-white/5 text-white/50 text-[14px] font-bold text-center border border-white/10">
                                Bekliyor ({slotTime}) - İçilmedi
                              </div>
                            )
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}

        <button 
          onClick={() => setShowManagerModal(true)}
          className="mt-2 flex items-center justify-center gap-2 py-4 rounded-[16px] text-[16px] font-bold tracking-wide transition-all active:scale-95"
          style={{ background: "#1c1c1e", color: "white", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <Settings size={20} />
          İlaç Yönetimi
        </button>
      </div>

    </div>
  );
}
