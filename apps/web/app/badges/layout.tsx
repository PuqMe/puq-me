import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Badges & Erfolge • PuQ.me",
  description: "Deine Gamification-Abzeichen",
  openGraph: {
    title: "Badges & Erfolge • PuQ.me",
    description: "Deine Gamification-Abzeichen",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
