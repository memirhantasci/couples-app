export interface SessionData {
  userId: number;
  coupleId: number | null;
  isPaired: boolean;
  username: string;
  displayName: string;
  partnerName?: string;
  meetDate?: string | null;
  relationshipStartDate?: string | null;
  role: "ADMIN" | "USER";
  loginDate: string; // YYYY-MM-DD
  loginLogId: number;
}

export interface SessionCookie {
  userId: number;
  coupleId: number | null;
  isPaired: boolean;
  username: string;
  displayName: string;
  partnerName?: string;
  meetDate?: string | null;
  relationshipStartDate?: string | null;
  role: "ADMIN" | "USER";
  loginDate: string;
  loginLogId: number;
  expiresAt?: number;
}

export const SESSION_COOKIE_NAME = "couples_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 365; // 1 year, expiration handled internally

