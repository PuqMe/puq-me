import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sichtbarkeit • PuQ.me",
  description: "Steuere wer dich sehen kann",
  openGraph: {
    title: "Sichtbarkeit • PuQ.me",
    description: "Steuere wer dich sehen kann",
  },
  twitter: {
    card: "summary",
    title: "Sichtbarkeit • PuQ.me",
    description: "Steuere wer dich sehen kann",
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
    canonical: "/visibility",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
