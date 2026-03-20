import { generatePageMetadata } from "@/lib/seo-utils";

export const metadata = generatePageMetadata({
  title: "Badges",
  description: "Sammle Auszeichnungen und zeige deinen Status",
  path: "/badges",
  icon: "🏆",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
