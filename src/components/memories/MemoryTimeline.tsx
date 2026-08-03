"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Trash2, Plus, Pencil } from "lucide-react";
import { deleteMemoryAction } from "@/actions/memories";
import { toast } from "sonner";
import { dayjs } from "@/lib/date";
import { useState } from "react";
import { MemoryModal } from "./MemoryModal";

interface Memory {
  id: number;
  date: string;
  title: string;
  description?: string | null;
  image_url?: string | null;
  is_default?: boolean;
}

interface MemoryTimelineProps {
  memories: Memory[];
  isAdmin: boolean;
}

export function MemoryTimeline({ memories, isAdmin }: MemoryTimelineProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  async function handleDelete(id: number) {
    if (!confirm("Bu anıyı silmek istediğinize emin misiniz?")) return;
    const result = await deleteMemoryAction(id);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Anı silindi.");
    }
  }

  function handleEdit(memory: Memory) {
    setSelectedMemory(memory);
    setIsModalOpen(true);
  }

  function handleAdd() {
    setSelectedMemory(null);
    setIsModalOpen(true);
  }

  return (
    <>
      <div
        className="relative flex flex-col flex-1 min-h-full py-2 gap-4"
        style={{ paddingLeft: "8px", paddingRight: "8px" }}
      >
        {/* Header — title centered on its own row, edit button on the row below, right-aligned */}
        <div className="flex flex-col gap-2 mb-4 mt-2">
          <h2
            className="text-center w-full"
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: "#FFFFFF",
              letterSpacing: "0px",
            }}
          >
            Özel Günler ❤️
          </h2>
          <div className="flex justify-end w-full">
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className="text-[15px] font-semibold px-6 py-[10px] rounded-full transition-colors"
              style={{
                background: "#311822",
                color: "#E5B9C5",
              }}
            >
              {isEditMode ? "Bitti" : "Düzenle"}
            </button>
          </div>
        </div>

        {memories.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center gap-3 py-16 rounded-[20px] mt-2"
            style={{
              background: "var(--surface-2)",
              border: "1px dashed var(--border-default)",
            }}
          >
            <span className="text-5xl">📸</span>
            <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
              Henüz anı eklenmedi
            </p>
          </div>
        ) : (
          <div className="relative flex-1 flex flex-col py-2">
            {/* Vertical glowing line */}
            <div
              className="absolute"
              style={{
                left: 23,
                top: 0,
                bottom: 0,
                width: 2,
                background: "#FF2D55",
                boxShadow: "0 0 10px #FF2D55",
                zIndex: 0,
              }}
            />

            <div className="flex flex-col justify-evenly flex-1">
              {memories.map((memory, index) => {
                const d = dayjs(memory.date);
                const dayStr = d.format("DD");
                const monthStr = d.format("MMM");
                const yearStr = d.format("YYYY");
                const canManage = isEditMode && !memory.is_default;

                return (
                  <motion.div
                    key={memory.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06, duration: 0.35 }}
                    className="relative flex items-center py-3"
                    style={{ gap: "16px" }}
                  >
                    {/* Date circle */}
                    <div
                      className="relative z-10 flex-shrink-0 flex flex-col items-center justify-center rounded-full text-center"
                      style={{
                        width: 48,
                        height: 48,
                        background: "#0A0A0C",
                        border: "2px solid #FF2D55",
                        boxShadow: "0 0 15px rgba(255, 45, 85, 0.4)",
                      }}
                    >
                      <span className="text-[14px] font-bold leading-tight text-white">
                        {dayStr}
                      </span>
                      <span className="text-[11px] font-medium leading-tight text-white">
                        {monthStr}
                      </span>
                    </div>

                    {/* Card */}
                    <div
                      className="flex-1 flex flex-col justify-center min-h-[90px] rounded-[16px] px-5 py-4 relative overflow-hidden"
                      style={{
                        background:
                          "linear-gradient(135deg, #1C1C1E 0%, #121214 100%)",
                        border: "1px solid #FF2D55",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                      }}
                    >
                      <div className="flex items-start justify-between w-full">
                        {/* Title + year */}
                        <div className="flex flex-col z-10 min-w-0">
                          <h3 className="font-bold text-white text-[20px] leading-tight mb-1 truncate">
                            {memory.title}
                          </h3>
                          <span
                            className="text-[14px] font-medium text-white"
                            style={{ opacity: 0.9 }}
                          >
                            {yearStr}
                          </span>
                        </div>

                        {/* Edit / Delete icons — bare, no background, only in edit mode */}
                        <AnimatePresence>
                          {canManage && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.15 }}
                              className="flex flex-row gap-4 z-20 ml-2 flex-shrink-0"
                            >
                              <button
                                onClick={() => handleEdit(memory)}
                                aria-label="Anıyı düzenle"
                                className="flex items-center justify-center transition-opacity hover:opacity-70"
                              >
                                <Pencil size={19} color="#FFFFFF" strokeWidth={2.5} />
                              </button>
                              <button
                                onClick={() => handleDelete(memory.id)}
                                aria-label="Anıyı sil"
                                className="flex items-center justify-center transition-opacity hover:opacity-70"
                              >
                                <Trash2 size={19} color="#FFFFFF" strokeWidth={2.5} />
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {memory.image_url && (
                        <div
                          className="relative rounded-xl overflow-hidden mt-4 z-10"
                          style={{ height: 160 }}
                        >
                          <Image
                            src={memory.image_url}
                            alt={memory.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 500px) 100vw, 500px"
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom "Add" button — smaller, tidier, only in edit mode */}
        <AnimatePresence>
          {isEditMode && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.25 }}
              className="mt-2 mb-6 pb-20 flex justify-center w-full"
            >
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleAdd}
                className="flex items-center justify-center gap-2 font-semibold rounded-full shadow-md transition-all"
                style={{
                  background: "#FF3B30",
                  color: "#fff",
                  fontSize: "14px",
                  padding: "10px 22px",
                }}
              >
                <Plus size={16} strokeWidth={2.5} />
                Yeni Özel Gün Ekle
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <MemoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        memory={selectedMemory}
      />
    </>
  );
}
