"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { togglePeriodLogAction } from "@/actions/period";
import { toast } from "sonner";
import { X, Check } from "lucide-react";
import { dayjs } from "@/lib/date";

interface PeriodLog {
  id: string;
  date: string;
}

interface PeriodTrackerClientProps {
  logs: PeriodLog[];
  isOyku: boolean;
}

export function PeriodTrackerClient({ logs, isOyku }: PeriodTrackerClientProps) {
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const events = logs
    .filter(log => dayjs(log.date).isValid())
    .map((log) => ({
      id: log.id,
      date: log.date,
      display: "background",
      backgroundColor: "rgba(200, 0, 30, 0.75)",
    }));

  const sortedLogs = [...logs].sort((a, b) => dayjs(b.date).unix() - dayjs(a.date).unix());

  function handleDateClick(info: { dateStr: string }) {
    if (!isOyku) {
      toast.error("Bu tabloyu sadece Öykü güncelleyebilir.");
      return;
    }

    const date = info.dateStr;
    const exists = logs.some((l) => l.date === date);

    if (!exists) {
      const monthLogsCount = logs.filter(l => dayjs(l.date).isSame(dayjs(date), "month")).length;
      if (monthLogsCount >= 2) {
        toast.error("Bir ay içerisinde en fazla 2 gün seçebilirsiniz.");
        return;
      }
    }

    setSelectedDate(date);
    setIsAdding(!exists);
  }

  function handleEventClick(info: any) {
    const dateStr = info.event.startStr.split("T")[0] || info.event.startStr;
    handleDateClick({ dateStr });
  }

  async function handleToggle() {
    if (!selectedDate) return;
    setLoading(true);
    const result = await togglePeriodLogAction(selectedDate);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(isAdding ? "Regl günü kaydedildi. ❤️" : "Kayıt silindi.");
      setSelectedDate(null);
    }
  }

  return (
    <>
      {/* ─── Calendar Card ─── */}
      <style>{`
        .period-calendar .fc {
          background: transparent;
          font-family: inherit;
        }
        .period-calendar .fc-toolbar {
          padding: 4px 8px 0;
        }
        .period-calendar .fc-toolbar-title {
          font-size: 17px !important;
          font-weight: 700 !important;
          color: #ffffff !important;
        }
        .period-calendar .fc-button {
          background: transparent !important;
          border: none !important;
          color: rgba(255,255,255,0.7) !important;
          font-size: 18px !important;
          padding: 2px 8px !important;
          box-shadow: none !important;
        }
        .period-calendar .fc-button:hover { color: #fff !important; }
        .period-calendar .fc-today-button {
          background: #E8002D !important;
          color: #fff !important;
          border-radius: 20px !important;
          font-size: 13px !important;
          font-weight: 600 !important;
          padding: 4px 14px !important;
          text-transform: none !important;
          opacity: 1 !important;
        }
        .period-calendar .fc-today-button:disabled {
          opacity: 1 !important;
        }
        .period-calendar .fc-col-header-cell-cushion {
          font-size: 12px !important;
          color: rgba(255,255,255,0.45) !important;
          font-weight: 500 !important;
          text-transform: uppercase !important;
        }
        .period-calendar .fc-daygrid-day-number {
          font-size: 14px !important;
          color: rgba(255,255,255,0.85) !important;
          font-weight: 500 !important;
          padding: 4px 6px !important;
          position: relative;
          z-index: 2;
        }
        .period-calendar .fc-day-other .fc-daygrid-day-number {
          color: rgba(255,255,255,0.2) !important;
        }
        .period-calendar .fc-day-today {
          background: transparent !important;
        }
        .period-calendar .fc-day-today .fc-daygrid-day-number {
          color: #ffffff !important;
          font-weight: 800 !important;
          z-index: 3;
        }
        .period-calendar .fc-bg-event {
          opacity: 1 !important;
          background: radial-gradient(circle, rgba(232, 0, 45, 0.5) 0%, rgba(139, 0, 0, 0.6) 40%, transparent 70%) !important;
        }
        .period-calendar .fc-daygrid-day-bg .fc-bg-event {
          border-radius: 50% !important;
          margin: 0 !important;
          width: 44px !important;
          height: 44px !important;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        .period-calendar .fc-daygrid-body-balanced .fc-daygrid-day-events {
          min-height: 0 !important;
        }
        .period-calendar .fc-theme-standard td,
        .period-calendar .fc-theme-standard th,
        .period-calendar .fc-theme-standard .fc-scrollgrid {
          border-color: rgba(255,255,255,0.05) !important;
        }
        .period-calendar .fc-scrollgrid {
          border: none !important;
        }
        .period-calendar .fc-scrollgrid-sync-inner {
          border: none !important;
        }
        .period-calendar .fc-daygrid-day-frame {
          min-height: 44px !important;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        /* Blood drop indicator for period days */
        .period-calendar .fc-bg-event::after {
          content: "🩸";
          position: absolute;
          bottom: 4px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 10px;
          line-height: 1;
        }
        /* Today highlight circle */
        .period-calendar .fc-day-today .fc-daygrid-day-number {
          background: #E8002D;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          display: flex !important;
          align-items: center;
          justify-content: center;
        }
      `}</style>

      {/* Page Title */}
      <h2 style={{
        fontSize: 24,
        fontWeight: 800,
        color: "#E8002D",
        textAlign: "center",
        marginTop: 16,
        marginBottom: 24,
        letterSpacing: "1px",
      }}>
        REGL TAKVİMİ 🩸
      </h2>

      <div
        className="period-calendar"
        style={{
          background: "#1c1c1e",
          borderRadius: 20,
          overflow: "hidden",
          marginBottom: 0,
        }}
      >
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale="tr"
          events={events}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          height="auto"
          showNonCurrentDates={false}
          fixedWeekCount={false}
          headerToolbar={{
            left: "prev,next",
            center: "title",
            right: "today",
          }}
        />
      </div>

      {/* ─── Past Records ─── */}
      <div style={{ marginTop: 28 }}>
        <h3
          className="font-bold"
          style={{ fontSize: 20, color: "#ffffff", marginBottom: 14 }}
        >
          Geçmiş Kayıtlar
        </h3>

        {sortedLogs.length === 0 ? (
          <div
            style={{
              padding: "32px 0",
              textAlign: "center",
              fontSize: 14,
              color: "rgba(255,255,255,0.35)",
            }}
          >
            Henüz hiç regl kaydı bulunmuyor.
          </div>
        ) : (
          <div className="flex flex-col" style={{ gap: 10 }}>
            {sortedLogs.map((log) => {
              const logDate = dayjs(log.date).tz("Europe/Istanbul");
              return (
                <div
                  key={log.id}
                  className="flex items-center justify-between"
                  style={{
                    background: "#1c1c1e",
                    borderRadius: 14,
                    padding: "14px 16px",
                  }}
                >
                  <div className="flex items-center gap-3">
                    {/* Blood drop icon */}
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, rgba(200,0,30,0.25) 0%, rgba(200,0,30,0.08) 100%)",
                        border: "1px solid rgba(200,0,30,0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <span style={{ fontSize: 20 }}>🩸</span>
                    </div>
                    <div className="flex flex-col">
                      <span
                        className="font-bold"
                        style={{ fontSize: 16, color: "rgba(255,255,255,0.9)" }}
                      >
                        {logDate.format("DD MMMM YYYY")}
                      </span>
                      <span
                        style={{ fontSize: 13, color: "#E8002D", fontWeight: 500 }}
                      >
                        {logDate.format("dddd")}
                      </span>
                    </div>
                  </div>

                  {/* Month label */}
                  <span
                    className="font-bold uppercase"
                    style={{
                      fontSize: 13,
                      color: "#c8922a",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {logDate.format("MMMM")}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Modal Popup ─── */}
      {mounted && typeof document !== "undefined" && createPortal(
        selectedDate ? (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              zIndex: 999999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1rem",
            }}
          >
            {/* Backdrop */}
            <div
              onClick={() => setSelectedDate(null)}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0,0,0,0.75)",
                cursor: "pointer",
              }}
            />

            {/* Modal Box */}
            <div
              style={{
                position: "relative",
                width: "100%",
                maxWidth: "22rem",
                background: "#1c1c1e",
                borderRadius: 20,
                padding: "28px 24px 24px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
                textAlign: "center",
                boxShadow: "0 30px 60px rgba(0,0,0,0.6)",
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #E8002D 0%, #B5001F 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 8px 24px rgba(232,0,45,0.4)",
                }}
              >
                <span style={{ fontSize: 28 }}>🩸</span>
              </div>

              <div>
                <h3
                  className="font-bold"
                  style={{ fontSize: 18, color: "#ffffff", marginBottom: 6 }}
                >
                  {dayjs(selectedDate).tz("Europe/Istanbul").format("DD MMMM YYYY")}
                </h3>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)" }}>
                  {isAdding
                    ? "Sıkıntılı günler başladı mı?"
                    : "Bu günkü kaydı silmek istediğine emin misin?"}
                </p>
              </div>

              {/* Buttons */}
              <div style={{ display: "flex", gap: 10, width: "100%", marginTop: 4 }}>
                <button
                  disabled={loading}
                  onClick={() => setSelectedDate(null)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: 12,
                    fontWeight: 600,
                    fontSize: 15,
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.7)",
                    cursor: "pointer",
                  }}
                >
                  İptal
                </button>
                <button
                  disabled={loading}
                  onClick={handleToggle}
                  style={{
                    flex: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: "12px",
                    borderRadius: 12,
                    fontWeight: 700,
                    fontSize: 15,
                    color: "#ffffff",
                    background: "#E8002D",
                    border: "none",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.7 : 1,
                    boxShadow: "0 4px 16px rgba(232,0,45,0.35)",
                  }}
                >
                  {loading ? (
                    <span>İşleniyor...</span>
                  ) : isAdding ? (
                    <>
                      <Check size={16} />
                      Evet
                    </>
                  ) : (
                    <>
                      <X size={16} />
                      Kaydı Sil
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : null,
        document.body
      )}
    </>
  );
}

