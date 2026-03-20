import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Auto-Vanish • PuQ.me",
  description: "Automatischer Datenschutz-Modus",
  openGraph: {
    title: "Auto-Vanish • PuQ.me",
    description: "Automatischer Datenschutz-Modus",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
