import { generatePageMetadata } from "@/lib/seo-utils";

export const metadata = generatePageMetadata({
  title: "AGB",
  description: "Allgemeine Gesch\u00e4ftsbedingungen und Nutzungsbedingungen f\u00fcr PuQ.me.",
  path: "/agb",
});

export default function AGBLayout({ children }: { children: React.ReactNode }) {
  return children;
}
