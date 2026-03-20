import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gruppen & Aktivitäten • PuQ.me",
  description: "Entdecke Gruppenaktivitäten in deiner Nähe",
  openGraph: {
    title: "Gruppen & Aktivitäten • PuQ.me",
    description: "Entdecke Gruppenaktivitäten in deiner Nähe",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
