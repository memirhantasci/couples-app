"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { deleteMyDailyNoteAction, editMyDailyNoteAction } from "@/actions/notes";
import { toast } from "sonner";

interface DailyNoteUserCardProps {
  note: {
    id: number;
    content: string;
    date: string;
  };
}

export function DailyNoteUserCard({ note }: DailyNoteUserCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(note.content);
  const [isPending, setIsPending] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Bu günlük notu silmek istediğinize emin misiniz?")) return;
    setIsPending(true);
    const result = await deleteMyDailyNoteAction(note.id);
    setIsPending(false);
    
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Günlük not silindi.");
    }
  };

  const handleSave = async () => {
    if (!content.trim()) {
      toast.error("Not boş olamaz.");
      return;
    }
    setIsPending(true);
    const result = await editMyDailyNoteAction(note.id, content);
    setIsPending(false);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Günlük not güncellendi.");
      setIsEditing(false);
    }
  };

  return (
    <div
      className="flex-1 min-w-0 relative group"
      style={{
        background: "#1a1a1e",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 14,
        padding: 16,
      }}
    >
      {!isEditing && (
        <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 rounded-md hover:bg-white/10 text-white/50 hover:text-white transition-colors"
            title="Düzenle"
            disabled={isPending}
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 rounded-md hover:bg-red-500/20 text-white/50 hover:text-red-500 transition-colors"
            title="Sil"
            disabled={isPending}
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}

      {isEditing ? (
        <div className="flex flex-col gap-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-black/30 text-white p-3 rounded-lg border border-white/10 focus:border-red-500/50 outline-none resize-none"
            rows={4}
            disabled={isPending}
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setIsEditing(false);
                setContent(note.content);
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-md hover:bg-white/10 text-white/70 text-sm transition-colors"
              disabled={isPending}
            >
              <X size={14} />
              İptal
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm transition-colors"
              disabled={isPending}
            >
              <Check size={14} />
              Kaydet
            </button>
          </div>
        </div>
      ) : (
        <p
          className="whitespace-pre-wrap break-words"
          style={{
            fontSize: 13.5,
            color: "rgba(255,255,255,0.75)",
            lineHeight: 1.6,
          }}
        >
          {note.content}
        </p>
      )}
    </div>
  );
}
