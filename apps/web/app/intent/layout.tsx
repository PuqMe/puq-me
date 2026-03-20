import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Intent – Was hast du vor? • PuQ.me",
  description: "Teile deine aktuelle Aktivität",
  openGraph: {
    title: "Intent – Was hast du vor? • PuQ.me",
    description: "Teile deine aktuelle Aktivität",
  },
  twitter: {
    card: "summary",
    title: "Intent – Was hast du vor? • PuQ.me",
    description: "Teile deine aktuelle Aktivität",
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
    canonical: "/intent",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
