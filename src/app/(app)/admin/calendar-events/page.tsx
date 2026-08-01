import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ArrowLeft, CalendarDays, User } from "lucide-react";
import Link from "next/link";
import { DeleteCalendarEventButton, EditCalendarEventModal } from "@/components/admin/AdminActionButtons";
import { dayjs } from "@/lib/date";


export const metadata: Metadata = {
  title: "Kullanıcı Takvim Etkinlikleri — Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminCalendarEventsPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/home");

  const supabase = createServerClient();

  const { data: eventsResult } = await supabase
    .from("calendar_notes")
    .select("*, user:users(username, display_name)")
    .order("date", { ascending: false });

  const events = (eventsResult as any) ?? [];

  return (
    <div className="px-4 py-6 flex flex-col gap-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3">
        <Link
          href="/admin"
          className="w-20 h-20 shrink-0 flex items-center justify-center rounded-2xl transition-all"
          style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)" }}
        >
          <ArrowLeft size={40} />
        </Link>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <CalendarDays size={20} style={{ color: "#ffffff" }} />
          Takvim Notları
        </h1>
      </div>

      <div className="card p-5">
        <h2 className="font-bold text-white text-base mb-4">Eklenen Tüm Olaylar</h2>
        
        {!events?.length ? (
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>Hiç etkinlik bulunamadı.</p>
        ) : (
          <div className="flex flex-col gap-6">
            {events.map((event: any) => {
              const userObj = Array.isArray(event.user) ? event.user[0] : event.user;
              const username = userObj?.display_name || userObj?.username;
              return (
              <div 
                key={event.id}
                className="p-4 rounded-xl flex flex-col gap-2"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-1">
                  <div className="flex items-center gap-2">
                    <CalendarDays size={16} style={{ color: "#ffffff" }} />
                    <span className="text-sm font-bold text-white">
                      {dayjs(event.date).tz("Europe/Istanbul").format("DD MMMM YYYY")}
                    </span>
                  </div>
                  {username && (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <User size={12} style={{ color: "rgba(255,255,255,0.6)" }} />
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>
                        {username}
                      </span>
                    </div>
                  )}
                </div>
                
                <p className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed">
                  {event.note || "Açıklama yok."}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex-1">
                    <EditCalendarEventModal id={event.id} currentContent={event.note || ""} />
                  </div>
                  <div className="flex-1">
                    <DeleteCalendarEventButton id={event.id} />
                  </div>
                </div>
              </div>
            )})}
          </div>
        )}
      </div>
    </div>
  );
}
