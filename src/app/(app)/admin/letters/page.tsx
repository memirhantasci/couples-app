import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";
import { AdminLetterList } from "@/components/admin/AdminLetterList";
import { decrypt, deterministicDecrypt } from "@/utils/crypto";

export const metadata: Metadata = {
  title: "Tüm Mektuplar — Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminLettersPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/home");

  const supabase = createServerClient();

  const { data: letters } = await supabase
    .from("letters")
    .select(`
      *,
      sender:users!letters_sender_id_fkey(username, display_name),
      receiver:users!letters_receiver_id_fkey(username, display_name)
    `)
    .order("created_at", { ascending: false });

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
          <Mail size={20} style={{ color: "var(--gs-gold)" }} />
          Tüm Mektuplar
        </h1>
      </div>

      <div className="card p-5">
        <h2 className="font-bold text-white text-base mb-4">Sistemdeki Tüm Mektuplar</h2>
        <AdminLetterList letters={(letters || []).map(l => ({
          ...l,
          content: decrypt(l.content),
          sender: { username: l.sender?.display_name || deterministicDecrypt(l.sender?.username) || l.sender?.username },
          receiver: { username: l.receiver?.display_name || deterministicDecrypt(l.receiver?.username) || l.receiver?.username }
        }))} />
      </div>
    </div>
  );
}
