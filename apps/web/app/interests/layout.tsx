import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interessen & Vorlieben • PuQ.me",
  description: "Definiere dein ideales Match",
  openGraph: {
    title: "Interessen & Vorlieben • PuQ.me",
    description: "Definiere dein ideales Match",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
