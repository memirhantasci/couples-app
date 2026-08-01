import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { AddMemoryForm } from "@/components/memories/AddMemoryForm";
import { ArrowLeft, Camera } from "lucide-react";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Özel Günler Yönetimi — Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminMemoriesPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/home");

  const supabase = createServerClient();
  const { data: memories } = await supabase
    .from("memories")
    .select("id, date, title, description, image_url, is_default")
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
          <Camera size={20} style={{ color: "var(--gs-red)" }} />
          Özel Günler Yönetimi
        </h1>
      </div>

      <AddMemoryForm />
    </div>
  );
}
