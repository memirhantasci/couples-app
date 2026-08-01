import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ArrowLeft, BookOpen, User } from "lucide-react";
import Link from "next/link";
import { DeleteDailyNoteButton, EditDailyNoteModal } from "@/components/admin/AdminActionButtons";
import { dayjs } from "@/lib/date";
import { decrypt, deterministicDecrypt } from "@/utils/crypto";

export const metadata: Metadata = {
  title: "Günlük Notlar — Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminDailyNotesPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/home");

  const supabase = createServerClient();

  const { data: notes } = await supabase
    .from("daily_notes")
    .select(`
      *,
      user:users(username, display_name)
    `)
    .order("date", { ascending: false });

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
          <BookOpen size={20} style={{ color: "#ffffff" }} />
          Günlük Notlar
        </h1>
      </div>

      <div className="card p-5">
        <h2 className="font-bold text-white text-base mb-4">Kullanıcıların Notları</h2>
        
        {!notes?.length ? (
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>Hiç not bulunamadı.</p>
        ) : (
          <div className="flex flex-col gap-6">
            {notes.map((note) => (
              <div 
                key={note.id}
                className="p-4 rounded-xl flex flex-col gap-2"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-1">
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} style={{ color: "#ffffff" }} />
                    <span className="text-sm font-bold text-white">
                      {dayjs(note.date).format("DD MMMM YYYY")}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-md" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <User size={12} style={{ color: "rgba(255,255,255,0.5)" }} />
                    <span className="text-xs font-semibold text-white/80 uppercase">
                      {note.user?.display_name || deterministicDecrypt(note.user?.username) || note.user?.username || "Bilinmiyor"}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed mt-1">
                  {decrypt(note.content) || "Açıklama yok."}
                </p>
                
                <div className="text-right mt-1">
                  <span className="text-[10px] text-white/40">
                    Oluşturulma: {dayjs(note.created_at).tz("Europe/Istanbul").format("DD MMM HH:mm")}
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <EditDailyNoteModal id={note.id} currentContent={decrypt(note.content) || ""} />
                  </div>
                  <div className="flex-1">
                    <DeleteDailyNoteButton id={note.id} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
