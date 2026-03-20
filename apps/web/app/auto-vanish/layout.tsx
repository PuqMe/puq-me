import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Auto-Vanish • PuQ.me",
  description: "Automatischer Datenschutz-Modus",
  openGraph: {
    title: "Auto-Vanish • PuQ.me",
    description: "Automatischer Datenschutz-Modus",
  },
  twitter: {
    card: "summary",
    title: "Auto-Vanish • PuQ.me",
    description: "Automatischer Datenschutz-Modus",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large" as const,
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/auto-vanish",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
