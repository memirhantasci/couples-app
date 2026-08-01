import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { TopHeader } from "./TopHeader";
import { BottomNav } from "./BottomNav";
import Link from "next/link";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const displayName = session.displayName || 
    (session.username.charAt(0).toUpperCase() + session.username.slice(1));

  return (
    <div className="min-h-dvh">
      {/* Top Header & Drawer */}
      <TopHeader role={session.role} displayName={displayName} />

      {/* Main Content */}
      <main
        style={{
          paddingBottom: "calc(72px + env(safe-area-inset-bottom) + 16px)",
          minHeight: "calc(100dvh - 60px)",
        }}
      >
        {children}
      </main>

      {/* Bottom Navigation */}
      <BottomNav role={session.role} />
    </div>
  );
}
