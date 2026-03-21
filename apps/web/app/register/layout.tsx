import { generatePageMetadata } from "@/lib/seo-utils";

export const metadata = generatePageMetadata({
  title: "Konto erstellen",
  description: "Erstelle dein PuQ.me Profil und triff Menschen in deiner N\u00e4he.",
  path: "/register",
  noIndex: true,
});

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
