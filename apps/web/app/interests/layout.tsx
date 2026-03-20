import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interessen & Vorlieben • PuQ.me",
  description: "Definiere dein ideales Match",
  openGraph: {
    title: "Interessen & Vorlieben • PuQ.me",
    description: "Definiere dein ideales Match",
  },
  twitter: {
    card: "summary",
    title: "Interessen & Vorlieben • PuQ.me",
    description: "Definiere dein ideales Match",
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
    canonical: "/interests",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
