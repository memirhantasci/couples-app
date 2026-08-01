"use client";

import { useActionState } from "react";
import { loginAction, changePasswordAction, type LoginState } from "@/actions/auth";
import { Heart, Lock, User, Eye, EyeOff, ArrowLeft, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

const initialState: LoginState = {};

function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  const [forgotState, forgotAction, isForgotPending] = useActionState(changePasswordAction, initialState);

  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("expired") === "true") {
      toast.error("Oturum süreniz doldu, lütfen tekrar giriş yapın.");
      const url = new URL(window.location.href);
      url.searchParams.delete("expired");
      window.history.replaceState({}, "", url);
    }
  }, [searchParams]);

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

      {/* Login Card — glassmorphism with better spacing */}
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
          {!isForgotPassword ? (
            <motion.div
              key="login"
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
                  Emirhan &amp; Öykü
                </h1>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 15 }}>
                  Özel platformunuza hoş geldiniz
                </p>
              </div>

              {/* Form elements with more gap */}
              <form action={formAction} className="flex flex-col gap-6" style={{ marginTop: "48px" }}>

                {/* Inputs wrapper */}
                <div className="flex flex-col" style={{ gap: "24px" }}>
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
                        placeholder="Kullanıcı adınızı girin"
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
                        autoComplete="current-password"
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
                </div>

                {/* Error */}
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
                  {/* Giriş Yap */}
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
                        Giriş yapılıyor...
                      </>
                    ) : (
                      <>
                        <Heart size={18} fill="white" color="white" />
                        Giriş Yap
                      </>
                    )}
                  </motion.button>

                  {/* Kayıt Ol - Düz, şeffafımsı gri */}
                  <Link
                    href="/register"
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
                    Hesabın yok mu? Kayıt Ol
                  </Link>
                </div>

                {/* Şifremi Unuttum */}
                <div className="text-center mt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                    className="text-[13px] font-semibold transition-opacity hover:opacity-70"
                    style={{ color: "rgba(255,255,255,0.5)", background: "none", border: "none", cursor: "pointer" }}
                  >
                    Şifremi Unuttum
                  </button>
                </div>
              </form>
            </motion.div>
          ) : forgotState?.success ? (
            /* Success */
            <motion.div
              key="forgot-success"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
              className="text-center py-6"
            >
              <div
                className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
                style={{ background: "rgba(34,197,94,0.15)", border: "2px solid rgba(34,197,94,0.3)" }}
              >
                <Heart size={44} fill="#22c55e" color="#22c55e" />
              </div>
              <h2 className="text-2xl font-bold mb-3" style={{ color: "white" }}>Şifre Değiştirildi</h2>
              <p className="mb-10 text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
                Yeni şifreniz başarıyla kaydedildi.
              </p>
              <button
                onClick={() => setIsForgotPassword(false)}
                className="w-full py-4 rounded-[20px] font-bold text-white transition-all"
                style={{
                  background: "linear-gradient(135deg, #E8002D 0%, #C4001F 100%)",
                }}
              >
                Giriş Ekranına Dön
              </button>
            </motion.div>
          ) : (
            /* Forgot Password Form */
            <motion.div
              key="forgot-form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
            >
              <button
                onClick={() => setIsForgotPassword(false)}
                className="flex items-center gap-2 mb-8 text-sm hover:opacity-70 transition-opacity"
                style={{ color: "rgba(255,255,255,0.6)", background: "none", border: "none", cursor: "pointer" }}
              >
                <ArrowLeft size={18} /> Geri Dön
              </button>

              <div className="mb-16 text-center">
                <h2 className="text-3xl font-bold mb-3 text-white">Şifremi Unuttum</h2>
                <p className="text-[15px] leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
                  Kullanıcı adınızı ve kayıtlı e-posta adresinizi girerek sıfırlama kodu isteyebilirsiniz.
                </p>
              </div>

              <form action={forgotAction} className="flex flex-col gap-6" style={{ marginTop: "48px" }}>
                <div className="flex flex-col" style={{ gap: "24px" }}>
                  <div className="flex flex-col gap-2">
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.45)" }}>
                        <User size={18} />
                      </div>
                      <input
                        id="forgot-username"
                        name="username"
                        type="text"
                        placeholder="Kullanıcı adınız"
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
                        }}
                        autoComplete="username"
                        autoCapitalize="none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.45)" }}>
                        <Mail size={18} />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Kayıtlı e-posta adresiniz"
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
                        }}
                      />
                    </div>
                  </div>
                </div>

                {forgotState?.error && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 px-4 py-3 rounded-2xl text-sm"
                    style={{
                      background: "rgba(232,0,45,0.15)",
                      border: "1px solid rgba(232,0,45,0.3)",
                      color: "#FF6B6B",
                    }}
                  >
                    <span>⚠️</span>
                    <span>{forgotState.error}</span>
                  </motion.div>
                )}

                <div className="flex flex-col" style={{ marginTop: "16px" }}>
                  <motion.button
                    type="submit"
                    disabled={isForgotPending}
                    className="w-full flex items-center justify-center gap-2 font-bold"
                  style={{
                    padding: "16px 24px",
                    borderRadius: 20,
                    background: "linear-gradient(135deg, #E8002D 0%, #C4001F 100%)",
                    color: "#ffffff",
                    fontSize: 16,
                    border: "none",
                    cursor: isForgotPending ? "not-allowed" : "pointer",
                    opacity: isForgotPending ? 0.7 : 1,
                    boxShadow: "0 4px 20px rgba(232,0,45,0.3)",
                  }}
                  whileHover={{ scale: isForgotPending ? 1 : 1.01 }}
                  whileTap={{ scale: isForgotPending ? 1 : 0.99 }}
                >
                  {isForgotPending ? "Gönderiliyor..." : "Sıfırlama Kodu Gönder"}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh flex items-center justify-center" style={{ backgroundColor: "#0a0a0f" }}>Yükleniyor...</div>}>
      <LoginForm />
    </Suspense>
  );
}
