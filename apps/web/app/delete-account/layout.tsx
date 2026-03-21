import { generatePageMetadata } from "@/lib/seo-utils";

export const metadata = generatePageMetadata({
  title: "Konto l\u00f6schen",
  description: "L\u00f6sche dein PuQ.me Konto und alle zugehörigen Daten \u2014 DSGVO Art. 17.",
  path: "/delete-account",
  noIndex: true,
});

export default function DeleteAccountLayout({ children }: { children: React.ReactNode }) {
  return children;
}
