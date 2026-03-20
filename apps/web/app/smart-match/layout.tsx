import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Smart Match – Dein perfektes Match • PuQ.me",
  description: "KI-basiertes Matching für die besten Treffer",
  openGraph: {
    title: "Smart Match – Dein perfektes Match • PuQ.me",
    description: "KI-basiertes Matching für die besten Treffer",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
