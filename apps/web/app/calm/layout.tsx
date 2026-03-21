import { generatePageMetadata } from "@/lib/seo-utils";

export const metadata = generatePageMetadata({
  title: "Ruhemodus",
  description: "Achtsames Dating mit bewussten Grenzen",
  path: "/calm",
  icon: "🧘",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
