import type { Metadata, Viewport } from "next";
import {
  BRAND_DESCRIPTION,
  BRAND_NAME,
  BRAND_SHORT_NAME,
  BRAND_TAGLINE,
  BRAND_THEME_COLOR
} from "@puqme/config";
import "./globals.css";
import { installPromptScript } from "@/lib/pwa";
import { CityBackdrop } from "@/components/city-backdrop";
import { InstallNowFab } from "@/components/install-now-fab";
import { OfflineBanner } from "@/components/offline-banner";
import { PwaRegistrar } from "@/components/pwa-registrar";
import { Providers } from "@/components/providers";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: BRAND_NAME,
  description: BRAND_DESCRIPTION,
  applicationName: BRAND_NAME,
  metadataBase: new URL(env.appUrl),
  manifest: "/manifest.webmanifest",
  keywords: ["dating", "matches", "chat", "swipe", "city", BRAND_NAME],
  openGraph: {
    title: BRAND_NAME,
    description: BRAND_TAGLINE,
    siteName: BRAND_NAME,
    type: "website",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: `${BRAND_NAME} logo`
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: BRAND_NAME,
    description: BRAND_TAGLINE,
    images: ["/twitter-image.png"]
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: BRAND_NAME
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" }
    ],
    shortcut: "/icon.svg",
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }]
  },
  category: "social"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: BRAND_THEME_COLOR
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="app-frame min-h-screen font-sans antialiased">
        <script dangerouslySetInnerHTML={{ __html: installPromptScript }} />
        <CityBackdrop />
        <Providers>
          <PwaRegistrar />
          <OfflineBanner />
          <InstallNowFab />
          {children}
        </Providers>
      </body>
    </html>
  );
}
