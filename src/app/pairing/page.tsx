"use client";

import { useActionState, useState, useEffect, useCallback } from "react";
import { getPairingStatus, submitPairingCodeAction } from "@/actions/auth";
import { Heart, Copy, Check, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

const initialState = {};

export default function PairingPage() {
  const router = useRouter();
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [isPaired, setIsPaired] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const [submitState, submitAction, isSubmitting] = useActionState(
    submitPairingCodeAction,
    initialState
  );

  // Poll pairing status every 4 seconds
  const checkStatus = useCallback(async () => {
    try {
      const status = await getPairingStatus();
      setPairingCode(status.pairingCode);
      if (status.isPaired) {
        setIsPaired(true);
        router.push("/home");
      }
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 4000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  const handleCopy = () => {
    if (pairingCode) {
      navigator.clipboard.writeText(pairingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-dvh flex items-center justify-center"
        style={{ backgroundColor: "#0a0a0f" }}
      >
        <Loader2 size={32} color="#E8002D" className="animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="min-h-dvh flex items-center justify-center relative overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/couple-bg.jpg')", backgroundColor: "#0a0a0f" }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{ background: "rgba(0,0,0,0.55)" }} />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative w-full mx-6 overflow-hidden"
        style={{
          maxWidth: 420,
          borderRadius: 32,
          padding: "40px 28px",
          background: "rgba(255,255,255,0.12)",
          backdropFilter: "blur(32px)",
          WebkitBackdropFilter: "blur(32px)",
          border: "1px solid rgba(255,255,255,0.2)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
        }}
      >
        <div className="w-full text-center flex flex-col items-center">
          {/* Heart Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
            style={{ marginBottom: 20 }}
          >
            <Heart size={48} fill="#E8002D" color="#E8002D" />
          </motion.div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-white" style={{ marginBottom: 18 }}>Eşleşme Bekleniyor</h1>

          {/* Description */}
          <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.7)", marginBottom: 28 }}>
            Sevgilinin seninle eşleşebilmesi için<br />
            bu kodu ona gönder:
          </p>

          {/* Pairing Code Box with Copy */}
          <div
            className="w-full"
            style={{
              marginBottom: 28,
              padding: "16px 20px",
              border: "2px dashed rgba(245, 200, 66, 0.5)",
              borderRadius: 16,
              background: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
            }}
          >
            <span
              style={{
                color: "#F5C842",
                fontSize: 28,
                fontWeight: 700,
                letterSpacing: "0.15em",
              }}
            >
              {pairingCode ?? "..."}
            </span>

            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopy}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
              aria-label="Kodu kopyala"
            >
              <AnimatePresence mode="wait">
                {copied ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Check size={22} color="#F5C842" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="copy"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Copy size={22} color="rgba(255,255,255,0.6)" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>

          {/* Pulsing waiting indicator */}
          <div className="flex items-center gap-2" style={{ color: "rgba(255,255,255,0.5)", marginBottom: 24 }}>
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs">Sevgilinin eşleşmesini bekliyorsun...</span>
          </div>

          {/* ─── DIVIDER ─── */}
          <div className="w-full flex items-center gap-3" style={{ marginBottom: 24 }}>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.15)" }} />
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>veya</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.15)" }} />
          </div>

          {/* ─── ENTER PARTNER CODE ─── */}
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.7)", marginBottom: 16 }}>
            Sevgilinin kodu sende mi? Buraya gir:
          </p>

          <form action={submitAction} className="w-full flex flex-col gap-4">
            <input
              name="pairingCode"
              type="text"
              placeholder="Örn: A8F4T1"
              maxLength={6}
              required
              className="w-full text-center uppercase"
              style={{
                paddingTop: 14,
                paddingBottom: 14,
                background: "rgba(0,0,0,0.25)",
                border: "1px dashed rgba(245, 200, 66, 0.4)",
                borderRadius: 16,
                color: "#F5C842",
                fontSize: 20,
                fontWeight: "bold",
                letterSpacing: "0.2em",
                outline: "none",
                fontFamily: "inherit",
                WebkitAppearance: "none",
                appearance: "none",
                transition: "all 0.2s ease",
              }}
              autoComplete="off"
            />

            {/* Error */}
            {(submitState as any)?.error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm"
                style={{
                  background: "rgba(232, 0, 45, 0.15)",
                  border: "1px solid rgba(232, 0, 45, 0.3)",
                  color: "#FF6B6B",
                }}
              >
                <span>⚠️</span>
                <span>{(submitState as any).error}</span>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 font-bold"
              style={{
                marginTop: 8,
                padding: "14px 24px",
                borderRadius: 20,
                background: "linear-gradient(135deg, #E8002D 0%, #C4001F 100%)",
                color: "#ffffff",
                fontSize: 15,
                border: "none",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                opacity: isSubmitting ? 0.7 : 1,
                boxShadow: "0 4px 20px rgba(232,0,45,0.3)",
              }}
              whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.99 }}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Kontrol Ediliyor...
                </>
              ) : (
                "Eşleşmeyi Tamamla"
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
