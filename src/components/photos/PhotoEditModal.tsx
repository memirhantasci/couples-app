"use client";

import { useState } from "react";
import { useActionState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, Clock, Calendar, AlignLeft, Type, Save } from "lucide-react";
import { updatePhotoAction, type PhotoActionState } from "@/actions/photos";
import type { Photo } from "./PhotoCard";

interface PhotoEditModalProps {
  photo: Photo;
  onClose: () => void;
  onSuccess: () => void;
}

const initialState: PhotoActionState = {};

export function PhotoEditModal({ photo, onClose, onSuccess }: PhotoEditModalProps) {
  const [state, formAction, isPending] = useActionState(updatePhotoAction, initialState);

  if (state?.success) {
    onSuccess();
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-4"
        style={{ background: "rgba(4, 4, 12, 0.88)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
          className="w-full max-w-md rounded-3xl overflow-hidden"
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border-default)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <h2 className="font-bold text-white text-base flex items-center gap-2">
              <Camera size={16} style={{ color: "var(--gs-red)" }} />
              Fotoğrafı Düzenle
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl transition-all"
              style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Form */}
          <form action={formAction} className="p-6 flex flex-col gap-4">
            <input type="hidden" name="photo_id" value={photo.id} />

            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                <Type size={12} /> Başlık (isteğe bağlı)
              </label>
              <input
                name="title"
                type="text"
                defaultValue={photo.title || ""}
                placeholder="Fotoğraf başlığı"
                className="input-glass text-sm"
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                <AlignLeft size={12} /> Açıklama *
              </label>
              <textarea
                name="description"
                rows={3}
                required
                defaultValue={photo.description}
                placeholder="Bu fotoğraf hakkında..."
                className="input-glass text-sm resize-none"
                style={{ lineHeight: 1.6 }}
              />
            </div>

            {/* Date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                <Calendar size={12} /> Çekim Tarihi *
              </label>
              <input
                name="taken_date"
                type="date"
                required
                defaultValue={photo.taken_date}
                className="input-glass text-sm"
              />
            </div>

            {/* Time */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                <Clock size={12} /> Çekim Saati (isteğe bağlı)
              </label>
              <input
                name="taken_time"
                type="time"
                defaultValue={photo.taken_time || ""}
                className="input-glass text-sm"
              />
            </div>

            {/* Error */}
            {state?.error && (
              <div
                className="px-4 py-3 rounded-xl text-sm"
                style={{
                  background: "rgba(232,0,45,0.1)",
                  border: "1px solid rgba(232,0,45,0.25)",
                  color: "#FF4D6D",
                }}
              >
                ⚠️ {state.error}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 mt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  color: "rgba(255,255,255,0.55)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(135deg, var(--gs-red) 0%, #B5001F 100%)",
                  color: "white",
                  opacity: isPending ? 0.7 : 1,
                }}
              >
                {isPending ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <>
                    <Save size={14} />
                    Kaydet
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
