import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Users, Key, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { decrypt, deterministicDecrypt } from "@/utils/crypto";

export const metadata: Metadata = {
  title: "Kullanıcılar — Admin Paneli",
};

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/home");

  const supabase = createServerClient();
  const { data: users } = await supabase
    .from("users")
    .select("display_name, username, email, password, role")
    .order("created_at", { ascending: true });

  return (
    <div className="px-4 py-6 flex flex-col gap-6 max-w-lg mx-auto min-h-[calc(100dvh-70px)]">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin"
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10 text-white/70"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Users size={22} style={{ color: "var(--gs-red)" }} />
            Kullanıcılar
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 2 }}>
            Sistemdeki tüm kullanıcılar ve bilgileri
          </p>
        </div>
      </div>

      {/* Users List */}
      <div className="flex flex-col gap-4">
        {users?.map((u, i) => {
          const isEncrypted = u.password?.startsWith("enc:");
          const isBcrypt = u.password?.startsWith("$2");
          let displayPassword = "";
          if (isEncrypted) {
            displayPassword = decrypt(u.password);
          } else if (isBcrypt) {
            displayPassword = "(Hashli - Kullanıcı giriş yapınca çözülebilir olacak)";
          } else {
            displayPassword = u.password || "Şifre yok"; // Plain text
          }
          
          return (
            <div key={i} className="flex flex-col p-5 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex items-center gap-2 mb-4">
                <span className="font-bold text-white text-lg">{u.display_name}</span>
                {u.role === "ADMIN" && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(232,0,45,0.2)", color: "#FF6B6B" }}>
                    ADMIN
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex flex-col">
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>Kullanıcı Adı</span>
                  <span className="text-white mt-1">{deterministicDecrypt(u.username) || u.username}</span>
                </div>
                <div className="flex flex-col">
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>E-posta</span>
                  <span className="text-white mt-1">{u.email ? (deterministicDecrypt(u.email) || u.email) : "-"}</span>
                </div>
                <div className="flex flex-col col-span-2 mt-2">
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                    <Key size={12} /> Şifre
                  </span>
                  <span className="text-white font-mono mt-1 w-fit px-3 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.08)", fontSize: 14 }}>
                    {displayPassword}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
