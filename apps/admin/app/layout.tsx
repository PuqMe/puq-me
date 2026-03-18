import type { Metadata } from "next";
import {
  BRAND_ADMIN_DESCRIPTION,
  BRAND_NAME,
  BRAND_TAGLINE
} from "@puqme/config";
import "./globals.css";
import { Providers } from "@/components/providers";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: `${BRAND_NAME} Admin`,
  description: BRAND_ADMIN_DESCRIPTION,
  applicationName: `${BRAND_NAME} Admin`,
  metadataBase: new URL(env.appUrl),
  openGraph: {
    title: `${BRAND_NAME} Admin`,
    description: BRAND_TAGLINE,
    siteName: `${BRAND_NAME} Admin`,
    type: "website",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: `${BRAND_NAME} admin logo`
      }
    ]
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/apple-icon.png"
  },
  robots: {
    index: false,
    follow: false
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
