"use client";

import { useState, useMemo } from "react";
import { Search, X, Edit2 } from "lucide-react";
import { type Photo } from "./PhotoCard";
import { PhotoEditModal } from "./PhotoEditModal";
import { Lightbox } from "./Lightbox";

interface PhotoGridProps {
  photos: Photo[];
  currentUserId: number;
  showFilters?: boolean;
  showSearch?: boolean;
  onRefresh?: () => void;
}

type FilterType = "newest" | "oldest" | "this_month" | "this_year" | "mine" | "partner";

export function PhotoGrid({
  photos,
  currentUserId,
  showFilters = true,
  showSearch = true,
  onRefresh,
}: PhotoGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("newest");
  const [customDate, setCustomDate] = useState("");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);

  const filtered = useMemo(() => {
    let result = [...photos];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.taken_date.includes(q) ||
          (p.uploader?.display_name || p.uploader?.username || "").toLowerCase().includes(q)
      );
    }

    // Date filter
    if (customDate) {
      result = result.filter((p) => p.taken_date === customDate);
    } else {
      const now = new Date();
      if (filter === "this_month") {
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const year = now.getFullYear();
        result = result.filter((p) => p.taken_date.startsWith(`${year}-${month}`));
      } else if (filter === "this_year") {
        result = result.filter((p) => p.taken_date.startsWith(`${now.getFullYear()}`));
      } else if (filter === "mine") {
        result = result.filter((p) => p.user_id === currentUserId);
      } else if (filter === "partner") {
        result = result.filter((p) => p.user_id !== currentUserId);
      }
    }

    // Sort
    if (filter === "oldest") {
      result.sort((a, b) => {
        const da = `${a.taken_date}T${a.taken_time || "00:00"}`;
        const db = `${b.taken_date}T${b.taken_time || "00:00"}`;
        return da.localeCompare(db);
      });
    } else {
      result.sort((a, b) => {
        const da = `${a.taken_date}T${a.taken_time || "00:00"}`;
        const db = `${b.taken_date}T${b.taken_time || "00:00"}`;
        return db.localeCompare(da);
      });
    }

    return result;
  }, [photos, searchQuery, filter, customDate, currentUserId]);

  const filterLabels: { key: FilterType; label: string }[] = [
    { key: "newest", label: "En Yeni" },
    { key: "oldest", label: "En Eski" },
    { key: "this_month", label: "Bu Ay" },
    { key: "this_year", label: "Bu Yıl" },
    { key: "mine", label: "Benimkiler" },
    { key: "partner", label: "Partnerimin" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* ── Search ─── */}
      {showSearch && (
        <div style={{ position: "relative" }}>
          <Search
            size={16}
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              color: "rgba(255,255,255,0.3)",
            }}
          />
          <input
            type="text"
            placeholder="Başlık, açıklama veya tarih ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 40px 12px 42px",
              borderRadius: 14,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.9)",
              fontSize: 13,
              outline: "none",
              fontFamily: "inherit",
              boxSizing: "border-box",
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                color: "rgba(255,255,255,0.3)",
                cursor: "pointer",
                padding: 4,
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {/* ── Filter Pills ─── */}
      {showFilters && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              overflowX: "auto",
              paddingBottom: 2,
              scrollbarWidth: "none",
            }}
          >
            {filterLabels.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => { setFilter(key); setCustomDate(""); }}
                style={{
                  flexShrink: 0,
                  padding: "7px 14px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  border: "none",
                  ...(filter === key && !customDate
                    ? {
                        background: "#E8002D",
                        color: "#fff",
                      }
                    : {
                        background: "rgba(255,255,255,0.06)",
                        color: "rgba(255,255,255,0.5)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }),
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Date picker */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.6)",
                fontSize: 12,
                outline: "none",
                fontFamily: "inherit",
                colorScheme: "dark",
              }}
            />
            {customDate && (
              <button
                onClick={() => setCustomDate("")}
                style={{
                  padding: "8px 14px",
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 600,
                  background: "rgba(255,255,255,0.06)",
                  color: "rgba(255,255,255,0.5)",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Temizle
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Photo Count ─── */}
      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, margin: 0 }}>
        {filtered.length} fotoğraf
        {filtered.length !== photos.length ? ` (${photos.length} toplamdan)` : ""}
      </p>

      {/* ── Photo Cards ─── */}
      {filtered.length === 0 ? (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 0",
          gap: 12,
        }}>
          <span style={{ fontSize: 40, opacity: 0.2 }}>📷</span>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>
            {searchQuery || customDate
              ? "Aramanıza uygun fotoğraf bulunamadı."
              : "Henüz fotoğraf yüklenmemiş."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {filtered.map((photo, idx) => {
            const uploaderName = photo.uploader?.display_name || photo.uploader?.username || "?";
            const time = photo.taken_time ? photo.taken_time.substring(0, 5) : null;
            const dateFormatted = new Date(photo.taken_date + "T00:00:00").toLocaleDateString("tr-TR", {
              day: "numeric", month: "long", year: "numeric",
            });
            const isOwner = photo.user_id === currentUserId;

            return (
              <div
                key={photo.id}
                style={{
                  borderRadius: 20,
                  overflow: "hidden",
                  background: "#181a20",
                  border: "1px solid rgba(255,255,255,0.06)",
                  cursor: "pointer",
                }}
                onClick={() => setLightboxIndex(idx)}
              >
                {/* Image with overlay description */}
                <div style={{ position: "relative", width: "100%", aspectRatio: "16/10", overflow: "hidden" }}>
                  <img
                    src={photo.image_url}
                    alt={photo.title || photo.description}
                    loading="lazy"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  {/* Gradient overlay */}
                  <div style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 40%, transparent 60%)",
                  }} />

                  {/* Edit button */}
                  {isOwner && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingPhoto(photo);
                      }}
                      style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        padding: 8,
                        borderRadius: 10,
                        background: "rgba(232,0,45,0.85)",
                        border: "1px solid rgba(255,255,255,0.15)",
                        color: "#fff",
                        cursor: "pointer",
                      }}
                      title="Düzenle"
                    >
                      <Edit2 size={13} />
                    </button>
                  )}

                  {/* Title overlaid on image */}
                  {photo.title && (
                    <p style={{
                      position: "absolute",
                      bottom: 12,
                      left: 14,
                      right: 14,
                      fontSize: 15,
                      fontWeight: 700,
                      color: "#fff",
                      lineHeight: 1.3,
                      margin: 0,
                      textShadow: "0 1px 6px rgba(0,0,0,0.7)",
                    }}>
                      {photo.title}
                    </p>
                  )}
                </div>

                {/* Meta bar */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 12, color: "#E8002D" }}>👤</span>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>
                      {uploaderName}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                      📅 {dateFormatted}
                    </span>
                    {time && (
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>🕐</span>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                          {time}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Lightbox ─── */}
      {lightboxIndex !== null && (
        <Lightbox
          photos={filtered}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      {/* ── Edit Modal ─── */}
      {editingPhoto && (
        <PhotoEditModal
          photo={editingPhoto}
          onClose={() => setEditingPhoto(null)}
          onSuccess={() => {
            setEditingPhoto(null);
            onRefresh?.();
          }}
        />
      )}
    </div>
  );
}
