import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AddMedicineForm } from "@/components/medicine/AddMedicineForm";
import { ArrowLeft, Pill, Trash2 } from "lucide-react";
import Link from "next/link";
import { AdminMedicineList } from "./AdminMedicineList";

export const metadata: Metadata = {
  title: "İlaç Yönetimi — Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminMedicinesPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/home");

  const supabase = createServerClient();

  const [medicinesResult, logsResult, usersResult] = await Promise.all([
    supabase
      .from("medicines")
      .select("*, user:users(username, display_name)")
      .order("created_at", { ascending: false }),
    supabase
      .from("medicine_logs")
      .select("*, user:users(username, display_name)")
      .order("date", { ascending: false }), // Fixed order to use date since taken_at doesn't exist
    supabase
      .from("users")
      .select("id, username")
      .eq("role", "USER")
  ]);

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
          <Pill size={20} style={{ color: "var(--gs-red)" }} />
          İlaç Yönetimi
        </h1>
      </div>

      <AddMedicineForm users={usersResult.data || []} />

      <div className="card p-5">
        <h2 className="font-bold text-white text-base mb-4">Tüm İlaçlar ve Kayıtlar</h2>
        <AdminMedicineList 
          medicines={medicinesResult.data || []} 
          logs={logsResult.data || []}
          users={usersResult.data || []}
        />
      </div>
    </div>
  );
}
