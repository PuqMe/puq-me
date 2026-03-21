import { generatePageMetadata } from "@/lib/seo-utils";

export const metadata = generatePageMetadata({
  title: "Auto-Verschwinden",
  description: "Automatischer Datenschutz – dein Profil verschwindet nach Ablauf",
  path: "/auto-vanish",
  icon: "👻",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
