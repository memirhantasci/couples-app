"use client";

import { useState } from "react";
import { PhotoGrid } from "@/components/photos/PhotoGrid";
import dynamic from "next/dynamic";
const CalendarView = dynamic(
  () => import("@/components/calendar/CalendarView").then((mod) => mod.CalendarView),
  { ssr: false }
);
import type { Photo } from "@/components/photos/PhotoCard";

interface CalendarPageClientProps {
  notes: any[];
  moods: any[];
  photos: Photo[];
  currentUserId: number;
  currentUsername: string;
}

export function CalendarPageClient({ notes, moods, photos, currentUserId, currentUsername }: CalendarPageClientProps) {
  const [viewMode, setViewMode] = useState<"calendar" | "grid">("calendar");

  const photoDates = [...new Set(photos.map((p) => p.taken_date))];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* ── Tab Switcher ─── */}
      <div style={{
        display: "flex",
        background: "rgba(255,255,255,0.05)",
        borderRadius: 14,
        padding: 4,
        width: "100%",
        maxWidth: 260,
        margin: "0 auto",
      }}>
        <button
          onClick={() => setViewMode("calendar")}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: "10px 0",
            borderRadius: 12,
            border: "none",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 700,
            transition: "all 0.2s ease",
            background: viewMode === "calendar" ? "#E8002D" : "transparent",
            color: viewMode === "calendar" ? "#fff" : "rgba(255,255,255,0.45)",
          }}
        >
          Takvim
        </button>
        <button
          onClick={() => setViewMode("grid")}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: "10px 0",
            borderRadius: 12,
            border: "none",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 700,
            transition: "all 0.2s ease",
            background: viewMode === "grid" ? "#E8002D" : "transparent",
            color: viewMode === "grid" ? "#fff" : "rgba(255,255,255,0.45)",
          }}
        >
          Fotoğraflar
        </button>
      </div>

      {/* ── Content ─── */}
      {viewMode === "calendar" ? (
        <div>
          <CalendarView
            notes={notes}
            moods={moods}
            photos={photos}
            currentUsername={currentUsername}
            photoDates={photoDates}
          />
        </div>
      ) : (
        <div>
          <PhotoGrid
            photos={photos}
            currentUserId={currentUserId}
            showSearch
            showFilters
          />
        </div>
      )}
    </div>
  );
}
