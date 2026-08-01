"use client";

import { motion } from "framer-motion";

interface LoveMeterProps {
  value: number; // 80-100
}

export function LoveMeter({ value }: LoveMeterProps) {
  return (
    <div style={{
      background: "#181a20",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "20px",
      padding: "20px",
    }}>
      <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#fff", margin: "0 0 14px 0" }}>
        Aşk Ölçer
      </h2>

      <div style={{
        height: 32,
        borderRadius: "20px",
        overflow: "hidden",
        background: "rgba(255,255,255,0.05)",
      }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
          style={{
            height: "100%",
            borderRadius: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            paddingRight: "14px",
            background: "linear-gradient(90deg, #E8002D 0%, #D8A030 100%)",
          }}
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            style={{ fontSize: "13px", fontWeight: 500, color: "rgba(255,255,255,0.9)" }}
          >
            {value}%
          </motion.span>
        </motion.div>
      </div>

      <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", marginTop: "10px" }}>
        Bugün için ölçüldü 🤝
      </p>
    </div>
  );
}
