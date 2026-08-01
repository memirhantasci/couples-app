import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Images, ArrowLeft, TrendingUp, Calendar, ScanLine, Edit } from "lucide-react";
import Link from "next/link";
import dayjs from "dayjs";
import { AdminPhotoGrid } from "@/components/admin/AdminPhotoGrid";
import { decrypt, deterministicDecrypt } from "@/utils/crypto";

export const metadata: Metadata = {
  title: "Tüm Fotoğraflar — Admin Paneli",
};

export const dynamic = "force-dynamic";

export default async function AdminPhotosPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/home");

  const supabase = createServerClient();
  const thisMonthStart = dayjs().startOf("month").toISOString();

  const [photosResult, thisMonthResult] = await Promise.all([
    supabase
      .from("photo_archive")
      .select(`
        id, user_id, image_url, storage_path, title, description,
        taken_date, taken_time, uploaded_at, exif_found, file_size,
        uploader:users(username, display_name)
      `)
      .order("uploaded_at", { ascending: false }),
    supabase
      .from("photo_archive")
      .select("id", { count: "exact" })
      .gte("uploaded_at", thisMonthStart),
  ]);

  const photos = ((photosResult.data as any[]) ?? []).map(p => ({
    ...p,
    title: p.title ? decrypt(p.title) : null,
    description: decrypt(p.description),
    uploader: { ...p.uploader, username: deterministicDecrypt(p.uploader?.username) || p.uploader?.username }
  }));
  const thisMonthCount = thisMonthResult.count ?? 0;
  const exifFoundCount = photos.filter((p) => p.exif_found).length;
  const exifManualCount = photos.length - exifFoundCount;

  const stats = [
    {
      label: "Toplam Fotoğraf",
      value: photos.length,
      icon: <Images size={18} style={{ color: "var(--gs-red)" }} />,
    },
    {
      label: "Bu Ay",
      value: thisMonthCount,
      icon: <Calendar size={18} style={{ color: "#818cf8" }} />,
    },
    {
      label: "EXIF Bulundu",
      value: exifFoundCount,
      icon: <ScanLine size={18} style={{ color: "#22c55e" }} />,
    },
    {
      label: "Manuel Tarih",
      value: exifManualCount,
      icon: <Edit size={18} style={{ color: "#f59e0b" }} />,
    },
  ];

  return (
    <div className="px-4 py-6 flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin"
          className="w-20 h-20 shrink-0 flex items-center justify-center rounded-2xl transition-all"
          style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}
        >
          <ArrowLeft size={40} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Images size={22} style={{ color: "#22c55e" }} />
            Tüm Fotoğraflar
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 2 }}>
            Sistemdeki tüm fotoğraflar — Admin görünümü
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl p-4 flex flex-col gap-2"
            style={{
              background: "rgba(19, 19, 39, 0.7)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div className="flex items-center gap-2">
              {stat.icon}
              <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>{stat.label}</span>
            </div>
            <span className="text-2xl font-bold text-white">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Photos grid with admin search/filters */}
      <AdminPhotoGrid photos={photos} />
    </div>
  );
}
