import type { Metadata } from "next";
import { getSearchActionSchema } from "@/lib/structured-data";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Smart Match – Dein perfektes Match • PuQ.me",
  description: "KI-basiertes Matching für die besten Treffer",
  openGraph: {
    title: "Smart Match – Dein perfektes Match • PuQ.me",
    description: "KI-basiertes Matching für die besten Treffer",
  },
  twitter: {
    card: "summary",
    title: "Smart Match – Dein perfektes Match • PuQ.me",
    description: "KI-basiertes Matching für die besten Treffer",
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
    canonical: "/smart-match",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const schema = getSearchActionSchema(env.appUrl);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      {children}
    </>
  );
}
