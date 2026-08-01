import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PeriodTrackerClient } from "@/components/calendar/PeriodTrackerClient";

export const metadata: Metadata = {
  title: "Regl Takvimi — Emirhan & Öykü 💕",
  description: "Regl takibi",
};

export const dynamic = "force-dynamic";

export default async function PeriodTrackerPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const supabase = createServerClient();

  const { data: logs, error } = await supabase
    .from("period_logs")
    .select("id, date")
    .order("date", { ascending: false });

  if (error) console.error("Period logs fetch error:", error);

  const safeLogs = (logs as any[]) ?? [];
  const nameLower = session.displayName?.toLowerCase() || "";
  const isOyku = session.username === "oyku" || nameLower.includes("öykü") || nameLower.includes("oyku");

  return (
    <div
      className="px-4 pt-10 pb-20 flex flex-col max-w-lg mx-auto"
      style={{ background: "#0a0a0f", minHeight: "100%" }}
    >
      <PeriodTrackerClient logs={safeLogs} isOyku={isOyku} />
    </div>
  );
}
