"use client";

import { useActionState } from "react";
import { registerAction, type LoginState } from "@/actions/auth";
import { Heart, Lock, User, Eye, EyeOff, ArrowLeft, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";

const initialState: LoginState = {};

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerAction, initialState);
  const [showPassword, setShowPassword] = useState(false);

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

      {/* Register Card — glassmorphism with better spacing */}
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
        <motion.div
          key="register"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          {/* Header with plenty of spacing */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 250 }}
              className="mb-5 flex justify-center"
            >
              <Heart size={44} fill="#E8002D" color="#E8002D" />
            </motion.div>

            <h1
              className="font-display font-bold mb-3"
              style={{
                fontSize: 32,
                background: "linear-gradient(135deg, #E8A020 0%, #F5C842 50%, #E8A020 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Kayıt Ol
            </h1>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 15 }}>
              Sisteme katılmak için hesap oluşturun 💕
            </p>
          </div>

          {/* Form elements with more gap */}
          <form action={formAction} className="flex flex-col gap-6" style={{ marginTop: "48px" }}>

            {/* Inputs wrapper */}
            <div className="flex flex-col" style={{ gap: "24px" }}>
              {/* Display Name */}
              <div className="flex flex-col gap-2">
                <div className="relative">
                  <div
                    className="absolute left-4 top-1/2 -translate-y-1/2"
                    style={{ color: "rgba(255,255,255,0.45)" }}
                  >
                    <Heart size={18} />
                  </div>
                  <input
                    id="displayName"
                    name="displayName"
                    type="text"
                    placeholder="İsim (Örn: Ahmet)"
                    required
                    className="w-full custom-placeholder"
                    style={{
                      paddingLeft: 46,
                      paddingRight: 16,
                      paddingTop: 16,
                      paddingBottom: 16,
                      background: "rgba(0,0,0,0.25)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: 20,
                      color: "#ffffff",
                      fontSize: 15,
                      outline: "none",
                      fontFamily: "inherit",
                      WebkitAppearance: "none",
                      appearance: "none",
                      transition: "all 0.2s ease",
                    }}
                  />
                </div>
              </div>

              {/* Username */}
              <div className="flex flex-col gap-2">
                <div className="relative">
                  <div
                    className="absolute left-4 top-1/2 -translate-y-1/2"
                    style={{ color: "rgba(255,255,255,0.45)" }}
                  >
                    <User size={18} />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="İstediğiniz kullanıcı adı"
                    required
                    className="w-full custom-placeholder"
                    style={{
                      paddingLeft: 46,
                      paddingRight: 16,
                      paddingTop: 16,
                      paddingBottom: 16,
                      background: "rgba(0,0,0,0.25)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: 20,
                      color: "#ffffff",
                      fontSize: 15,
                      outline: "none",
                      fontFamily: "inherit",
                      WebkitAppearance: "none",
                      appearance: "none",
                      transition: "all 0.2s ease",
                    }}
                    autoComplete="username"
                    autoCapitalize="none"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-2">
                <div className="relative">
                  <div
                    className="absolute left-4 top-1/2 -translate-y-1/2"
                    style={{ color: "rgba(255,255,255,0.45)" }}
                  >
                    <Mail size={18} />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="E-posta adresiniz"
                    required
                    className="w-full custom-placeholder"
                    style={{
                      paddingLeft: 46,
                      paddingRight: 16,
                      paddingTop: 16,
                      paddingBottom: 16,
                      background: "rgba(0,0,0,0.25)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: 20,
                      color: "#ffffff",
                      fontSize: 15,
                      outline: "none",
                      fontFamily: "inherit",
                      WebkitAppearance: "none",
                      appearance: "none",
                      transition: "all 0.2s ease",
                    }}
                    autoComplete="email"
                    autoCapitalize="none"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-2">
                <div className="relative">
                  <div
                    className="absolute left-4 top-1/2 -translate-y-1/2"
                    style={{ color: "rgba(255,255,255,0.45)" }}
                  >
                    <Lock size={18} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    className="w-full custom-placeholder"
                    style={{
                      paddingLeft: 46,
                      paddingRight: 50,
                      paddingTop: 16,
                      paddingBottom: 16,
                      background: "rgba(0,0,0,0.25)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: 20,
                      color: "#ffffff",
                      fontSize: 15,
                      outline: "none",
                      fontFamily: "inherit",
                      WebkitAppearance: "none",
                      appearance: "none",
                      transition: "all 0.2s ease",
                    }}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 transition-all"
                    style={{ color: "rgba(255,255,255,0.5)", background: "none", border: "none", cursor: "pointer" }}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Gender */}
              <div className="flex flex-col gap-2 mt-1">
                <p className="text-xs text-white/50 px-2 font-medium">CİNSİYET</p>
                <div className="flex gap-3">
                  <label className="flex-1 relative">
                    <input type="radio" name="gender" value="female" className="peer sr-only" required />
                    <div className="w-full text-center py-3 rounded-xl border border-white/10 bg-black/25 text-white/70 peer-checked:bg-[rgba(232,0,45,0.2)] peer-checked:border-[#E8002D] peer-checked:text-[#E8002D] font-medium transition-all cursor-pointer">
                      Kadın
                    </div>
                  </label>
                  <label className="flex-1 relative">
                    <input type="radio" name="gender" value="male" className="peer sr-only" required />
                    <div className="w-full text-center py-3 rounded-xl border border-white/10 bg-black/25 text-white/70 peer-checked:bg-[rgba(232,0,45,0.2)] peer-checked:border-[#E8002D] peer-checked:text-[#E8002D] font-medium transition-all cursor-pointer">
                      Erkek
                    </div>
                  </label>
                </div>
              </div>

              {/* Pairing Code (Optional) */}
              <div className="flex flex-col gap-2 mt-2">
                <p className="text-xs text-white/50 px-2 font-medium">SEVGİLİNİZİN KODU VARSA (İsteğe Bağlı)</p>
                <div className="relative">
                  <div
                    className="absolute left-4 top-1/2 -translate-y-1/2"
                    style={{ color: "rgba(255,255,255,0.45)" }}
                  >
                    <Lock size={18} />
                  </div>
                  <input
                    id="pairingCode"
                    name="pairingCode"
                    type="text"
                    placeholder="6 Haneli Eşleşme Kodu (Örn: A8F4T1)"
                    maxLength={6}
                    className="w-full custom-placeholder uppercase"
                    style={{
                      paddingLeft: 46,
                      paddingRight: 16,
                      paddingTop: 16,
                      paddingBottom: 16,
                      background: "rgba(0,0,0,0.25)",
                      border: "1px dashed rgba(255,255,255,0.25)",
                      borderRadius: 20,
                      color: "#F5C842",
                      fontSize: 15,
                      letterSpacing: "2px",
                      outline: "none",
                      fontFamily: "inherit",
                      WebkitAppearance: "none",
                      appearance: "none",
                      transition: "all 0.2s ease",
                    }}
                  />
                </div>
              </div>
            </div>

            {state?.error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl text-sm"
                style={{
                  background: "rgba(232, 0, 45, 0.15)",
                  border: "1px solid rgba(232, 0, 45, 0.3)",
                  color: "#FF6B6B",
                }}
              >
                <span>⚠️</span>
                <span>{state.error}</span>
              </motion.div>
            )}

            <div className="flex flex-col" style={{ gap: "12px", marginTop: "16px" }}>
              {/* Kayıt Ol */}
              <motion.button
                type="submit"
                disabled={isPending}
                className="w-full flex items-center justify-center gap-2 font-bold"
                style={{
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
                    Kayıt Yapılıyor...
                  </>
                ) : (
                  <>
                    <User size={18} fill="white" color="white" />
                    Kayıt Ol
                  </>
                )}
              </motion.button>

              {/* Giriş Yap - Düz, şeffafımsı gri */}
              <Link
                href="/login"
                className="w-full flex items-center justify-center font-bold transition-all"
                style={{
                  padding: "16px 24px",
                  borderRadius: 20,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#ffffff",
                  fontSize: 16,
                  textDecoration: "none",
                }}
              >
                Zaten hesabın var mı? Giriş Yap
              </Link>
            </div>
          </form>
          
          {/* SUCCESS MODAL FOR PAIRING CODE */}
          {state?.success && state?.pairingCodeToDisplay && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-50 flex items-center justify-center p-6"
              style={{
                background: "rgba(10, 10, 15, 0.95)",
                backdropFilter: "blur(10px)"
              }}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="w-full text-center flex flex-col items-center"
              >
                <Heart size={64} fill="#E8002D" color="#E8002D" className="mb-6 animate-pulse" />
                <h2 className="text-2xl font-bold text-white mb-2">Kayıt Başarılı!</h2>
                <p className="text-white/70 mb-6 text-sm">
                  Uygulamaya tek başına giriş yapamazsın. Sevgilinin seninle eşleşebilmesi için bu kodu ona gönder:
                </p>
                <div 
                  className="w-full text-center text-4xl font-mono font-bold tracking-widest py-6 rounded-2xl mb-8"
                  style={{
                    background: "rgba(245, 200, 66, 0.1)",
                    border: "2px dashed rgba(245, 200, 66, 0.5)",
                    color: "#F5C842"
                  }}
                >
                  {state.pairingCodeToDisplay}
                </div>
                <Link
                  href="/login"
                  className="w-full font-bold flex items-center justify-center py-4 rounded-2xl transition-all"
                  style={{
                    background: "#ffffff",
                    color: "#000000",
                    textDecoration: "none"
                  }}
                >
                  Kodu Kopyaladım, Giriş Yap
                </Link>
              </motion.div>
            </motion.div>
          )}

        </motion.div>
      </motion.div>
    </div>
  );
}
