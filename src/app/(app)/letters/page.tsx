import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LetterList } from "@/components/letters/LetterList";
import { WriteLetterForm } from "@/components/letters/WriteLetterForm";
import { decrypt, deterministicDecrypt } from "@/utils/crypto";

export const metadata: Metadata = {
  title: "Mektuplar — Zaman Kapsülü",
};

export const dynamic = "force-dynamic";

export default async function LettersPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const supabase = createServerClient();

  const { data: receivedLetters } = await supabase
    .from("letters")
    .select(`
      *,
      sender:users!letters_sender_id_fkey(username, display_name)
    `)
    .eq("receiver_id", session.userId)
    .order("created_at", { ascending: false });

  const { data: sentLetters } = await supabase
    .from("letters")
    .select(`
      *,
      receiver:users!letters_receiver_id_fkey(username, display_name)
    `)
    .eq("sender_id", session.userId)
    .order("created_at", { ascending: false });

  const decryptedReceived = (receivedLetters || []).map((l: any) => ({
    ...l,
    content: decrypt(l.content),
    sender: { ...l.sender, username: deterministicDecrypt(l.sender?.username) || l.sender?.username }
  }));

  const decryptedSent = (sentLetters || []).map((l: any) => ({
    ...l,
    content: decrypt(l.content),
    receiver: { ...l.receiver, username: deterministicDecrypt(l.receiver?.username) || l.receiver?.username }
  }));

  const { data: users, error: usersError } = await supabase
    .from("users")
    .select("id, username, role, display_name")
    .neq("id", session.userId);

  if (usersError) console.error("Kullanıcıları çekerken hata:", usersError);

  const availableUsers = (users || [])
    .map(u => ({ ...u, username: deterministicDecrypt(u.username) || u.username }))
    .filter(u => u.username !== "admin" && u.username !== "adminadmin");

  return (
    <div
      className="px-4 pt-6 pb-8 flex flex-col max-w-lg mx-auto"
      style={{ background: "#0a0a0f", minHeight: "100%", gap: 24 }}
    >
      {/* ─── Header ─── */}
      <h2 style={{
        fontSize: 24,
        fontWeight: 800,
        color: "#E8002D",
        textAlign: "center",
        letterSpacing: "1px",
        marginBottom: -8,
      }}>
        MEKTUPLAR 💌
      </h2>

      {/* ─── Gelen Mektuplar ─── */}
      <div
        style={{
          background: "#141418",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 16,
          padding: "20px 18px",
        }}
      >
        <div className="flex items-center gap-2" style={{ marginBottom: 16 }}>
          <span style={{ fontSize: 16 }}>✉️</span>
          <h2 className="font-bold" style={{ fontSize: 16, color: "#ffffff" }}>
            Gelen Mektuplar
          </h2>
        </div>

        <LetterList letters={decryptedReceived} type="received" />
      </div>

      {/* ─── Gönderdiğim Mektuplar ─── */}
      <div
        style={{
          background: "#141418",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 16,
          padding: "20px 18px",
        }}
      >
        <div className="flex items-center gap-2" style={{ marginBottom: 16 }}>
          <span style={{ fontSize: 16 }}>➤</span>
          <h2 className="font-bold" style={{ fontSize: 16, color: "#ffffff" }}>
            Gönderdiğim Mektuplar
          </h2>
        </div>

        <LetterList letters={decryptedSent} type="sent" />
      </div>

      {/* ─── Yeni Mektup Yaz ─── */}
      <WriteLetterForm users={availableUsers} />
    </div>
  );
}
