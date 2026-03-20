import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Follower • PuQ.me",
  description: "Deine Follower und Verbindungen",
  openGraph: {
    title: "Follower • PuQ.me",
    description: "Deine Follower und Verbindungen",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
