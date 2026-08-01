import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE, type SessionCookie } from "./types";
import { createServerClient } from "@/lib/supabase/server";

/**
 * Creates a session cookie with the given session data
 */
export async function createSession(data: Omit<SessionCookie, "expiresAt">): Promise<void> {
  const cookieStore = await cookies();
  const sessionData: SessionCookie = {
    ...data,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes from now
  };
  const payload = JSON.stringify(sessionData);
  // Simple base64 encoding (not encryption — security through HttpOnly)
  const encoded = Buffer.from(payload).toString("base64");

  cookieStore.set(SESSION_COOKIE_NAME, encoded, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

/**
 * Reads and parses the session cookie
 * Returns null if no valid session exists
 */
export async function getSession(): Promise<SessionCookie | null> {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!cookie?.value) return null;

    const decoded = Buffer.from(cookie.value, "base64").toString("utf8");
    const data = JSON.parse(decoded) as SessionCookie;

    if (!data.userId || !data.role || !data.loginDate) return null;

    if (data.expiresAt && Date.now() > data.expiresAt) {
      return null; // Session expired
    }

    // Single Active Device Check: Invalidate session if a newer login log exists
    if (data.loginLogId) {
      const supabase = createServerClient();
      const { data: latestLog } = await supabase
        .from("login_logs")
        .select("id")
        .eq("user_id", data.userId)
        .order("id", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestLog && latestLog.id > data.loginLogId) {
        return null; // Another device has logged in
      }
    }

    return data;
  } catch {
    return null;
  }
}

/**
 * Destroys the session cookie
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Checks if today is different from the session's loginDate
 * Returns true if the session should be invalidated (day has changed)
 */
export function isSessionExpiredByMidnight(loginDate: string): boolean {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return today !== loginDate;
}
