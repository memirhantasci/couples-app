"use client";

import { useActionState, useEffect, useState } from "react";
import { updateCoupleDatesAction } from "@/actions/setup";
import { motion } from "framer-motion";
import { CalendarHeart, HeartHandshake, Loader2, CalendarDays } from "lucide-react";
import { useRouter } from "next/navigation";

const initialState = {};

export default function SetupPage() {
  const [state, formAction, isPending] = useActionState(updateCoupleDatesAction, initialState);
  const router = useRouter();

  const [meetDateVal, setMeetDateVal] = useState("");
  const [relDateVal, setRelDateVal] = useState("");
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if ((state as any)?.redirectUrl) {
      router.push((state as any).redirectUrl);
    }
  }, [state, router]);

  return (
    <div className="min-h-dvh w-full flex items-center justify-center p-6 relative overflow-hidden" style={{ background: "#080811" }}>
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#E8002D] rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-blob" />
        <div className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] bg-[#F5C842] rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-blob animation-delay-2000" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative w-full max-w-md overflow-hidden"
        style={{
          borderRadius: 32,
          padding: "48px 32px",
          background: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(32px)",
          WebkitBackdropFilter: "blur(32px)",
          border: "1px solid rgba(255,255,255,0.15)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
        }}
      >
        <div className="text-center" style={{ marginBottom: 36 }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
            className="flex justify-center mb-6"
          >
            <div className="relative">
              <CalendarHeart size={56} fill="rgba(232,0,45,0.2)" color="#E8002D" />
            </div>
          </motion.div>
          <h1 className="text-2xl font-bold text-white mb-2">Tarihleri Belirleyin</h1>
          <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
            Birlikte geçirdiğiniz o güzel günlerin sayısını tutabilmemiz için tarihlere ihtiyacımız var.
          </p>
        </div>

        <form action={formAction} className="flex flex-col">
          {/* Tanışma Tarihi */}
          <div className="flex flex-col" style={{ marginBottom: 28 }}>
            <label className="text-sm font-normal pl-1" style={{ color: "rgba(255,255,255,0.85)", marginBottom: 6 }}>
              Tanışma Tarihi
            </label>
            <div className="relative">
              <input
                name="meetDate"
                type="date"
                required
                max={relDateVal || today}
                value={meetDateVal}
                onChange={(e) => setMeetDateVal(e.target.value)}
                className="w-full"
                style={{
                  paddingLeft: 16,
                  paddingRight: 16,
                  paddingTop: 14,
                  paddingBottom: 14,
                  background: "rgba(0,0,0,0.3)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 16,
                  color: "#ffffff",
                  fontSize: 15,
                  outline: "none",
                  fontFamily: "inherit",
                }}
              />
            </div>
          </div>

          {/* Sevgili Olma Tarihi */}
          <div className="flex flex-col" style={{ marginBottom: 40 }}>
            <label className="text-sm font-normal pl-1" style={{ color: "rgba(255,255,255,0.85)", marginBottom: 6 }}>
              Sevgili Olma Tarihi
            </label>
            <div className="relative">
              <input
                name="relationshipStartDate"
                type="date"
                required
                max={today}
                min={meetDateVal}
                value={relDateVal}
                onChange={(e) => setRelDateVal(e.target.value)}
                className="w-full"
                style={{
                  paddingLeft: 16,
                  paddingRight: 16,
                  paddingTop: 14,
                  paddingBottom: 14,
                  background: "rgba(0,0,0,0.3)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 16,
                  color: "#ffffff",
                  fontSize: 15,
                  outline: "none",
                  fontFamily: "inherit",
                }}
              />
            </div>
          </div>

          {/* Error Message */}
          {(state as any)?.error && (
            <div className="p-4 mb-4 rounded-[16px] text-sm text-center font-medium" style={{ background: "rgba(232,0,45,0.15)", color: "#FF4D6A", border: "1px solid rgba(232,0,45,0.3)" }}>
              {(state as any).error}
            </div>
          )}

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isPending}
            whileTap={{ scale: 0.97 }}
            className="w-full flex items-center justify-center gap-2 font-bold"
            style={{
              padding: "18px 24px",
              background: "linear-gradient(135deg, #E8002D 0%, #B5001F 100%)",
              color: "#ffffff",
              borderRadius: 20,
              fontSize: 16,
              boxShadow: "0 4px 24px rgba(232, 0, 45, 0.5)",
            }}
          >
            {isPending ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              "Kaydet ve Başla ✨"
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
