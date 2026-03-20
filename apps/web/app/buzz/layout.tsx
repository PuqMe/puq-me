import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Buzz – Live-Radar • PuQ.me",
  description: "Finde Menschen in deiner direkten Umgebung",
  openGraph: {
    title: "Buzz – Live-Radar • PuQ.me",
    description: "Finde Menschen in deiner direkten Umgebung",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
