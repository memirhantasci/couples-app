"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import type { Photo } from "./PhotoCard";

interface LightboxProps {
  photos: Photo[];
  initialIndex: number;
  onClose: () => void;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(timeStr: string | null): string | null {
  if (!timeStr) return null;
  return timeStr.substring(0, 5);
}

export function Lightbox({ photos, initialIndex, onClose }: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [mounted, setMounted] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => { setMounted(true); }, []);

  const photo = photos[currentIndex];
  const uploaderName = photo?.uploader?.display_name || photo?.uploader?.username || "?";
  const time = formatTime(photo?.taken_time);

  const goNext = useCallback(() => {
    setZoom(1);
    setCurrentIndex((i) => (i + 1) % photos.length);
  }, [photos.length]);

  const goPrev = useCallback(() => {
    setZoom(1);
    setCurrentIndex((i) => (i - 1 + photos.length) % photos.length);
  }, [photos.length]);

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Keyboard
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev, onClose]);

  // Touch swipe
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    if (Math.abs(dy) > 100 && Math.abs(dy) > Math.abs(dx)) {
      onClose();
    } else if (Math.abs(dx) > 50) {
      dx < 0 ? goNext() : goPrev();
    }
    touchStartRef.current = null;
  };

  if (!photo || !mounted) return null;

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        background: "rgba(0,0,0,0.96)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.5))}
            style={{
              padding: 8, borderRadius: 10,
              background: "rgba(255,255,255,0.08)", border: "none",
              color: "rgba(255,255,255,0.6)", cursor: "pointer",
            }}
          >
            <ZoomOut size={16} />
          </button>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, minWidth: 40, textAlign: "center" }}>
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(4, z + 0.5))}
            style={{
              padding: 8, borderRadius: 10,
              background: "rgba(255,255,255,0.08)", border: "none",
              color: "rgba(255,255,255,0.6)", cursor: "pointer",
            }}
          >
            <ZoomIn size={16} />
          </button>
        </div>

        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: 600 }}>
          {currentIndex + 1} / {photos.length}
        </span>

        <button
          onClick={onClose}
          style={{
            padding: 8, borderRadius: 10,
            background: "rgba(232,0,45,0.2)", border: "none",
            color: "#ff6b6b", cursor: "pointer",
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Image Area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          touchAction: "none",
        }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onDoubleClick={() => setZoom((z) => z === 1 ? 2.5 : 1)}
      >
        {/* Prev */}
        {photos.length > 1 && (
          <button
            onClick={goPrev}
            style={{
              position: "absolute", left: 8, zIndex: 10,
              padding: 10, borderRadius: 14,
              background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.12)",
              color: "white", cursor: "pointer",
            }}
          >
            <ChevronLeft size={22} />
          </button>
        )}

        <img
          src={photo.image_url}
          alt={photo.title || photo.description || "Fotoğraf"}
          style={{
            maxWidth: "90%",
            maxHeight: "calc(100vh - 220px)",
            objectFit: "contain",
            transform: `scale(${zoom})`,
            transition: "transform 0.2s ease",
            borderRadius: 8,
          }}
        />

        {/* Next */}
        {photos.length > 1 && (
          <button
            onClick={goNext}
            style={{
              position: "absolute", right: 8, zIndex: 10,
              padding: 10, borderRadius: 14,
              background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.12)",
              color: "white", cursor: "pointer",
            }}
          >
            <ChevronRight size={22} />
          </button>
        )}
      </div>

      {/* Bottom Info */}
      <div
        style={{
          flexShrink: 0,
          padding: "12px 16px",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          maxHeight: 160,
          overflowY: "auto",
        }}
      >
        {photo.title?.trim() && (
          <h3 style={{ color: "#fff", fontSize: 15, fontWeight: 700, margin: "0 0 4px" }}>
            {photo.title}
          </h3>
        )}
        {photo.description?.trim() && (
          <p style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: 13,
            margin: "0 0 8px",
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
          }}>
            {photo.description}
          </p>
        )}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, fontSize: 12 }}>
          <span style={{ color: "rgba(255,255,255,0.45)" }}>📅 {formatDate(photo.taken_date)}</span>
          {time && <span style={{ color: "rgba(255,255,255,0.45)" }}>🕐 {time}</span>}
          <span style={{ color: "rgba(255,255,255,0.45)" }}>👤 {uploaderName}</span>
        </div>
      </div>

      {/* Dot indicators */}
      {photos.length > 1 && photos.length <= 20 && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 6, paddingBottom: 14, flexShrink: 0,
        }}>
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => { setZoom(1); setCurrentIndex(i); }}
              style={{
                width: i === currentIndex ? 18 : 6,
                height: 6,
                borderRadius: 3,
                background: i === currentIndex ? "#E8002D" : "rgba(255,255,255,0.25)",
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            />
          ))}
        </div>
      )}
    </div>,
    document.body
  );
}
