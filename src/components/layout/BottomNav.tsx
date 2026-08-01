"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Pill, Calendar, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { href: "/home",     label: "Ana Sayfa", icon: Home },
  { href: "/medicine", label: "İlaçlar",   icon: Pill },
  { href: "/calendar", label: "Takvim",    icon: Calendar },
  { href: "/letters",  label: "Mektuplar", icon: Mail },
];

interface BottomNavProps {
  role: "ADMIN" | "USER";
}

export function BottomNav({ role }: BottomNavProps) {
  const pathname = usePathname();

  if (role === "ADMIN" || pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <nav
      className="bottom-nav"
      style={{
        background: "#111114",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 -4px 24px rgba(0,0,0,0.35)",
      }}
    >
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn("bottom-nav-item", isActive && "active")}
          >
            <div className="nav-icon relative">
              <Icon
                size={22}
                strokeWidth={isActive ? 2.2 : 1.8}
                style={{ color: isActive ? "#E8002D" : "rgba(255,255,255,0.35)" }}
              />
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-[12px]"
                  style={{ background: "rgba(232, 0, 45, 0.12)" }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
            </div>
            <span
              className="nav-label"
              style={{ color: isActive ? "#E8002D" : "rgba(255,255,255,0.35)" }}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
