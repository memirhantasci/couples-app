"use client";

import { useActionState, useRef } from "react";
import { createLetterAction } from "@/actions/letters";
import { toast } from "sonner";
import { LockKeyhole, FileEdit } from "lucide-react";

interface UserOption {
  id: number;
  username: string;
  display_name?: string;
}

export function WriteLetterForm({ users }: { users: UserOption[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const initialState: { error?: string; success?: boolean } = {};

  const [state, formAction, isPending] = useActionState(
    async (prev: { error?: string; success?: boolean }, formData: FormData) => {
      const result = await createLetterAction(prev, formData);
      if (result.success) {
        toast.success("Mektup başarıyla mühürlendi! 💌");
        formRef.current?.reset();
      } else if (result.error) {
        toast.error(result.error);
      }
      return result;
    },
    initialState
  );

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div
      style={{
        background: "#141418",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 16,
        padding: "20px 18px",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5" style={{ marginBottom: 20 }}>
        <div
          className="flex items-center justify-center"
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background: "rgba(200,146,42,0.12)",
            color: "#c8922a",
          }}
        >
          <FileEdit size={16} />
        </div>
        <h3
          className="font-bold"
          style={{ fontSize: 16, color: "#c8922a" }}
        >
          Yeni Mektup Yaz
        </h3>
      </div>

      <form ref={formRef} action={formAction} className="flex flex-col" style={{ gap: 16 }}>
        {/* Kime */}
        <div>
          <label
            className="block font-semibold uppercase"
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.35)",
              letterSpacing: "0.8px",
              marginBottom: 8,
            }}
          >
            Kime
          </label>
          <select
            name="receiver_id"
            required
            defaultValue=""
            style={{
              width: "100%",
              padding: "13px 16px",
              background: "#1a1a1e",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12,
              color: "#f4f4f5",
              fontSize: 14,
              outline: "none",
              appearance: "none",
              WebkitAppearance: "none",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.35)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 14px center",
              paddingRight: 42,
              cursor: "pointer",
            }}
          >
            <option value="" disabled style={{ background: "#1a1a1e" }}>Alıcı seç...</option>
            {users.map(u => (
              <option key={u.id} value={u.id} style={{ background: "#1a1a1e", color: "#f4f4f5" }}>
                {u.display_name || (u.username.charAt(0).toUpperCase() + u.username.slice(1))}
              </option>
            ))}
          </select>
        </div>

        {/* Açılış Tarihi */}
        <div>
          <label
            className="block font-semibold uppercase flex items-center gap-1"
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.35)",
              letterSpacing: "0.8px",
              marginBottom: 8,
            }}
          >
            Açılış Tarihi (Kilit) <LockKeyhole size={10} />
          </label>
          <input
            name="unlock_date"
            type="date"
            min={todayStr}
            required
            style={{
              width: "100%",
              padding: "13px 16px",
              background: "#1a1a1e",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12,
              color: "#f4f4f5",
              fontSize: 14,
              outline: "none",
              WebkitAppearance: "none",
              appearance: "none",
            }}
          />
        </div>

        {/* Başlık */}
        <div>
          <label
            className="block font-semibold uppercase"
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.35)",
              letterSpacing: "0.8px",
              marginBottom: 8,
            }}
          >
            Mektup Başlığı
          </label>
          <input
            name="title"
            type="text"
            placeholder="Gelecekteki Bize..."
            required
            maxLength={255}
            style={{
              width: "100%",
              padding: "13px 16px",
              background: "#1a1a1e",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12,
              color: "#f4f4f5",
              fontSize: 14,
              outline: "none",
            }}
          />
        </div>

        {/* İçerik */}
        <div>
          <label
            className="block font-semibold uppercase"
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.35)",
              letterSpacing: "0.8px",
              marginBottom: 8,
            }}
          >
            Mektup İçeriği
          </label>
          <textarea
            name="content"
            placeholder="Yüreğinden geçenleri dök..."
            required
            rows={5}
            style={{
              width: "100%",
              padding: "13px 16px",
              background: "#1a1a1e",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12,
              color: "#f4f4f5",
              fontSize: 14,
              outline: "none",
              resize: "none",
              lineHeight: 1.6,
            }}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 font-bold"
          style={{
            marginTop: 4,
            padding: "14px",
            borderRadius: 14,
            background: "linear-gradient(135deg, #c8922a 0%, #a67820 100%)",
            color: "#111114",
            fontSize: 14,
            border: "none",
            cursor: isPending ? "not-allowed" : "pointer",
            opacity: isPending ? 0.6 : 1,
            letterSpacing: "0.3px",
          }}
        >
          {isPending ? (
            <div
              className="w-5 h-5 border-2 rounded-full animate-spin mx-auto"
              style={{ borderColor: "rgba(0,0,0,0.2)", borderTopColor: "#111" }}
            />
          ) : (
            <>
              <span>📮</span> MEKTUBU MÜHÜRLE
            </>
          )}
        </button>
      </form>
    </div>
  );
}
