import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Buzz – Live-Radar • PuQ.me",
  description: "Finde Menschen in deiner direkten Umgebung",
  openGraph: {
    title: "Buzz – Live-Radar • PuQ.me",
    description: "Finde Menschen in deiner direkten Umgebung",
  },
  twitter: {
    card: "summary",
    title: "Buzz – Live-Radar • PuQ.me",
    description: "Finde Menschen in deiner direkten Umgebung",
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
    canonical: "/buzz",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
