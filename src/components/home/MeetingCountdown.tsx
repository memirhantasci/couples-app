"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getCountdown, dayjs } from "@/lib/date";
import { MapPin } from "lucide-react";

interface CountdownProps {
  targetDate: string;
  title: string;
}

export function MeetingCountdown({ targetDate, title }: CountdownProps) {
  const [countdown, setCountdown] = useState(getCountdown(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getCountdown(targetDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (countdown.isPast) {
    return (
      <div style={{
        background: "#181a20",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "20px",
        padding: "20px",
        textAlign: "center",
      }}>
        <div style={{ fontSize: "28px", marginBottom: "8px" }}>🎉</div>
        <p style={{ fontSize: "15px", fontWeight: 700, color: "#fff" }}>{title}</p>
        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", marginTop: "4px" }}>
          Buluşma gerçekleşti!
        </p>
      </div>
    );
  }

  const units = [
    { label: "Gün",    value: countdown.days },
    { label: "Saat",   value: countdown.hours },
    { label: "Dakika", value: countdown.minutes },
    { label: "Saniye", value: countdown.seconds },
  ];

  const formattedDate = dayjs(targetDate).locale("tr").tz("Europe/Istanbul").format("D MMMM dddd, HH:mm");

  return (
    <div style={{
      background: "#181a20",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "20px",
      padding: "20px",
    }}>
      {/* Title row */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(216,66,87,0.12)",
          color: "#D84257",
          flexShrink: 0,
        }}>
          <MapPin size={15} />
        </div>
        <div>
          <p style={{ fontSize: "14px", fontWeight: 600, color: "#fff", margin: 0 }}>{title}</p>
          <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", margin: 0 }}>{formattedDate}</p>
        </div>
      </div>

      {/* Countdown grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
        {units.map((unit) => (
          <div
            key={unit.label}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              padding: "10px 0",
              borderRadius: "14px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <motion.span
              key={unit.value}
              initial={{ y: -6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.2 }}
              style={{ fontSize: "20px", fontWeight: 700, color: "#D84257", fontVariantNumeric: "tabular-nums" }}
            >
              {String(unit.value).padStart(2, "0")}
            </motion.span>
            <span style={{ fontSize: "9px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: "rgba(255,255,255,0.4)" }}>
              {unit.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
