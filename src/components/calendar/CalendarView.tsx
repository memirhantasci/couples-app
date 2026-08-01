"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { upsertCalendarNoteAction, deleteCalendarNoteAction } from "@/actions/meetings";
import { toast } from "sonner";
import { X, Trash2, Save, Calendar as CalendarIcon } from "lucide-react";
import { dayjs } from "@/lib/date";
import type { Photo } from "@/components/photos/PhotoCard";
import { Lightbox } from "@/components/photos/Lightbox";

interface CalendarNote {
  id: number;
  date: string;
  note: string;
  user?: { username: string; display_name?: string };
}

interface Mood {
  date: string;
  mood_type: string;
  user?: { username: string; display_name?: string };
}

interface CalendarViewProps {
  notes: CalendarNote[];
  moods: Mood[];
  photos?: Photo[];
  currentUsername: string;
  photoDates?: string[];
}

export function CalendarView({
  notes,
  moods,
  photos = [],
  currentUsername,
  photoDates = [],
}: CalendarViewProps) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showTodayModal, setShowTodayModal] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [noteText, setNoteText] = useState("");
  const [existingNote, setExistingNote] = useState<CalendarNote | null>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const todayStr = dayjs().tz("Europe/Istanbul").format("YYYY-MM-DD");

  // ── Build a map: date -> which types of data exist ──
  const dateTypesMap = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    
    // Separate moods by user
    notes.forEach(n => {
      if (!map[n.date]) map[n.date] = new Set();
      map[n.date].add("note");
    });

    moods.forEach(m => {
      if (!map[m.date]) map[m.date] = new Set();
      const u = Array.isArray(m.user) ? m.user[0] : m.user;
      const isMe = u?.username?.toLowerCase() === currentUsername?.toLowerCase();
      map[m.date].add(isMe ? "my-mood" : "partner-mood");
    });

    photoDates.forEach(date => {
      if (!map[date]) map[date] = new Set();
      map[date].add("photo");
    });

    return map;
  }, [notes, moods, photoDates, currentUsername]);

  // ── dayCellDidMount: inject colored dots under each day number ──
  const handleDayCellDidMount = useCallback((arg: any) => {
    const d = arg.date;
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const types = dateTypesMap[dateStr];
    if (!types || types.size === 0) return;

    const frame = arg.el.querySelector(".fc-daygrid-day-frame");
    if (!frame) return;

    // Remove old dots if re-rendering
    const old = frame.querySelector(".dot-row");
    if (old) old.remove();

    const dotRow = document.createElement("div");
    dotRow.className = "dot-row";
    dotRow.style.cssText = "display:flex;gap:3px;justify-content:center;margin-top:-2px;position:relative;z-index:3;";

    const dotColors: Record<string, string> = {
      "note": "#E8002D",
      "my-mood": "#FFD700",
      "partner-mood": "#64b4ff",
      "photo": "#22c55e",
    };

    // Fixed order
    ["note", "my-mood", "photo", "partner-mood"].forEach(type => {
      if (types.has(type)) {
        const dot = document.createElement("div");
        dot.style.cssText = `width:5px;height:5px;border-radius:50%;background:${dotColors[type]};`;
        dotRow.appendChild(dot);
      }
    });

    frame.appendChild(dotRow);
  }, [dateTypesMap]);

  // ── Selected day details ──
  const selectedDayNotes = useMemo(() => {
    if (!selectedDate) return [];
    return notes.filter(n => n.date === selectedDate);
  }, [selectedDate, notes]);

  const selectedDayMoods = useMemo(() => {
    if (!selectedDate) return [];
    return moods.filter(m => m.date === selectedDate);
  }, [selectedDate, moods]);

  const selectedDayPhotos = useMemo(() => {
    if (!selectedDate) return [];
    return photos.filter(p => p.taken_date === selectedDate);
  }, [selectedDate, photos]);

  // ── Click handlers ──
  function handleDateClick(info: { dateStr: string }) {
    const date = info.dateStr;
    setSelectedDate(date);

    // Only show popup modal for TODAY
    if (date === todayStr) {
      const existing = notes.find((n) => {
        const u = Array.isArray(n.user) ? n.user[0] : n.user;
        return n.date === date && u?.username?.toLowerCase() === currentUsername?.toLowerCase();
      });
      setExistingNote(existing || null);
      setNoteText(existing?.note || "");
      setShowTodayModal(true);
    } else {
      setShowTodayModal(false);
    }
  }

  function handleEventClick(info: { event: any }) {
    const date = info.event.startStr.split("T")[0] || info.event.startStr;
    handleDateClick({ dateStr: date });
  }

  // ── Modal handlers (only for today) ──
  function closeModal() {
    setShowTodayModal(false);
    setNoteText("");
    setExistingNote(null);
  }

  async function handleSave() {
    if (!noteText.trim()) return;
    setLoading(true);
    const fd = new FormData();
    fd.append("date", todayStr);
    fd.append("note", noteText.trim());
    const result = await upsertCalendarNoteAction({}, fd);
    setLoading(false);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Not kaydedildi! 📅");
      closeModal();
      router.refresh();
    }
  }

  async function handleDelete() {
    if (!existingNote) return;
    setLoading(true);
    const result = await deleteCalendarNoteAction(existingNote.id);
    setLoading(false);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Not silindi.");
      closeModal();
      router.refresh();
    }
  }

  // ── Today popup modal ──
  const todayModal = showTodayModal ? (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0,0,0,0.75)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
      onClick={closeModal}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          background: "#1c1c1e",
          borderRadius: 20,
          padding: 24,
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 20px 48px rgba(0,0,0,0.5)",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={closeModal}
          style={{
            position: "absolute", top: 20, right: 20,
            background: "transparent", border: "none",
            color: "rgba(255,255,255,0.5)", cursor: "pointer", padding: 4,
          }}
        >
          <X size={16} />
        </button>

        <h3 style={{
          color: "white", fontSize: 18, fontWeight: 700,
          marginBottom: 6, display: "flex", alignItems: "center", gap: 8,
        }}>
          <CalendarIcon size={20} style={{ color: "#E8002D" }} />
          Bugün
        </h3>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 16 }}>
          {dayjs(todayStr).locale("tr").format("DD MMMM YYYY, dddd")}
        </p>

        <textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Bu güne dair bir not bırak..."
          autoFocus
          style={{
            width: "100%", minHeight: 120, padding: 14, borderRadius: 14,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.9)", fontSize: 14,
            resize: "none", outline: "none", fontFamily: "inherit",
            boxSizing: "border-box", lineHeight: 1.6,
          }}
        />

        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          {existingNote && (
            <button
              onClick={handleDelete}
              disabled={loading}
              style={{
                padding: 12, borderRadius: 12,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,100,100,0.8)",
                cursor: loading ? "not-allowed" : "pointer",
              }}
              title="Notu Sil"
            >
              <Trash2 size={18} />
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={loading || !noteText.trim()}
            style={{
              flex: 1, padding: 12, borderRadius: 12,
              background: loading || !noteText.trim() ? "rgba(255,255,255,0.1)" : "#E8002D",
              color: loading || !noteText.trim() ? "rgba(255,255,255,0.3)" : "white",
              border: "none", fontWeight: 700, fontSize: 14,
              cursor: loading || !noteText.trim() ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            <Save size={18} />
            {loading ? "Kaydediliyor..." : existingNote ? "Güncelle" : "Kaydet"}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      {todayModal}

      {/* ── Lightbox for Calendar View ─── */}
      {lightboxIndex !== null && selectedDayPhotos.length > 0 && (
        <Lightbox
          photos={selectedDayPhotos}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      {/* ── Calendar Styles ─── */}
      <style>{`
        .calendar-dark .fc {
          background: transparent;
          font-family: inherit;
        }
        .calendar-dark .fc-toolbar {
          padding: 4px 8px 0;
        }
        .calendar-dark .fc-toolbar-title {
          font-size: 17px !important;
          font-weight: 700 !important;
          color: #ffffff !important;
        }
        .calendar-dark .fc-button {
          background: transparent !important;
          border: none !important;
          color: rgba(255,255,255,0.7) !important;
          font-size: 18px !important;
          padding: 2px 8px !important;
          box-shadow: none !important;
        }
        .calendar-dark .fc-button:hover { color: #fff !important; }
        .calendar-dark .fc-today-button { display: none !important; }
        .calendar-dark .fc-col-header-cell-cushion {
          font-size: 11px !important;
          color: rgba(255,255,255,0.4) !important;
          font-weight: 600 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.5px !important;
        }
        .calendar-dark .fc-daygrid-day-number {
          font-size: 14px !important;
          color: rgba(255,255,255,0.85) !important;
          font-weight: 500 !important;
          padding: 6px 8px !important;
          position: relative;
          z-index: 2;
        }
        .calendar-dark .fc-day-other .fc-daygrid-day-number {
          color: rgba(255,255,255,0.2) !important;
        }
        .calendar-dark .fc-day-today {
          background: transparent !important;
        }
        .calendar-dark .fc-day-today .fc-daygrid-day-number {
          color: #ffffff !important;
          font-weight: 800 !important;
          background: #E8002D;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          display: flex !important;
          align-items: center;
          justify-content: center;
        }
        .calendar-dark .fc-theme-standard td,
        .calendar-dark .fc-theme-standard th,
        .calendar-dark .fc-theme-standard .fc-scrollgrid {
          border-color: rgba(255,255,255,0.05) !important;
        }
        .calendar-dark .fc-scrollgrid {
          border: none !important;
        }
        .calendar-dark .fc-daygrid-day-frame {
          min-height: 48px !important;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .calendar-dark .fc-daygrid-day-events {
          display: none !important;
        }
        .calendar-dark .fc-daygrid-day-bg {
          display: none !important;
        }
      `}</style>

      {/* ── Calendar Card ─── */}
      <div
        className="calendar-dark"
        style={{
          background: "#181a20",
          borderRadius: 20,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.08)",
          padding: "8px 4px 12px",
        }}
      >
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale="tr"
          dateClick={handleDateClick}
          dayCellDidMount={handleDayCellDidMount}
          height="auto"
          showNonCurrentDates={false}
          fixedWeekCount={false}
          headerToolbar={{
            left: "prev",
            center: "title",
            right: "next",
          }}
        />
      </div>

      {/* ── Legend ─── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        flexWrap: "wrap",
      }}>
        {[
          { color: "rgba(232,0,45,0.5)", label: "Notlar" },
          { color: "rgba(255,215,0,0.5)", label: "E. Ruh Hali" },
          { color: "rgba(34,197,94,0.5)", label: "Fotoğraflar" },
          { color: "rgba(100,180,255,0.5)", label: "O. Ruh Hali" },
        ].map(item => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{
              width: 10, height: 10, borderRadius: 3,
              background: item.color,
            }} />
            <span style={{ fontSize: 10, fontWeight: 500, color: "rgba(255,255,255,0.4)" }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* ── SELECTED DAY DETAIL (below calendar, not popup) ─── */}
      {selectedDate && !showTodayModal && (
        <div style={{
          background: "#181a20",
          borderRadius: 20,
          border: "1px solid rgba(255,255,255,0.08)",
          padding: 20,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}>
          {/* Header */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: "#fff", margin: 0 }}>
              Günün Anıları
            </h3>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
              {dayjs(selectedDate).locale("tr").format("DD MMMM YYYY")}
            </span>
          </div>

          {/* ── Photos ─── */}
          {selectedDayPhotos.length > 0 && (
            <div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {selectedDayPhotos.map((photo, idx) => {
                  const uploaderName = (photo.uploader as any)?.display_name || (photo.uploader as any)?.username || "?";
                  return (
                    <div
                      key={photo.id}
                      onClick={() => setLightboxIndex(idx)}
                      style={{
                        borderRadius: 16,
                        overflow: "hidden",
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        cursor: "pointer",
                      }}
                    >
                      {/* Photo */}
                      <div style={{ position: "relative", width: "100%", paddingTop: "56%", overflow: "hidden" }}>
                        <img
                          src={photo.image_url}
                          alt={photo.title || photo.description || "Fotoğraf"}
                          style={{
                            position: "absolute",
                            top: 0, left: 0,
                            width: "100%", height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </div>
                      
                      {/* Caption / Title */}
                      {(photo.title || photo.description) && (
                        <div style={{ padding: "12px 14px 4px" }}>
                          {photo.title && (
                            <h4 style={{
                              fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.9)",
                              marginBottom: photo.description ? 4 : 0,
                              lineHeight: 1.3
                            }}>
                              {photo.title}
                            </h4>
                          )}
                          {photo.description && (
                            <p style={{
                              fontSize: 13, color: "rgba(255,255,255,0.7)",
                              lineHeight: 1.5, margin: 0,
                            }}>
                              {photo.description}
                            </p>
                          )}
                        </div>
                      )}
                      
                      {/* Meta */}
                      <div style={{
                        padding: "8px 14px 12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                          👤 {uploaderName}
                        </span>
                        {photo.taken_time && (
                          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                            🕐 {photo.taken_time.substring(0, 5)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Notes (GÜNLÜK ÖZET) ─── */}
          {selectedDayNotes.length > 0 && (
            <div>
              <div style={{
                fontSize: 11,
                fontWeight: 700,
                color: "rgba(255,255,255,0.3)",
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 10,
                paddingLeft: 10,
                borderLeft: "3px solid #E8002D",
              }}>
                GÜNLÜK ÖZET
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {selectedDayNotes.map(note => {
                  const u = Array.isArray(note.user) ? note.user[0] : note.user;
                  return (
                    <div key={note.id} style={{
                      padding: 14,
                      borderRadius: 12,
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}>
                      <p style={{
                        fontSize: 13, color: "rgba(255,255,255,0.8)",
                        lineHeight: 1.6, whiteSpace: "pre-wrap", margin: 0,
                      }}>
                        {note.note}
                      </p>
                      <p style={{
                        fontSize: 11, color: "#E8002D", fontWeight: 600,
                        marginTop: 8,
                      }}>
                        — {u?.display_name || u?.username}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Moods ─── */}
          {selectedDayMoods.length > 0 && (
            <div>
              <div style={{
                fontSize: 11,
                fontWeight: 700,
                color: "rgba(255,255,255,0.3)",
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 10,
                paddingLeft: 10,
                borderLeft: "3px solid #FFD700",
              }}>
                RUH HALLERİ
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {selectedDayMoods.map((m, i) => {
                  const u = Array.isArray(m.user) ? m.user[0] : m.user;
                  return (
                    <div key={i} style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 14px",
                      borderRadius: 12,
                      background: "rgba(255,215,0,0.04)",
                      border: "1px solid rgba(255,215,0,0.1)",
                    }}>
                      <span style={{ fontSize: 24 }}>{m.mood_type}</span>
                      <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>
                        {u?.display_name || u?.username}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty state */}
          {selectedDayNotes.length === 0 && selectedDayMoods.length === 0 && selectedDayPhotos.length === 0 && (
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", textAlign: "center", padding: "20px 0" }}>
              Bu gün için henüz bir kayıt yok.
            </p>
          )}
        </div>
      )}

      {/* ── Today modal (only for today) ─── */}
      {mounted && createPortal(todayModal, document.body)}
    </>
  );
}
