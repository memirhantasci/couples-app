"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { deleteMemoryAction } from "@/actions/memories";
import { toast } from "sonner";
import { dayjs } from "@/lib/date";

interface Memory {
  id: number;
  date: string;
  title: string;
  description?: string | null;
  image_url?: string | null;
  is_default?: boolean;
}

// Map memory titles to emojis to match the design exactly
function getMemoryEmoji(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("tanış")) return "💫";
  if (t.includes("sevgili olduk")) return "💍";
  if (t.includes("sevgililer")) return "💖";
  if (t.includes("doğum")) return "🎂";
  if (t.includes("halloween")) return "🎃";
  if (t.includes("yılbaşı")) return "🎆";
  return "✨";
}

interface MemoryTimelineProps {
  memories: Memory[];
  isAdmin: boolean;
}

export function MemoryTimeline({ memories, isAdmin }: MemoryTimelineProps) {
  async function handleDelete(id: number) {
    if (!confirm("Bu anıyı silmek istediğinize emin misiniz?")) return;
    const result = await deleteMemoryAction(id);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Anı silindi.");
    }
  }

  if (memories.length === 0) {
    return (
      <div
        className="flex flex-col items-center gap-3 py-16 rounded-[20px]"
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
    );
  }

  return (
    <div className="relative flex flex-col flex-1 justify-between min-h-full py-1 gap-6" style={{ paddingLeft: "8px" }}>
      {/* Vertical glowing line */}
      <div
        className="absolute"
        style={{
          left: 30, // Center of the 44px circle (8px padding + 22px)
          top: 0,
          bottom: 0,
          width: 2,
          background: "linear-gradient(180deg, #FF416C 0%, #F09819 100%)",
          boxShadow: "0 0 8px rgba(255, 65, 108, 0.5)",
          zIndex: 0,
        }}
      />

      {memories.map((memory, index) => {
        const d = dayjs(memory.date);
        const topDate = d.format("D MMMM"); // e.g., "19 Ocak"
        const bottomDate = d.format("YYYY"); // e.g., "2026"

        return (
          <motion.div
            key={memory.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.4 }}
            className="relative flex items-center"
            style={{ gap: "12px" }}
          >
            {/* Horizontal Connection Line */}
            <div 
              className="absolute h-[2px] z-0" 
              style={{
                left: 22, // Center of date circle (44/2)
                top: "50%",
                width: 34, // 22px (half circle) + 12px (gap)
                background: "linear-gradient(90deg, #FF416C 0%, rgba(255, 65, 108, 0.3) 100%)",
                boxShadow: "0 0 8px rgba(255, 65, 108, 0.4)",
              }}
            />

            {/* Glowing Date Circle */}
            <div
              className="relative z-10 flex-shrink-0 flex flex-col items-center justify-center rounded-full text-center"
              style={{
                width: 44,
                height: 44,
                background: "linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)",
                boxShadow: "0 0 12px rgba(255, 65, 108, 0.5)",
                border: "2px solid rgba(255, 255, 255, 0.05)",
              }}
            >
              <span className="text-[9px] font-bold leading-tight text-white">{topDate}</span>
              <span className="text-[9px] font-bold leading-tight text-white">{bottomDate}</span>
            </div>

            {/* Content Card */}
            <div
              className="flex-1 flex flex-col py-4 px-5 justify-center min-h-[88px] rounded-[20px] relative overflow-hidden"
              style={{
                background: "#16161a", // dark grey matching mockup
                border: "1px solid rgba(255, 65, 108, 0.35)",
                boxShadow: "0 0 12px rgba(255, 65, 108, 0.12)",
              }}
            >
              {/* Inner subtle glow for the card */}
              <div 
                className="absolute inset-0 pointer-events-none" 
                style={{
                  background: "radial-gradient(circle at left, rgba(255,65,108,0.15) 0%, transparent 60%)"
                }}
              />

              <div className="flex items-center gap-4">
                {/* Emoji Icon Gradient Circle */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 z-10"
                  style={{
                    background: "linear-gradient(135deg, #FF512F 0%, #F09819 100%)",
                    fontSize: 24,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
                  }}
                >
                  {getMemoryEmoji(memory.title)}
                </div>

                {/* Text Group */}
                <div className="flex flex-col z-10 flex-1">
                  <h3 className="font-bold text-white text-[19px] leading-tight mb-1">
                    {memory.title}
                  </h3>
                  {memory.description && (
                    <p
                      className="text-[15px] leading-snug"
                      style={{ color: "rgba(255,255,255,0.6)" }}
                    >
                      {memory.description.replace(/bebeğim/gi, "aşkım")}
                    </p>
                  )}
                </div>
              </div>

              {/* Image (preserves original functionality if they add one) */}
              {memory.image_url && (
                <div
                  className="relative rounded-xl overflow-hidden mt-4 z-10"
                  style={{ height: 180 }}
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

              {/* Admin delete button */}
              {isAdmin && !memory.is_default && (
                <button
                  onClick={() => handleDelete(memory.id)}
                  className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-lg transition-all z-20"
                  style={{
                    background: "rgba(255,65,108,0.1)",
                    color: "rgba(255,65,108,0.7)",
                  }}
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
