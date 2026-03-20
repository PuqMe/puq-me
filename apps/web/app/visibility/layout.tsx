import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sichtbarkeit • PuQ.me",
  description: "Steuere wer dich sehen kann",
  openGraph: {
    title: "Sichtbarkeit • PuQ.me",
    description: "Steuere wer dich sehen kann",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
