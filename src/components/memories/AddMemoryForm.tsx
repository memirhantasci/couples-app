"use client";

import { useState, useRef } from "react";
import { useActionState } from "react";
import { createMemoryAction } from "@/actions/memories";
import { toast } from "sonner";
import { Plus, Upload, Camera } from "lucide-react";

export function AddMemoryForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [imageUrl, setImageUrl] = useState("");

  const initialState: { error?: string; success?: boolean } = {};
  const [state, formAction, isPending] = useActionState(
    async (prev: { error?: string; success?: boolean }, formData: FormData) => {
      const result = await createMemoryAction(prev, formData);
      if (result.success) {
        toast.success("Anı başarıyla eklendi! 📸");
        formRef.current?.reset();
        setImageUrl("");
      } else if (result.error) {
        toast.error(result.error);
      }
      return result;
    },
    initialState
  );

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Camera size={20} style={{ color: "var(--gs-gold)" }} />
        <h3 className="font-bold text-white text-base">Yeni Anı Ekle</h3>
      </div>

      <form ref={formRef} action={formAction} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
            Tarih
          </label>
          <input
            name="date"
            type="date"
            defaultValue={today}
            required
            className="input-glass text-base py-3"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
            Başlık
          </label>
          <input
            name="title"
            type="text"
            placeholder="ör: İlk kahvemiz ☕"
            required
            className="input-glass text-base py-3"
            maxLength={255}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
            Açıklama (isteğe bağlı)
          </label>
          <textarea
            name="description"
            placeholder="Bu anı hakkında bir şeyler yaz..."
            rows={4}
            className="input-glass resize-none text-base py-3"
            maxLength={1000}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
            Fotoğraf URL (isteğe bağlı)
          </label>
          <div className="relative">
            <Upload size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.3)" }} />
            <input
              name="image_url"
              type="url"
              placeholder="https://..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="input-glass text-base py-3"
              style={{ paddingLeft: 44 }}
            />
          </div>
        </div>

        <button type="submit" disabled={isPending} className="btn-gold w-full mt-2 py-3.5 text-base">
          {isPending ? (
            <div className="w-5 h-5 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin mx-auto" />
          ) : (
            <>
              <Plus size={20} />
              Ekle
            </>
          )}
        </button>
      </form>
    </div>
  );
}
