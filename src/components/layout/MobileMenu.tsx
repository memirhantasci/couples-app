"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Home, Pill, Camera, Calendar, LayoutDashboard, Mail, BookText, Images, Upload, CalendarDays, LineChart, Users, BookOpen, Activity, UserCog } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const userNavItems: NavItem[] = [
  {
    href: "/home",
    label: "Ana Sayfa",
    icon: <Home size={34} strokeWidth={2} />,
  },
  {
    href: "/medicine",
    label: "İlaçlar",
    icon: <Pill size={34} strokeWidth={2} />,
  },
  {
    href: "/memories",
    label: "Özel Günler",
    icon: <Camera size={34} strokeWidth={2} />,
  },
  {
    href: "/calendar",
    label: "Takvim",
    icon: <Calendar size={34} strokeWidth={2} />,
  },
  {
    href: "/daily-notes-user",
    label: "Günlük",
    icon: <BookText size={34} strokeWidth={2} />,
  },
  {
    href: "/letters",
    label: "Mektuplar",
    icon: <Mail size={34} strokeWidth={2} />,
  },
  {
    href: "/period-tracker",
    label: "Regl Takvimi",
    icon: <Activity size={34} strokeWidth={2} />,
  },
  {
    href: "/photos",
    label: "Fotoğraflar",
    icon: <Images size={34} strokeWidth={2} />,
  },
  {
    href: "/photos/upload",
    label: "Fotoğraf Yükle",
    icon: <Upload size={34} strokeWidth={2} />,
  },
  {
    href: "/admin",
    label: "Admin Paneli",
    icon: <LayoutDashboard size={34} strokeWidth={2} />,
    adminOnly: true,
  },
];

const adminNavItems: NavItem[] = [
  {
    href: "/admin",
    label: "Admin Ana Sayfa",
    icon: <LayoutDashboard size={34} strokeWidth={2} />,
  },
  {
    href: "/admin/users",
    label: "Kullanıcılar",
    icon: <UserCog size={34} strokeWidth={2} />,
  },
  {
    href: "/admin/meetings",
    label: "Buluşmalar",
    icon: <CalendarDays size={34} strokeWidth={2} />,
  },
  {
    href: "/admin/moods",
    label: "Ruh Hali",
    icon: <LineChart size={34} strokeWidth={2} />,
  },
  {
    href: "/admin/medicines",
    label: "İlaç Yönetimi",
    icon: <Pill size={34} strokeWidth={2} />,
  },
  {
    href: "/admin/logs",
    label: "Giriş Geçmişi",
    icon: <Users size={34} strokeWidth={2} />,
  },
  {
    href: "/admin/memories",
    label: "Özel Günler Y.",
    icon: <Camera size={34} strokeWidth={2} />,
  },
  {
    href: "/admin/calendar-events",
    label: "Kullanıcı Takvimi",
    icon: <CalendarDays size={34} strokeWidth={2} />,
  },
  {
    href: "/admin/daily-notes",
    label: "Günlük Notlar",
    icon: <BookOpen size={34} strokeWidth={2} />,
  },
  {
    href: "/admin/letters",
    label: "Tüm Mektuplar",
    icon: <Mail size={34} strokeWidth={2} />,
  },
  {
    href: "/admin/photos",
    label: "Tüm Fotoğraflar",
    icon: <Images size={34} strokeWidth={2} />,
  },
  {
    href: "/home",
    label: "Uygulamaya Dön",
    icon: <Home size={34} strokeWidth={2} />,
  },
];

interface MobileMenuProps {
  role: "ADMIN" | "USER";
}

export function MobileMenu({ role }: MobileMenuProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const itemsToUse = role === "ADMIN" ? adminNavItems : userNavItems;

  const visibleItems = itemsToUse.filter(
    (item) => !item.adminOnly || role === "ADMIN"
  );

  // Sayfa değiştiğinde menüyü kapat
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-xl transition-all"
        style={{ background: "rgba(255,255,255,0.06)", color: "white" }}
      >
        <Menu size={44} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[100]"
              style={{ background: "rgba(0,0,0,0.75)" }}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-[100dvh] w-[340px] z-[101] flex flex-col"
              style={{
                background: "#18181b",
                borderLeft: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "-10px 0 40px rgba(0,0,0,0.5)",
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b shrink-0" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                <span className="font-bold text-white text-[32px]">Menü</span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl transition-all hover:bg-white/10 text-white/70 hover:text-white"
                >
                  <X size={32} />
                </button>
              </div>

              {/* Links */}
              <div 
                className="flex flex-col p-4 gap-2 flex-1 overflow-y-auto min-h-0 pb-16"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                {visibleItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/home" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-4 p-4 rounded-xl font-semibold transition-all text-[28px]"
                      style={{
                        background: isActive ? "rgba(232, 0, 45, 0.15)" : "transparent",
                        color: isActive ? "var(--gs-red)" : "rgba(255,255,255,0.7)",
                        border: isActive ? "1px solid rgba(232, 0, 45, 0.3)" : "1px solid transparent",
                      }}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
