import type { Metadata } from "next";
import { getCollectionPageSchema } from "@/lib/structured-data";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Aktions-Karten • PuQ.me",
  description: "Spontane Aktivitäten und Begegnungen",
  openGraph: {
    title: "Aktions-Karten • PuQ.me",
    description: "Spontane Aktivitäten und Begegnungen",
  },
  twitter: {
    card: "summary",
    title: "Aktions-Karten • PuQ.me",
    description: "Spontane Aktivitäten und Begegnungen",
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
    canonical: "/cards",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const schema = getCollectionPageSchema(env.appUrl, "/cards", "Aktions-Karten", "Spontane Aktivitäten und Begegnungen");
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      {children}
    </>
  );
}
