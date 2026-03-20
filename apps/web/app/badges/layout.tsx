import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Badges & Erfolge • PuQ.me",
  description: "Deine Gamification-Abzeichen",
  openGraph: {
    title: "Badges & Erfolge • PuQ.me",
    description: "Deine Gamification-Abzeichen",
  },
  twitter: {
    card: "summary",
    title: "Badges & Erfolge • PuQ.me",
    description: "Deine Gamification-Abzeichen",
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
    canonical: "/badges",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
