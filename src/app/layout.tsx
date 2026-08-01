import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Emirhan & Öykü 💕",
  description: "Emirhan ve Öykü'nün özel platformu — anılar, ilaç takibi, takvim ve daha fazlası.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Emirhan & Öykü 💕",
  },
};

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
