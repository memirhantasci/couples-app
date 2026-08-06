import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MemoryTimeline } from "@/components/memories/MemoryTimeline";

export const metadata: Metadata = {
  title: "Özel Günlerimiz — Couples App 💕",
};

export const dynamic = "force-dynamic";

export default async function MemoriesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const supabase = createServerClient();

  const { data: memories } = await supabase
    .from("memories")
    .select("id, date, title, description, image_url, is_default")
    .eq("couple_id", session.coupleId)
    .order("date", { ascending: true });

  return (
    <div className="px-4 pt-5 pb-2 flex flex-col max-w-lg mx-auto" style={{ minHeight: "calc(100dvh - 150px)" }}>
      {/* Timeline with its own Header */}
      <div className="flex-1 flex flex-col min-h-0">
        <MemoryTimeline
          memories={memories ?? []}
          isAdmin={session.role === "ADMIN"}
        />
      </div>
    </div>
  );
}
