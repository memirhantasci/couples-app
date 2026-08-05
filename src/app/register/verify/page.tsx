"use client";

import { useActionState, useState, useRef, useEffect } from "react";
import { verifyRegisterAction } from "@/actions/auth";
import { Heart, Copy, Check, ShieldCheck, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

const initialState = {};

export default function VerifyRegisterPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(verifyRegisterAction, initialState);
  const [copied, setCopied] = useState(false);
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();

    // Log OTP for development
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const otp = params.get('devOtp');
      if (otp) {
        console.log("%c--- GELEN DOĞRULAMA KODU ---", "color: #E8002D; font-weight: bold; font-size: 16px;");
        console.log(`%cKOD: ${otp}`, "color: #F5C842; font-weight: bold; font-size: 24px;");
      }
    }
  }, []);

  // Handle successful verification redirect
  useEffect(() => {
    if ((state as any)?.redirectUrl) {
      router.push((state as any).redirectUrl);
    }
  }, [state, router]);

  // Sync digits to hidden input
  useEffect(() => {
    if (hiddenInputRef.current) {
      hiddenInputRef.current.value = digits.join("");
    }
  }, [digits]);

  const handleDigitChange = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);

    // Auto-advance to next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || "";
    }
    setDigits(newDigits);
    // Focus last filled or next empty
    const focusIndex = Math.min(pasted.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleCopy = () => {
    const code = (state as any)?.pairingCodeToDisplay;
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
          padding: "48px 32px",
          background: "rgba(255,255,255,0.12)",
          backdropFilter: "blur(32px)",
          WebkitBackdropFilter: "blur(32px)",
          border: "1px solid rgba(255,255,255,0.2)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
        }}
      >
        <AnimatePresence mode="wait">
          {(state as any)?.success && (state as any)?.pairingCodeToDisplay ? (
            /* ==================== SUCCESS STATE ==================== */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full text-center flex flex-col items-center"
            >
              {/* Heart Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                className="mb-5"
              >
                <Heart size={52} fill="#E8002D" color="#E8002D" />
              </motion.div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-white mb-2">Hesap Onaylandı!</h2>

              {/* Description */}
              <p className="text-sm mb-8 leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
                Uygulamaya tek başına giriş yapamazsın.<br />
                Sevgilinin seninle eşleşebilmesi için bu kodu ona<br />
                gönder:
              </p>

              {/* Pairing Code Box with Copy */}
              <div
                className="w-full"
                style={{
                  marginBottom: 28,
                  padding: "18px 20px",
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
                  {(state as any).pairingCodeToDisplay}
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

              {/* Navigate Button */}
              <Link
                href="/pairing"
                className="w-full font-bold flex items-center justify-center rounded-2xl transition-all"
                style={{
                  marginTop: 8,
                  padding: "16px 24px",
                  background: "linear-gradient(135deg, #E8002D 0%, #C4001F 100%)",
                  color: "#ffffff",
                  fontSize: 16,
                  textDecoration: "none",
                  boxShadow: "0 4px 20px rgba(232,0,45,0.3)",
                }}
              >
                Kodu Kopyaladım, Devam Et
              </Link>
            </motion.div>
          ) : (
            /* ==================== VERIFY STATE ==================== */
            <motion.div
              key="verify"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {/* Back Link */}
              <a
                href="/register"
                className="flex items-center gap-2 mb-8 text-sm hover:opacity-70 transition-opacity w-fit"
                style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}
              >
                <ArrowLeft size={18} /> Geri Dön
              </a>

              {/* Header */}
              <div className="text-center" style={{ marginBottom: 36 }}>
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15, type: "spring", stiffness: 250 }}
                  className="mb-5 flex justify-center"
                >
                  <ShieldCheck size={48} fill="rgba(232,0,45,0.2)" color="#E8002D" />
                </motion.div>

                <h1 className="text-2xl font-bold text-white" style={{ marginBottom: 20 }}>
                  E-Posta Doğrulama
                </h1>
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, lineHeight: 1.6 }}>
                  Kayıt işlemini tamamlamak için e-posta adresinize gönderdiğimiz 6 haneli kodu giriniz.
                </p>
              </div>

              {/* Form */}
              <form action={formAction} className="flex flex-col gap-6">
                {/* Hidden input for the actual form value */}
                <input
                  ref={hiddenInputRef}
                  type="hidden"
                  name="code"
                  value={digits.join("")}
                />

                {/* OTP Digit Inputs */}
                <div className="flex items-center justify-between gap-2" onPaste={handlePaste}>
                  {digits.map((digit, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        ref={(el) => { inputRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleDigitChange(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        className="text-center"
                        style={{
                          width: 44,
                          height: 52,
                          background: "rgba(0,0,0,0.25)",
                          border: "1px solid rgba(255,255,255,0.2)",
                          borderRadius: 12,
                          color: "#ffffff",
                          fontSize: 22,
                          fontWeight: "bold",
                          outline: "none",
                          fontFamily: "inherit",
                          WebkitAppearance: "none",
                          appearance: "none",
                          caretColor: "#E8002D",
                          transition: "border-color 0.2s ease",
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = "rgba(232,0,45,0.6)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "rgba(255,255,255,0.2)";
                        }}
                        autoComplete="off"
                      />
                      {/* Dash between pairs (after index 2) */}
                      {i === 2 && (
                        <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 20, margin: "0 2px" }}>–</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Error */}
                {(state as any)?.error && (
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
                    <span>{(state as any).error}</span>
                  </motion.div>
                )}

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isPending}
                  className="w-full flex items-center justify-center gap-2 font-bold"
                  style={{
                    marginTop: 28,
                    padding: "16px 24px",
                    borderRadius: 20,
                    background: "linear-gradient(135deg, #E8002D 0%, #C4001F 100%)",
                    color: "#ffffff",
                    fontSize: 16,
                    border: "none",
                    cursor: isPending ? "not-allowed" : "pointer",
                    opacity: isPending ? 0.7 : 1,
                    boxShadow: "0 4px 20px rgba(232,0,45,0.3)",
                  }}
                  whileHover={{ scale: isPending ? 1 : 1.01 }}
                  whileTap={{ scale: isPending ? 1 : 0.99 }}
                >
                  {isPending ? (
                    <>
                      <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Doğrulanıyor...
                    </>
                  ) : (
                    "Doğrula ve Devam Et"
                  )}
                </motion.button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
