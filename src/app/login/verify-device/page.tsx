"use client";

import { useActionState } from "react";
import { verifyDeviceAction } from "@/actions/auth";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const initialState = {};

export default function VerifyDevicePage() {
  const [state, formAction, isPending] = useActionState(verifyDeviceAction, initialState);

  return (
    <div
      className="min-h-dvh flex items-center justify-center relative overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/couple-bg.jpg')", backgroundColor: "#0a0a0f" }}
    >
      <style dangerouslySetInnerHTML={{__html: `
        .custom-placeholder::placeholder {
          color: rgba(255, 255, 255, 0.7) !important;
          opacity: 1 !important;
        }
      `}} />
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
        <a
          href="/login"
          className="flex items-center gap-2 mb-8 text-sm hover:opacity-70 transition-opacity w-fit"
          style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}
        >
          <ArrowLeft size={18} /> Geri Dön
        </a>

        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 250 }}
            className="mb-5 flex justify-center"
          >
            <ShieldCheck size={48} fill="rgba(232,0,45,0.2)" color="#E8002D" />
          </motion.div>

          <h1 className="text-2xl font-bold mb-3 text-white">
            Yeni Cihaz Tespit Edildi
          </h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>
            Hesabınızın güvenliği için kayıtlı e-posta adresinize gönderdiğimiz 6 haneli doğrulama kodunu giriniz.
          </p>
        </div>

        <form action={formAction} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <input
              id="code"
              name="code"
              type="text"
              placeholder="000000"
              maxLength={6}
              required
              className="w-full text-center tracking-[0.5em] custom-placeholder"
              style={{
                paddingTop: 16,
                paddingBottom: 16,
                background: "rgba(0,0,0,0.25)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 20,
                color: "#ffffff",
                fontSize: 24,
                fontWeight: "bold",
                outline: "none",
                fontFamily: "inherit",
                WebkitAppearance: "none",
                appearance: "none",
                transition: "all 0.2s ease",
              }}
              autoComplete="one-time-code"
            />
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

          <motion.button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 font-bold"
            style={{
              marginTop: "24px",
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
            {isPending ? "Doğrulanıyor..." : "Doğrula ve Giriş Yap"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
