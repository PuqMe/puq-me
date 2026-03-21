import { generatePageMetadata } from "@/lib/seo-utils";

export const metadata = generatePageMetadata({
  title: "Vorhaben",
  description: "Zeige was du gerade vorhast und finde Gleichgesinnte",
  path: "/intent",
  icon: "💡",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
