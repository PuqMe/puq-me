import { generatePageMetadata } from "@/lib/seo-utils";

export const metadata = generatePageMetadata({
  title: "Datenschutzerkl\u00e4rung",
  description: "Wie PuQ.me deine Daten erfasst, nutzt und sch\u00fctzt \u2014 DSGVO-konform.",
  path: "/privacy",
});

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
