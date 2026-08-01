"use client";

import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, X, ImageOff } from "lucide-react";
import type { Photo } from "@/components/photos/PhotoCard";
import { Lightbox } from "@/components/photos/Lightbox";
import dayjs from "dayjs";

interface AdminPhotoGridProps {
  photos: Photo[];
}

type FilterType = "newest" | "oldest" | "this_month" | "this_year";

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatUploadDate(ts: string): string {
  return new Date(ts).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AdminPhotoGrid({ photos }: AdminPhotoGridProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("newest");
  const [userFilter, setUserFilter] = useState("");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const users = useMemo(() => {
    const names = new Map<number, string>();
    photos.forEach((p) => {
      if (!names.has(p.user_id)) {
        names.set(p.user_id, (p as any).uploader?.display_name || (p as any).uploader?.username || `Kullanıcı ${p.user_id}`);
      }
    });
    return Array.from(names.entries()).map(([id, name]) => ({ id, name }));
  }, [photos]);

  const filtered = useMemo(() => {
    let result = [...photos];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.taken_date.includes(q) ||
          ((p as any).uploader?.display_name || (p as any).uploader?.username || "").toLowerCase().includes(q)
      );
    }

    // User filter
    if (userFilter) {
      result = result.filter((p) => p.user_id === Number(userFilter));
    }

    // Date filter
    const now = dayjs();
    if (filter === "this_month") {
      result = result.filter((p) => p.taken_date.startsWith(now.format("YYYY-MM")));
    } else if (filter === "this_year") {
      result = result.filter((p) => p.taken_date.startsWith(String(now.year())));
    }

    // Sort
    if (filter === "oldest") {
      result.sort((a, b) => a.taken_date.localeCompare(b.taken_date));
    } else {
      result.sort((a, b) => b.taken_date.localeCompare(a.taken_date));
    }

    return result;
  }, [photos, search, filter, userFilter]);

  const filterLabels: { key: FilterType; label: string }[] = [
    { key: "newest", label: "En Yeni" },
    { key: "oldest", label: "En Eski" },
    { key: "this_month", label: "Bu Ay" },
    { key: "this_year", label: "Bu Yıl" },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Controls */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.3)" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Başlık, açıklama, kullanıcı veya tarih..."
            className="input-glass text-sm"
            style={{ paddingLeft: 44 }}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.3)" }}>
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <SlidersHorizontal size={14} style={{ color: "rgba(255,255,255,0.35)" }} />
          {filterLabels.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={
                filter === key
                  ? { background: "var(--gs-red)", color: "white" }
                  : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)" }
              }
            >
              {label}
            </button>
          ))}
          {/* User filter */}
          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{
              background: userFilter ? "var(--gs-red)" : "rgba(255,255,255,0.06)",
              color: userFilter ? "white" : "rgba(255,255,255,0.5)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <option value="">Tüm Kullanıcılar</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
      </div>

      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>
        {filtered.length} fotoğraf gösteriliyor {filtered.length !== photos.length ? `(${photos.length} toplamdan)` : ""}
      </p>

      {/* Table/Card list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <ImageOff size={40} style={{ color: "rgba(255,255,255,0.15)" }} />
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>Fotoğraf bulunamadı.</p>
        </div>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
          {filtered.map((photo, idx) => {
            const uploaderName = (photo as any).uploader?.display_name || (photo as any).uploader?.username || "Bilinmiyor";
            const uploadedAt = (photo as any).uploaded_at;
            return (
              <div
                key={photo.id}
                className="group rounded-2xl overflow-hidden cursor-pointer"
                style={{
                  background: "rgba(19, 19, 39, 0.85)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
                onClick={() => setLightboxIndex(idx)}
              >
                <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
                  <img
                    src={photo.image_url}
                    alt={photo.title || photo.description}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div
                    className="absolute inset-x-0 bottom-0"
                    style={{ height: "40%", background: "linear-gradient(to top, rgba(8,8,17,0.8) 0%, transparent 100%)" }}
                  />
                  {/* EXIF badge */}
                  <div
                    className="absolute top-2 left-2 px-2 py-0.5 rounded-lg text-xs font-bold"
                    style={{
                      background: photo.exif_found ? "rgba(34,197,94,0.2)" : "rgba(245,158,11,0.2)",
                      color: photo.exif_found ? "#22c55e" : "#f59e0b",
                      border: `1px solid ${photo.exif_found ? "rgba(34,197,94,0.3)" : "rgba(245,158,11,0.3)"}`,
                    }}
                  >
                    {photo.exif_found ? "EXIF" : "Manuel"}
                  </div>
                </div>

                <div className="p-4 flex flex-col gap-1.5">
                  {photo.title && <p className="font-bold text-white text-sm line-clamp-1">{photo.title}</p>}
                  <p className="text-xs line-clamp-2" style={{ color: "rgba(255,255,255,0.5)" }}>{photo.description}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span style={{ color: "#22c55e", fontSize: 11, fontWeight: 600 }}>
                      📷 {formatDate(photo.taken_date)}
                    </span>
                    {photo.taken_time && (
                      <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>
                        {photo.taken_time.substring(0, 5)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>👤 {uploaderName}</span>
                    {uploadedAt && (
                      <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 10 }}>
                        {formatUploadDate(uploadedAt)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          photos={filtered}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}
