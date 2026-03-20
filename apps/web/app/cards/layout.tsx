import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aktions-Karten • PuQ.me",
  description: "Spontane Aktivitäten und Begegnungen",
  openGraph: {
    title: "Aktions-Karten • PuQ.me",
    description: "Spontane Aktivitäten und Begegnungen",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
