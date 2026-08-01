import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LoginLogsTable } from "@/components/admin/LoginLogsTable";
import { ArrowLeft, Users } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Giriş Geçmişi — Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminLogsPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/home");

  const supabase = createServerClient();

  const { data: loginLogs } = await supabase
    .from("login_logs")
    .select("*, users(username, display_name)")
    .order("login_at", { ascending: false })
    .limit(50);

  return (
    <div className="px-4 py-6 flex flex-col gap-5 max-w-lg mx-auto">
      <div className="flex items-center gap-3">
        <Link
          href="/admin"
          className="w-20 h-20 shrink-0 flex items-center justify-center rounded-2xl transition-all"
          style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)" }}
        >
          <ArrowLeft size={40} />
        </Link>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Users size={20} style={{ color: "var(--gs-gold)" }} />
          Giriş Geçmişi
        </h1>
      </div>

      <LoginLogsTable logs={loginLogs || []} />
    </div>
  );
}
