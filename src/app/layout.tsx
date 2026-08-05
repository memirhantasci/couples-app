import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "sonner";

import { getSession } from "@/lib/auth/session";

export async function generateMetadata(): Promise<Metadata> {
  const session = await getSession();
  
  let title = "Couples App 💕";
  let description = "Çiftlerin özel platformu — anılar, ilaç takibi, takvim ve daha fazlası.";
  
  if (session && session.partnerName) {
    const dName = session.displayName || (session.username.charAt(0).toUpperCase() + session.username.slice(1));
    title = `${dName} & ${session.partnerName} 💕`;
    description = `${dName} ve ${session.partnerName}'nin özel platformu — anılar, ilaç takibi, takvim ve daha fazlası.`;
  } else if (session) {
    const dName = session.displayName || (session.username.charAt(0).toUpperCase() + session.username.slice(1));
    title = `${dName} & Partneri 💕`;
    description = `${dName} ve Partnerinin özel platformu — anılar, ilaç takibi, takvim ve daha fazlası.`;
  }

  return {
    title,
    description,
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title,
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#080811",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "var(--surface-3)",
              border: "1px solid rgba(255,255,255,0.10)",
              color: "#ffffff",
              borderRadius: "14px",
              fontFamily: "'Outfit', sans-serif",
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            },
          }}
          richColors
        />
      </body>
    </html>
  );
}
