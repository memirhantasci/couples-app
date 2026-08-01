import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MoodChart } from "@/components/admin/MoodChart";
import { ArrowLeft, LineChart } from "lucide-react";
import Link from "next/link";
import { dayjs } from "@/lib/date";

export const metadata: Metadata = {
  title: "Ruh Hali İstatistikleri — Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminMoodsPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/home");

  const supabase = createServerClient();
  const today = dayjs().tz("Europe/Istanbul").format("YYYY-MM-DD");
  const thirtyDaysAgo = dayjs().subtract(29, "day").tz("Europe/Istanbul").format("YYYY-MM-DD");

  const [moodsResult, usersResult] = await Promise.all([
    supabase
      .from("moods")
      .select("date, mood_type, user_id")
      .gte("date", thirtyDaysAgo)
      .lte("date", today)
      .order("date"),
    supabase
      .from("users")
      .select("id, username, display_name"),
  ]);

  const moods = moodsResult.data ?? [];
  const users = usersResult.data ?? [];

  return (
    <div className="px-4 py-6 flex flex-col gap-5 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <Link
          href="/admin"
          className="w-20 h-20 shrink-0 flex items-center justify-center rounded-2xl transition-all"
          style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)" }}
        >
          <ArrowLeft size={40} />
        </Link>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <LineChart size={20} style={{ color: "var(--gs-red)" }} />
          Ruh Hali İstatistikleri
        </h1>
      </div>

      <MoodChart moods={moods} users={users} />
    </div>
  );
}
