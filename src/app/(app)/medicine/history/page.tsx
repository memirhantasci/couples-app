import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { dayjs } from "@/lib/date";
import "dayjs/locale/tr";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "İlaç Geçmişi — Couples App 💕",
};

export const dynamic = "force-dynamic";

export default async function MedicineHistoryPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const supabase = createServerClient();

  // Fetch users in the couple
  const { data: usersData } = await supabase
    .from("users")
    .select("id, display_name")
    .eq("couple_id", session.coupleId as number);

  const users = usersData ?? [];
  const userMap = new Map(users.map(u => [u.id, u.display_name]));

  // Fetch all medicines
  const { data: medicinesData } = await supabase
    .from("medicines")
    .select("id, name, time")
    .eq("couple_id", session.coupleId as number);
    
  const medicines = medicinesData ?? [];
  const medicineMap = new Map(medicines.map(m => [m.id, m.name]));

  // Fetch past medicine logs, order by date descending
  // We'll limit to last 100 or so for performance, or just all.
  const { data: logsData } = await supabase
    .from("medicine_logs")
    .select("id, medicine_id, status, date, time, user_id")
    .eq("couple_id", session.coupleId as number)
    .order("date", { ascending: false })
    .order("time", { ascending: false })
    .limit(300);

  const logs = logsData ?? [];

  // Group logs by date
  const groupedLogs: Record<string, typeof logs> = {};
  logs.forEach(log => {
    if (!groupedLogs[log.date]) {
      groupedLogs[log.date] = [];
    }
    groupedLogs[log.date].push(log);
  });

  const dates = Object.keys(groupedLogs).sort((a, b) => b.localeCompare(a));

  return (
    <div
      className="flex flex-col max-w-lg mx-auto pb-24 min-h-[100dvh]"
      style={{ backgroundColor: "#000000", color: "#ffffff" }}
    >
      <div className="sticky top-0 z-10 px-4 py-4 flex items-center gap-4" style={{ backgroundColor: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)" }}>
        <Link href="/medicine" className="p-2 rounded-full hover:bg-white/10 transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-xl font-bold">İlaç Geçmişi</h1>
      </div>

      <div className="px-4 py-2 flex flex-col gap-6">
        {dates.length === 0 ? (
          <p className="text-center text-white/50 py-10">Henüz hiç kayıt bulunmuyor.</p>
        ) : (
          dates.map(dateStr => {
            const dateLabel = dayjs(dateStr).locale("tr").format("D MMMM YYYY, dddd");
            const dayLogs = groupedLogs[dateStr];

            return (
              <div key={dateStr} className="flex flex-col gap-3">
                <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">{dateLabel}</h2>
                <div className="flex flex-col gap-2">
                  {dayLogs.map(log => {
                    const userName = userMap.get(log.user_id) || "Bilinmeyen Kullanıcı";
                    const medName = medicineMap.get(log.medicine_id) || "Bilinmeyen İlaç";
                    
                    let statusIcon = <Clock size={16} className="text-yellow-500" />;
                    let statusText = "Bekliyor";
                    let bgStyle = "rgba(234, 179, 8, 0.1)";
                    let borderStyle = "rgba(234, 179, 8, 0.2)";

                    if (log.status === "DRANK") {
                      statusIcon = <CheckCircle2 size={16} className="text-green-500" />;
                      statusText = "İçildi";
                      bgStyle = "rgba(34, 197, 94, 0.1)";
                      borderStyle = "rgba(34, 197, 94, 0.2)";
                    } else if (log.status === "MISSED") {
                      statusIcon = <XCircle size={16} className="text-red-500" />;
                      statusText = "Kaçırıldı";
                      bgStyle = "rgba(239, 68, 68, 0.1)";
                      borderStyle = "rgba(239, 68, 68, 0.2)";
                    }

                    return (
                      <div 
                        key={log.id} 
                        className="flex items-center justify-between p-3 rounded-2xl border"
                        style={{ backgroundColor: bgStyle, borderColor: borderStyle }}
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium text-[15px]">{medName}</span>
                          <span className="text-xs text-white/50 flex items-center gap-1">
                            <span>{userName}</span>
                            <span>•</span>
                            <span>{log.time || "08:00"}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 border border-white/5">
                          {statusIcon}
                          <span className="text-xs font-medium">{statusText}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
