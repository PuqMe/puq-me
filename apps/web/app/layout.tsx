import type { Metadata, Viewport } from "next";
import "./globals.css";
import { installPromptScript } from "@/lib/pwa";
import { OfflineBanner } from "@/components/offline-banner";
import { PwaRegistrar } from "@/components/pwa-registrar";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "PuQ.me",
  description: "Mobile-first dating app for swipes, matches and chat.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PuQ.me"
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f7f3ea"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">
        <script dangerouslySetInnerHTML={{ __html: installPromptScript }} />
        <Providers>
          <PwaRegistrar />
          <OfflineBanner />
          {children}
        </Providers>
      </body>
    </html>
  );
}
