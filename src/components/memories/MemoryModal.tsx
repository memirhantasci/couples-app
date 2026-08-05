"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, CalendarHeart, Loader2 } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { saveMemoryAction } from "@/actions/memories";
import { toast } from "sonner";

interface Memory {
  id: number;
  date: string;
  title: string;
  description?: string | null;
}

interface MemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  memory?: Memory | null; // If null, it's "Add", else "Edit"
}

export function MemoryModal({ isOpen, onClose, memory }: MemoryModalProps) {
  const [state, formAction, isPending] = useActionState(saveMemoryAction, {});

  // Local state for controlled inputs to allow prepopulating for Edit mode
  const [dateVal, setDateVal] = useState("");
  const [titleVal, setTitleVal] = useState("");
  const [descVal, setDescVal] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (memory) {
        setDateVal(memory.date);
        setTitleVal(memory.title);
        setDescVal(memory.description || "");
      } else {
        setDateVal(new Date().toISOString().split("T")[0]);
        setTitleVal("");
        setDescVal("");
      }
    }
  }, [isOpen, memory]);

  useEffect(() => {
    if ((state as any)?.success) {
      toast.success(memory ? "Anı güncellendi! ✨" : "Yeni anı eklendi! ✨");
      onClose();
    } else if ((state as any)?.error) {
      toast.error((state as any).error);
    }
  }, [state, onClose, memory]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
            onClick={onClose}
          >
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md overflow-hidden"
              style={{
                borderRadius: 32,
                padding: "32px 24px",
                background: "rgba(30, 30, 35, 0.7)",
                backdropFilter: "blur(40px)",
                WebkitBackdropFilter: "blur(40px)",
                border: "1px solid rgba(255,255,255,0.15)",
                boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
              }}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full transition-colors"
                style={{ background: "rgba(255,255,255,0.1)" }}
              >
                <X size={20} color="#fff" />
              </button>

              <div className="text-center mb-6">
                <div className="flex justify-center mb-4">
                  <div className="p-4 rounded-full" style={{ background: "rgba(232,0,45,0.15)" }}>
                    <CalendarHeart size={32} color="#E8002D" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-white">
                  {memory ? "Anıyı Düzenle" : "Özel Gün Ekle"}
                </h2>
                <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.6)" }}>
                  {memory ? "Bilgileri güncelleyebilirsin." : "Birlikte geçen güzel bir günü daha ölümsüzleştir."}
                </p>
              </div>

              <form action={formAction} className="flex flex-col gap-4">
                {/* Hidden input for ID (Edit Mode) */}
                {memory && <input type="hidden" name="id" value={memory.id} />}

                {/* Tarih */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium pl-1" style={{ color: "rgba(255,255,255,0.8)" }}>
                    Tarih
                  </label>
                  <input
                    type="date"
                    name="date"
                    required
                    value={dateVal}
                    max={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setDateVal(e.target.value)}
                    className="w-full"
                    style={{
                      padding: "12px 16px",
                      background: "rgba(0,0,0,0.3)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 16,
                      color: "#ffffff",
                      fontSize: 15,
                      outline: "none",
                      fontFamily: "inherit",
                    }}
                  />
                </div>

                {/* Başlık */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium pl-1" style={{ color: "rgba(255,255,255,0.8)" }}>
                    Başlık
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="Örn: İlk Tatilimiz"
                    value={titleVal}
                    onChange={(e) => setTitleVal(e.target.value)}
                    className="w-full"
                    style={{
                      padding: "12px 16px",
                      background: "rgba(0,0,0,0.3)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 16,
                      color: "#ffffff",
                      fontSize: 15,
                      outline: "none",
                    }}
                  />
                </div>

                {/* Açıklama */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium pl-1" style={{ color: "rgba(255,255,255,0.8)" }}>
                    Açıklama (İsteğe Bağlı)
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    placeholder="O gün neler hissettin?"
                    value={descVal}
                    onChange={(e) => setDescVal(e.target.value)}
                    className="w-full resize-none"
                    style={{
                      padding: "12px 16px",
                      background: "rgba(0,0,0,0.3)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 16,
                      color: "#ffffff",
                      fontSize: 15,
                      outline: "none",
                    }}
                  />
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isPending}
                  whileTap={{ scale: 0.97 }}
                  className="w-full flex items-center justify-center gap-2 font-bold mt-2"
                  style={{
                    padding: "16px 24px",
                    background: "linear-gradient(135deg, #E8002D 0%, #B5001F 100%)",
                    color: "#ffffff",
                    borderRadius: 16,
                    fontSize: 16,
                    boxShadow: "0 4px 20px rgba(232, 0, 45, 0.4)",
                  }}
                >
                  {isPending ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    "Kaydet ✨"
                  )}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
