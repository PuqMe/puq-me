import type { Metadata } from "next";
import { getEventSchema } from "@/lib/structured-data";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Gruppen & Aktivitäten • PuQ.me",
  description: "Entdecke Gruppenaktivitäten in deiner Nähe",
  openGraph: {
    title: "Gruppen & Aktivitäten • PuQ.me",
    description: "Entdecke Gruppenaktivitäten in deiner Nähe",
  },
  twitter: {
    card: "summary",
    title: "Gruppen & Aktivitäten • PuQ.me",
    description: "Entdecke Gruppenaktivitäten in deiner Nähe",
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
    canonical: "/groups",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const schema = getEventSchema(env.appUrl);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      {children}
    </>
  );
}
