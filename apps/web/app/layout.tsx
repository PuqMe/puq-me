import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
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
import { SkipNav } from "@/components/skip-nav";
import { env } from "@/lib/env";
import { getAllStructuredData } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: BRAND_NAME,
  description: BRAND_DESCRIPTION,
  applicationName: BRAND_NAME,
  metadataBase: new URL(env.appUrl),
  manifest: "/manifest.webmanifest",
  keywords: [
    "dating", "dating app", "matches", "chat", "swipe", "city dating",
    "nearby dating", "radar dating", "smart match", "local encounters",
    "privacy dating", BRAND_NAME, "PuQ", "puq.me",
    "Dating App", "Begegnungen", "Treffen", "Stadtdating"
  ],
  alternates: {
    canonical: env.appUrl,
    languages: {
      "en": env.appUrl,
      "de": env.appUrl,
    },
  },
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
  viewportFit: "cover",
  themeColor: BRAND_THEME_COLOR
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const langCookie = cookieStore.get("puqme.lang")?.value;
  const lang = langCookie === "de" ? "de" : "en";

  const structuredData = getAllStructuredData(env.appUrl);

  return (
    <html lang={lang}>
      <head>
        {structuredData.map((schema, i) => (
          <script
            key={`ld-${i}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
        <link rel="preload" as="image" href="https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=600&q=60" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.puq.me" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.puq.me" />
        <link rel="preconnect" href="https://a.basemaps.cartocdn.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://b.basemaps.cartocdn.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://a.basemaps.cartocdn.com" />
        <link rel="dns-prefetch" href="https://b.basemaps.cartocdn.com" />
        <link rel="alternate" hrefLang="en" href={env.appUrl} />
        <link rel="alternate" hrefLang="de" href={env.appUrl} />
        <link rel="alternate" hrefLang="x-default" href={env.appUrl} />
      </head>
      <body className="app-frame min-h-screen font-sans antialiased">
        <SkipNav />
        <div id="main-content" />
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
