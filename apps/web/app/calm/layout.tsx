import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calm Mode • PuQ.me",
  description: "Achtsames Dating mit bewussten Grenzen",
  openGraph: {
    title: "Calm Mode • PuQ.me",
    description: "Achtsames Dating mit bewussten Grenzen",
  },
  twitter: {
    card: "summary",
    title: "Calm Mode • PuQ.me",
    description: "Achtsames Dating mit bewussten Grenzen",
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
    canonical: "/calm",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
