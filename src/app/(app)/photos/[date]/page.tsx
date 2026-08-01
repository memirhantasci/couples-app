import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { PhotoGrid } from "@/components/photos/PhotoGrid";
import { BackButton } from "@/components/ui/BackButton";
import { decrypt, deterministicDecrypt } from "@/utils/crypto";

interface Props {
  params: Promise<{ date: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { date } = await params;
  const d = new Date(date + "T00:00:00");
  const label = d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
  return { title: `${label} Fotoğrafları — Emirhan & Öykü 💕` };
}

export const dynamic = "force-dynamic";

export default async function PhotoDayPage({ params }: Props) {
  const { date } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) notFound();

  const supabase = createServerClient();

  const { data: photos, error } = await supabase
    .from("photo_archive")
    .select(`
      id, user_id, image_url, storage_path, title, description,
      taken_date, taken_time, uploaded_at, exif_found, file_size,
      uploader:users(username, display_name)
    `)
    .eq("taken_date", date)
    .order("taken_time", { ascending: true });

  if (error) console.error("Photos fetch error:", error);

  const photoList = ((photos as any[]) ?? []).map(p => ({
    ...p,
    title: p.title ? decrypt(p.title) : null,
    description: decrypt(p.description),
    uploader: { ...p.uploader, username: deterministicDecrypt(p.uploader?.username) || p.uploader?.username }
  }));

  const d = new Date(date + "T00:00:00");
  const label = d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="px-4 py-5 flex flex-col gap-5 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <BackButton />
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            {label}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 2 }}>
            Bu Günde Çekilen Fotoğraflar • {photoList.length} fotoğraf
          </p>
        </div>
      </div>

      {/* Grid (no extra filters needed for day view) */}
      <PhotoGrid
        photos={photoList}
        currentUserId={session.userId}
        showSearch={false}
        showFilters={false}
      />
    </div>
  );
}
