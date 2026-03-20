import { getEventSchema } from "@/lib/structured-data";
import { env } from "@/lib/env";
import { generatePageMetadata } from "@/lib/seo-utils";

export const metadata = generatePageMetadata({
  title: "Gruppen",
  description: "Gruppenaktivitäten und gemeinsame Erlebnisse",
  path: "/groups",
  icon: "🎯",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  const schema = getEventSchema(env.appUrl);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      {children}
    </>
  );
}
