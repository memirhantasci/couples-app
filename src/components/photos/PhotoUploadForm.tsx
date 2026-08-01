"use client";

import { useState, useRef, useCallback, useActionState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Camera, Calendar, Clock, AlignLeft, Type, Info, AlertCircle, CheckCircle, X, Image as ImageIcon, ArrowUp } from "lucide-react";
import { uploadPhotoAction, type PhotoActionState } from "@/actions/photos";
import { toast } from "sonner";

const initialState: PhotoActionState = {};

export function PhotoUploadForm() {
  const [state, formAction, isPending] = useActionState(uploadPhotoAction, initialState);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [exifStatus, setExifStatus] = useState<"idle" | "loading" | "found" | "not_found">("idle");
  const [takenDate, setTakenDate] = useState("");
  const [takenTime, setTakenTime] = useState("");
  const [exifFound, setExifFound] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1 * 1024 * 1024) {
      toast.error("Dosya boyutu çok büyük! Lütfen 1 MB'dan küçük bir fotoğraf seçin.");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    setFileName(file.name);
    setPreview(URL.createObjectURL(file));
    setExifStatus("loading");
    setTakenDate("");
    setTakenTime("");
    setExifFound(false);

    try {
      const exifr = (await import("exifr")).default;
      const exif = await exifr.parse(file);

      const dateValue = exif?.DateTimeOriginal || exif?.DateTime || exif?.CreateDate || exif?.ModifyDate;

      if (dateValue) {
        const d = new Date(dateValue);
        if (!isNaN(d.getTime())) {
          const localDate = d.toLocaleDateString("en-CA");
          const localTime = d.toTimeString().slice(0, 5);
          setTakenDate(localDate);
          setTakenTime(localTime);
          setExifFound(true);
          setExifStatus("found");
          return;
        }
      }
    } catch {
      // Fallback
    }

    if (file.lastModified) {
      const d = new Date(file.lastModified);
      if (!isNaN(d.getTime())) {
        setTakenDate(d.toLocaleDateString("en-CA"));
        setTakenTime(d.toTimeString().slice(0, 5));
        setExifFound(false);
        setExifStatus("not_found");
        return;
      }
    }

    setExifStatus("not_found");
  }, []);

  return (
    <form action={formAction} className="flex flex-col gap-[22px]">
      <input type="hidden" name="exif_found" value={String(exifFound)} />
      <input type="hidden" name="taken_date" value={takenDate} />
      <input type="hidden" name="taken_time" value={takenTime} />

      {/* File picker */}
      <div style={{ margin: "0 8px" }}>
        <p className="text-[15px] text-[#A1A1AA] leading-snug mb-3">
          Bu anıyı arşive ekle 📸
        </p>
        <input
          ref={fileRef}
          type="file"
          name="photo"
          accept="image/*"
          onChange={handleFileChange}
          className="sr-only"
          required
        />
        <motion.button
          type="button"
          onClick={() => fileRef.current?.click()}
          whileHover={{ scale: 1.005 }}
          whileTap={{ scale: 0.995 }}
          className="w-full flex flex-col items-center justify-center transition-all"
          style={{
            border: preview ? "2px solid rgba(232,0,45,0.4)" : "2px dashed #D32F2F",
            background: preview ? "rgba(232,0,45,0.04)" : "transparent",
            minHeight: 185,
            padding: "24px",
            cursor: "pointer",
            overflow: "hidden",
            position: "relative",
            borderRadius: 8,
          }}
        >
          <AnimatePresence mode="wait">
            {preview ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative w-full"
              >
                <img
                  src={preview}
                  alt="Önizleme"
                  className="w-full rounded-md object-cover"
                  style={{ maxHeight: 320 }}
                />
                <div
                  className="absolute top-2 right-2 px-3 py-1.5 rounded-md text-xs font-semibold bg-black/70 text-white/90"
                >
                  Değiştir
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-[10px] w-full"
              >
                <div
                  className="flex items-center justify-center mb-0.5"
                  style={{
                    width: 72,
                    height: 52,
                    borderRadius: 6,
                    background: "#D32F2F",
                  }}
                >
                  <ImageIcon size={30} color="#ffffff" strokeWidth={2.5} />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-white text-[17px] leading-tight mb-1">Fotoğraf Seç</p>
                  <p className="text-[#A1A1AA] text-[14px]">
                    Galerinizden bir fotoğraf seçin
                  </p>
                </div>
                <div
                  className="flex items-center justify-center gap-1.5 rounded-[6px] font-medium text-[13px] mt-1"
                  style={{
                    background: "#D32F2F",
                    color: "#ffffff",
                    whiteSpace: "nowrap",
                    padding: "8px 64px"
                  }}
                >
                  <ArrowUp size={15} strokeWidth={2.5} />
                  Galeriyi Aç
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* EXIF status */}
      <AnimatePresence>
        {exifStatus === "loading" && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin flex-shrink-0" />
            <span className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
              EXIF bilgileri okunuyor...
            </span>
          </motion.div>
        )}

        {exifStatus === "found" && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}
          >
            <CheckCircle size={16} style={{ color: "#22c55e", flexShrink: 0 }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: "#22c55e" }}>
                Çekim bilgileri bulundu
              </p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(34,197,94,0.7)" }}>
                {takenDate} {takenTime && `saat ${takenTime}`} — İsterseniz düzenleyebilirsiniz.
              </p>
            </div>
          </motion.div>
        )}

        {exifStatus === "not_found" && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-3 px-4 py-3 rounded-xl"
            style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}
          >
            <AlertCircle size={16} style={{ color: "#f59e0b", flexShrink: 0, marginTop: 2 }} />
            <p className="text-sm" style={{ color: "#f59e0b" }}>
              Fotoğrafın kesin çekim tarihi bulunamadı ancak dosya tarihinden tahmin edildi. Lütfen doğruluğunu kontrol edin.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Date + Time */}
      <AnimatePresence>
        {(exifStatus === "found" || exifStatus === "not_found") && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col gap-4 overflow-hidden"
          >
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                <Calendar size={12} />
                Çekim Tarihi {exifStatus === "not_found" ? "*" : "(düzenleyebilirsiniz)"}
              </label>
              <input
                type="date"
                value={takenDate}
                onChange={(e) => setTakenDate(e.target.value)}
                required
                className="input-glass text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                <Clock size={12} />
                Çekim Saati (isteğe bağlı)
              </label>
              <input
                type="time"
                value={takenTime}
                onChange={(e) => setTakenTime(e.target.value)}
                className="input-glass text-sm"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Title */}
      <div className="flex flex-col gap-[6px]" style={{ margin: "0 8px" }}>
        <label className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.65)" }}>
          Başlık (isteğe bağlı)
        </label>
        <input
          name="title"
          type="text"
          placeholder="Fotoğrafınıza bir başlık verin..."
          className="input-glass"
          style={{ borderColor: "#D32F2F", borderWidth: "1.5px" }}
        />
      </div>

      {/* Description */}
      <div className="flex flex-col gap-[6px]" style={{ margin: "0 8px" }}>
        <label className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.65)" }}>
          Açıklama *
        </label>
        <textarea
          name="description"
          rows={4}
          required
          placeholder="Bu anı anlatın... Neredeydiniz, ne hissettiniz?"
          className="input-glass resize-none"
          style={{ lineHeight: 1.7, borderColor: "#D32F2F", borderWidth: "1.5px" }}
        />
      </div>

      {/* Info */}
      <p className="text-[13.5px] text-[#A1A1AA] leading-snug">
        Yüklenen fotoğraflar kalıcı olarak saklanır ve silinemez. Her iki kullanıcı da tüm fotoğrafları görebilir.
      </p>

      {/* Error */}
      {state?.error && (
        <div
          className="px-4 py-3 rounded-lg text-[14px] flex items-center gap-2"
          style={{
            background: "rgba(211,47,47,0.1)",
            border: "1px solid rgba(211,47,47,0.25)",
            color: "#EF5350",
          }}
        >
          <X size={16} />
          {state.error}
        </div>
      )}

      {/* Submit */}
      <div style={{ margin: "0 8px" }}>
        <motion.button
          type="submit"
          disabled={isPending || !preview || !takenDate}
          whileHover={{ scale: (isPending || !preview || !takenDate) ? 1 : 1.01 }}
          whileTap={{ scale: (isPending || !preview || !takenDate) ? 1 : 0.99 }}
          className="w-full py-3.5 rounded-xl font-semibold text-[16px] flex items-center justify-center gap-2 transition-all mt-1"
          style={{
            background: "#D32F2F",
            color: "white",
            opacity: 1,
            cursor: isPending || !preview || !takenDate ? "not-allowed" : "pointer",
          }}
        >
          {isPending ? (
            <>
              <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Yükleniyor...
            </>
          ) : (
            <>
              <Camera size={20} strokeWidth={2.5} />
              Fotoğrafı Kaydet
            </>
          )}
        </motion.button>
      </div>
    </form>
  );
}
