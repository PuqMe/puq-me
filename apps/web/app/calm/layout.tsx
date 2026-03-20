import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calm Mode • PuQ.me",
  description: "Achtsames Dating mit bewussten Grenzen",
  openGraph: {
    title: "Calm Mode • PuQ.me",
    description: "Achtsames Dating mit bewussten Grenzen",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
