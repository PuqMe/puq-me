import { generatePageMetadata } from "@/lib/seo-utils";

export const metadata = generatePageMetadata({
  title: "Impressum",
  description: "Impressum und rechtliche Angaben gem\u00e4\u00df \u00a7 5 TMG f\u00fcr PuQ.me.",
  path: "/impressum",
});

export default function ImpressumLayout({ children }: { children: React.ReactNode }) {
  return children;
}
