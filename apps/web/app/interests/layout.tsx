import { generatePageMetadata } from "@/lib/seo-utils";

export const metadata = generatePageMetadata({
  title: "Interessen",
  description: "Definiere deinen idealen Match und deine Vorlieben",
  path: "/interests",
  icon: "💜",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
