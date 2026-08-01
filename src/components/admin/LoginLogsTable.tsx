"use client";

import { useState } from "react";
import { Monitor, Smartphone, Tablet, Globe, Clock, User } from "lucide-react";
import { dayjs } from "@/lib/date";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

interface LoginLog {
  id: number;
  user_id: number;
  login_at: string;
  logout_at: string | null;
  session_duration: number | null;
  ip_address: string | null;
  browser: string | null;
  operating_system: string | null;
  device_type: string | null;
  users?: { username: string; display_name?: string };
}

interface LoginLogsTableProps {
  logs: LoginLog[];
}

function DeviceIcon({ type }: { type: string | null }) {
  if (type === "mobile") return <Smartphone size={14} />;
  if (type === "tablet") return <Tablet size={14} />;
  return <Monitor size={14} />;
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return "—";
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}dk`;
  return `${Math.floor(seconds / 3600)}sa ${Math.floor((seconds % 3600) / 60)}dk`;
}

export function LoginLogsTable({ logs }: LoginLogsTableProps) {
  const [filter, setFilter] = useState<"all" | "emirhan" | "oyku">("all");

  const filtered = logs.filter((log) => {
    if (filter === "all") return true;
    const u = Array.isArray(log.users) ? log.users[0] : log.users;
    
    if (filter === "oyku") {
      return u?.display_name?.toLowerCase() === "öykü" || u?.username?.toLowerCase() === "oyku";
    }
    
    if (filter === "emirhan") {
      return u?.display_name?.toLowerCase() === "emirhan" || u?.username?.toLowerCase() === "emirhan";
    }

    return u?.username?.toLowerCase() === filter;
  });

  return (
    <div className="card p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-white text-sm">Giriş Geçmişi</h3>
        <div className="flex gap-1">
          {(["all", "emirhan", "oyku"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: filter === f ? "var(--gs-red)" : "rgba(255,255,255,0.06)",
                color: filter === f ? "#fff" : "rgba(255,255,255,0.4)",
              }}
            >
              {f === "all" ? "Tümü" : f === "emirhan" ? "Emirhan" : "Öykü"}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div
          className="py-8 text-center text-sm"
          style={{ color: "rgba(255,255,255,0.3)" }}
        >
          Kayıt bulunamadı
        </div>
      ) : (
        <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
          {filtered.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-3 p-3 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {/* Device icon */}
              <div
                className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0"
                style={{
                  background: "rgba(232,0,45,0.1)",
                  color: "rgba(232,0,45,0.7)",
                  marginTop: 2,
                }}
              >
                <DeviceIcon type={log.device_type} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-white text-base">
                    {(() => {
                      const u = Array.isArray(log.users) ? log.users[0] : log.users;
                      return u?.display_name || u?.username || "Bilinmeyen";
                    })()}
                  </span>
                  <span
                    className="text-sm font-medium"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    {dayjs(log.login_at).tz("Europe/Istanbul").format("DD MMMM YYYY HH:mm")}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5 mt-1">
                  {log.browser && (
                    <span
                      className="flex items-center gap-1.5 text-sm"
                      style={{ color: "rgba(255,255,255,0.6)" }}
                    >
                      <Globe size={14} />
                      {log.browser}
                      {log.operating_system && ` • ${log.operating_system}`}
                    </span>
                  )}
                  {log.ip_address && log.ip_address !== "unknown" && (
                    <span
                      className="text-sm font-mono font-medium"
                      style={{ color: "var(--gs-gold)" }}
                    >
                      IP: {log.ip_address}
                    </span>
                  )}
                  <span
                    className="flex items-center gap-1.5 text-sm mt-1"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                  >
                    <Clock size={14} />
                    Süre: {formatDuration(log.session_duration)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
