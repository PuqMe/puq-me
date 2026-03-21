import { generatePageMetadata } from "@/lib/seo-utils";

export const metadata = generatePageMetadata({
  title: "Buzz-Radar",
  description: "Finde Menschen in deiner direkten Umgebung",
  path: "/buzz",
  icon: "📡",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
