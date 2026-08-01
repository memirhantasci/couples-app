"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/actions/auth";
import {
  Heart, LogOut, X, Home, Pill, Camera, Calendar,
  LayoutDashboard, Mail, BookText, Images, Upload, Activity,
  Menu, CalendarDays, LineChart, Users, BookOpen,
  ChevronDown, ChevronUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { href: "/home",       label: "Ana Sayfa",     icon: <Home size={38} strokeWidth={2} /> },
  { href: "/medicine",   label: "İlaçlar",        icon: <Pill size={38} strokeWidth={2} /> },
  { href: "/memories",   label: "Özel Günler",    icon: <Camera size={38} strokeWidth={2} /> },
  { href: "/calendar",   label: "Takvim",         icon: <Calendar size={38} strokeWidth={2} /> },
  { href: "/daily-notes-user", label: "Günlük",   icon: <BookText size={38} strokeWidth={2} /> },
  { href: "/letters",    label: "Mektuplar",      icon: <Mail size={38} strokeWidth={2} /> },
  { href: "/period-tracker", label: "Regl Takvimi", icon: <Activity size={38} strokeWidth={2} /> },
  { href: "/photos", label: "Fotoğraflar", icon: <Images size={38} strokeWidth={2} /> },
  { href: "/photos/upload", label: "Fotoğraf Yükle", icon: <Upload size={38} strokeWidth={2} /> },
  { href: "/admin",      label: "Admin Paneli",   icon: <LayoutDashboard size={38} strokeWidth={2} />, adminOnly: true },
];

const adminNavItems: NavItem[] = [
  { href: "/admin", label: "Admin Ana Sayfa", icon: <LayoutDashboard size={38} strokeWidth={2} /> },
  { href: "/admin/meetings", label: "Buluşmalar", icon: <CalendarDays size={38} strokeWidth={2} /> },
  { href: "/admin/moods", label: "Ruh Hali", icon: <LineChart size={38} strokeWidth={2} /> },
  { href: "/admin/medicines", label: "İlaç Yönetimi", icon: <Pill size={38} strokeWidth={2} /> },
  { href: "/admin/logs", label: "Giriş Geçmişi", icon: <Users size={38} strokeWidth={2} /> },
  { href: "/admin/memories", label: "Özel Günler Y.", icon: <Camera size={38} strokeWidth={2} /> },
  { href: "/admin/calendar-events", label: "Kullanıcı Takvimi", icon: <CalendarDays size={38} strokeWidth={2} /> },
  { href: "/admin/daily-notes", label: "Günlük Notlar", icon: <BookOpen size={38} strokeWidth={2} /> },
  { href: "/admin/letters", label: "Tüm Mektuplar", icon: <Mail size={38} strokeWidth={2} /> },
  { href: "/admin/photos", label: "Tüm Fotoğraflar", icon: <Images size={38} strokeWidth={2} /> },
  { href: "/home", label: "Uygulamaya Dön", icon: <Home size={38} strokeWidth={2} /> },
];

interface TopHeaderProps {
  role: "ADMIN" | "USER";
  displayName: string;
}

export function TopHeader({ role, displayName }: TopHeaderProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isAppMenuExpanded, setIsAppMenuExpanded] = useState(false);

  const itemsToUse = role === "ADMIN" ? adminNavItems : navItems;

  const visibleItems = itemsToUse.filter(
    (item) => !item.adminOnly || role === "ADMIN"
  );

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Menü açıkken body scroll'u kilitle
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      <header
        className="w-full sticky top-0 z-50 flex items-center justify-between px-6 py-4"
        style={{
          background: "rgba(17, 17, 20, 0.96)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 1px 12px rgba(0,0,0,0.35)",
        }}
      >
        {/* Logo */}
        <Link href="/home" className="flex items-center gap-1.5 transition-opacity hover:opacity-80">
          <span style={{ fontSize: 18 }}>❤️</span>
          <span
            className="font-display font-bold"
            style={{
              fontSize: 20,
              color: "#ffffff",
              textShadow: "0 0 12px rgba(255, 105, 180, 0.8), 0 0 20px rgba(255, 105, 180, 0.4)"
            }}
          >
            Emirhan &amp; Öykü
          </span>
          <span style={{ fontSize: 18 }}>❤️</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Profil İsmi (3 çizginin solunda) */}
          <span
            className="font-semibold"
            style={{ fontSize: 16, color: "rgba(255,255,255,0.9)" }}
          >
            {displayName}
          </span>

          {/* 3 Çizgi Menü Butonu (Büyütülmüş) */}
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center justify-center p-1 transition-all active:scale-95"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
            aria-label="Menüyü aç"
          >
            <Menu size={38} strokeWidth={2.5} style={{ color: "#D84257" }} />
          </button>
        </div>
      </header>

      {/* Drawer — Outside header to avoid stacking context issues */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[100]"
              style={{ background: "rgba(0,0,0,0.65)" }}
            />

            {/* Slide-over Drawer */}
            <motion.div
              initial={{ x: role === "ADMIN" ? "100%" : "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: role === "ADMIN" ? "100%" : "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className={cn(
                "fixed top-0 h-[100dvh] z-[101] flex flex-col",
                role === "ADMIN" ? "right-0 w-[90vw] sm:w-[460px]" : "left-0 w-[85vw] sm:w-[320px]"
              )}
              style={role === "ADMIN" ? {
                background: "#1a1a1e",
                borderLeft: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "-16px 0 48px rgba(0,0,0,0.55)",
              } : {
                background: "rgba(20, 20, 24, 0.45)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                borderRight: "1px solid rgba(255,255,255,0.08)",
                borderTopRightRadius: 24,
                borderBottomRightRadius: 24,
                boxShadow: "16px 0 48px rgba(0,0,0,0.3)",
              }}
            >
              {role === "ADMIN" ? (
                <>
                  <div className="flex items-center justify-between px-6 py-6 border-b shrink-0" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                    <span className="font-bold text-white text-[32px]">Menü</span>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center rounded-[14px] transition-all hover:bg-white/10"
                      style={{ width: 48, height: 48, color: "rgba(255,255,255,0.55)" }}
                    >
                      <X size={32} strokeWidth={2} />
                    </button>
                  </div>
                  <div className="flex flex-col p-4 gap-1 flex-1 overflow-y-auto min-h-0 pb-16" style={{ WebkitOverflowScrolling: "touch" }}>
                    {visibleItems.map((item) => {
                      const isAppReturn = item.href === "/home" && role === "ADMIN";
                      const isActive = pathname === item.href || (item.href !== "/home" && pathname.startsWith(item.href));
                      
                      return (
                        <div key={item.href} className="flex flex-col">
                          <div className="flex items-stretch gap-1">
                            <Link
                              href={item.href}
                              className="flex-1 flex items-center gap-5 px-5 py-4 rounded-[16px] font-semibold transition-all text-[28px]"
                              style={{
                                background: isActive ? "rgba(232, 0, 45, 0.12)" : "transparent",
                                color: isActive ? "var(--gs-red)" : "rgba(255,255,255,0.75)",
                                border: isActive ? "1px solid rgba(232, 0, 45, 0.22)" : "1px solid transparent",
                              }}
                            >
                              <span style={{ opacity: isActive ? 1 : 0.7 }}>{item.icon}</span>
                              <span>{item.label}</span>
                            </Link>
                            {isAppReturn && (
                              <button
                                onClick={() => setIsAppMenuExpanded(!isAppMenuExpanded)}
                                className="px-4 rounded-[16px] transition-all flex items-center justify-center active:scale-95"
                                style={{ 
                                  background: isAppMenuExpanded ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)",
                                  color: "rgba(255,255,255,0.85)" 
                                }}
                              >
                                {isAppMenuExpanded ? <ChevronUp size={34} /> : <ChevronDown size={34} />}
                              </button>
                            )}
                          </div>

                          {isAppReturn && (
                            <AnimatePresence>
                              {isAppMenuExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden flex flex-col pl-4 pr-1 gap-1 mt-2"
                                >
                                  <div className="pl-6 border-l-2 border-white/10 py-2 flex flex-col gap-2">
                                    {navItems.filter(i => !i.adminOnly && i.href !== "/home").map(subItem => (
                                      <Link
                                        key={subItem.href}
                                        href={subItem.href}
                                        className="flex items-center gap-4 px-4 py-3 rounded-[14px] font-semibold transition-all text-[24px] active:bg-white/5"
                                        style={{ color: "rgba(255,255,255,0.65)" }}
                                      >
                                        <span style={{ opacity: 0.7, transform: "scale(0.85)" }}>{subItem.icon}</span>
                                        <span>{subItem.label}</span>
                                      </Link>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          )}
                        </div>
                      );
                    })}
                    <div className="mt-8 pt-4 border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                      <form action={logoutAction}>
                        <button
                          type="submit"
                          className="w-full flex items-center justify-center gap-4 py-4 rounded-[16px] font-bold text-[24px] transition-all"
                          style={{
                            background: "linear-gradient(135deg, var(--gs-red) 0%, #B5001F 100%)",
                            color: "#ffffff",
                            boxShadow: "0 4px 16px rgba(232, 0, 45, 0.3)",
                          }}
                        >
                          <LogOut size={28} />
                          <span>Çıkış Yap</span>
                        </button>
                      </form>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* User Drawer New Design */}
                  
                  {/* Close button that perfectly overlaps the original hamburger menu */}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="fixed flex items-center justify-center p-1 transition-all active:scale-95 z-[105]"
                    style={{
                      top: "16px",
                      right: "24px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                    aria-label="Menüyü kapat"
                  >
                    <Menu size={38} strokeWidth={2.5} style={{ color: "#D84257", opacity: 0.8 }} />
                  </button>

                  <div className="flex flex-col pt-10 pb-6 px-4 h-full relative z-[102]">
                    <h2
                      className="text-center font-serif text-[28px] font-bold mb-8"
                      style={{ color: "#e3ba74" }}
                    >
                      🤎Emirhan &amp; Öykü🤎
                    </h2>

                    <div className="flex flex-col gap-2 flex-1 overflow-y-auto pb-4" style={{ WebkitOverflowScrolling: "touch" }}>
                      {visibleItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== "/home" && pathname.startsWith(item.href));
                        
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-4 px-4 py-3 rounded-[12px] transition-all text-[18px]"
                            style={{
                              background: isActive ? "rgba(232, 0, 45, 0.15)" : "transparent",
                              color: isActive ? "#E8002D" : "#ffffff",
                            }}
                          >
                            <span style={{ opacity: isActive ? 1 : 0.8, transform: "scale(0.85)" }}>
                              {item.icon}
                            </span>
                            <span style={{ fontWeight: isActive ? 600 : 400 }}>{item.label}</span>
                          </Link>
                        );
                      })}

                      <div className="mt-6 pt-4 border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                        <form action={logoutAction}>
                          <button
                            type="submit"
                            className="w-full flex items-center justify-center gap-4 py-4 rounded-full font-bold text-[20px] transition-all active:scale-95"
                            style={{
                              background: "#E8002D",
                              color: "#ffffff",
                            }}
                          >
                            <LogOut size={24} style={{ transform: "rotate(180deg)" }} />
                            <span>Çıkış Yap</span>
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
