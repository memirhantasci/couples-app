"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, Clock, User, Edit2 } from "lucide-react";
import { PhotoEditModal } from "./PhotoEditModal";

export interface Photo {
  id: string;
  user_id: number;
  image_url: string;
  storage_path: string;
  title: string | null;
  description: string;
  taken_date: string;
  taken_time: string | null;
  uploaded_at: string;
  exif_found: boolean;
  file_size?: number | null;
  uploader?: { username: string; display_name?: string };
}

interface PhotoCardProps {
  photo: Photo;
  currentUserId: number;
  onClick: (photo: Photo) => void;
  onUpdated?: () => void;
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

export function PhotoCard({ photo, currentUserId, onClick, onUpdated }: PhotoCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const isOwner = photo.user_id === currentUserId;
  const uploaderName = photo.uploader?.display_name || photo.uploader?.username || "Bilinmiyor";
  const time = formatTime(photo.taken_time);

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -3, scale: 1.01 }}
        transition={{ duration: 0.22 }}
        className="group relative rounded-[18px] overflow-hidden cursor-pointer"
        style={{
          background: "var(--surface-2)",
          border: "1px solid var(--border-subtle)",
          boxShadow: "0 2px 16px rgba(0,0,0,0.3)",
        }}
        onClick={() => onClick(photo)}
      >
        {/* Image */}
        <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
          <img
            src={photo.image_url}
            alt={photo.title || photo.description}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {/* Gradient overlay */}
          <div
            className="absolute inset-x-0 bottom-0"
            style={{
              height: "55%",
              background: "linear-gradient(to top, rgba(17,17,20,0.90) 0%, transparent 100%)",
            }}
          />

          {/* Edit button for owner */}
          {isOwner && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditOpen(true);
              }}
              className="absolute top-2.5 right-2.5 p-2 rounded-[10px] opacity-0 group-hover:opacity-100 transition-all duration-200"
              style={{
                background: "rgba(232, 0, 45, 0.85)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
              title="Düzenle"
            >
              <Edit2 size={13} color="white" />
            </button>
          )}

          {/* Date badge */}
          <div
            className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-[8px]"
            style={{
              background: "rgba(17,17,20,0.80)",
              border: "1px solid rgba(255,255,255,0.10)",
            }}
          >
            <Camera size={10} style={{ color: "var(--gs-red)" }} />
            <span className="text-[11px] font-600" style={{ color: "rgba(255,255,255,0.90)", fontWeight: 600 }}>
              {formatDate(photo.taken_date)}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-3.5 flex flex-col gap-1.5">
          {photo.title && (
            <h3 className="font-semibold text-sm leading-snug line-clamp-1" style={{ color: "var(--text-primary)" }}>
              {photo.title}
            </h3>
          )}
          <p className="text-xs line-clamp-2 leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
            {photo.description}
          </p>

          <div className="flex items-center justify-between mt-0.5">
            <div className="flex items-center gap-1.5">
              <User size={10} style={{ color: "var(--text-tertiary)" }} />
              <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                {uploaderName}
              </span>
            </div>
            {time && (
              <div className="flex items-center gap-1">
                <Clock size={10} style={{ color: "var(--text-tertiary)" }} />
                <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>{time}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {editOpen && (
        <PhotoEditModal
          photo={photo}
          onClose={() => setEditOpen(false)}
          onSuccess={() => {
            setEditOpen(false);
            onUpdated?.();
          }}
        />
      )}
    </>
  );
}
