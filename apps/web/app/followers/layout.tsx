import type { Metadata } from "next";
import { getCollectionPageSchema } from "@/lib/structured-data";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Follower • PuQ.me",
  description: "Deine Follower und Verbindungen",
  openGraph: {
    title: "Follower • PuQ.me",
    description: "Deine Follower und Verbindungen",
  },
  twitter: {
    card: "summary",
    title: "Follower • PuQ.me",
    description: "Deine Follower und Verbindungen",
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
    canonical: "/followers",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const schema = getCollectionPageSchema(env.appUrl, "/followers", "Follower", "Deine Follower und Verbindungen");
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      {children}
    </>
  );
}
