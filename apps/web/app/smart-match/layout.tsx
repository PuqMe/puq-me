import { getSearchActionSchema } from "@/lib/structured-data";
import { env } from "@/lib/env";
import { generatePageMetadata } from "@/lib/seo-utils";

export const metadata = generatePageMetadata({
  title: "Smart Match",
  description: "KI-basiertes Matching für die besten Treffer",
  path: "/smart-match",
  icon: "🧠",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  const schema = getSearchActionSchema(env.appUrl);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      {children}
    </>
  );
}
