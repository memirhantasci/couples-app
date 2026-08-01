"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="flex items-center justify-center rounded-[12px] transition-all active:scale-95"
      style={{
        width: 40,
        height: 40,
        background: "var(--surface-3)",
        border: "1px solid var(--border-subtle)",
        color: "var(--text-secondary)",
        flexShrink: 0,
      }}
      aria-label="Geri Dön"
    >
      <ArrowLeft size={20} strokeWidth={2} />
    </button>
  );
}
