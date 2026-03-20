import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Intent – Was hast du vor? • PuQ.me",
  description: "Teile deine aktuelle Aktivität",
  openGraph: {
    title: "Intent – Was hast du vor? • PuQ.me",
    description: "Teile deine aktuelle Aktivität",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
