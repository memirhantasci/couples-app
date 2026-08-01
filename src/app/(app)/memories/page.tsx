import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MemoryTimeline } from "@/components/memories/MemoryTimeline";
import { Camera } from "lucide-react";
import dayjs from "dayjs";

export const metadata: Metadata = {
  title: "Özel Günlerimiz — Emirhan & Öykü 💕",
};

export const dynamic = "force-dynamic";

export default async function MemoriesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const supabase = createServerClient();

  const { data: memories } = await supabase
    .from("memories")
    .select("id, date, title, description, image_url, is_default")
    .order("date", { ascending: true });

  return (
    <div className="px-4 pt-5 pb-2 flex flex-col max-w-lg mx-auto" style={{ minHeight: "calc(100dvh - 150px)" }}>
      {/* Header */}
      <div className="text-center mb-4 mt-2 flex-shrink-0">
        <h2 style={{
          fontSize: 24,
          fontWeight: 800,
          color: "#E8002D",
          textAlign: "center",
          letterSpacing: "1px",
        }}>
          ÖZEL GÜNLER 🥂
        </h2>
      </div>

      {/* Timeline */}
      <div className="flex-1 flex flex-col min-h-0">
        <MemoryTimeline
          memories={memories ?? []}
          isAdmin={session.role === "ADMIN"}
        />
      </div>
    </div>
  );
}
