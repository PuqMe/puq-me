import { getCollectionPageSchema } from "@/lib/structured-data";
import { env } from "@/lib/env";
import { generatePageMetadata } from "@/lib/seo-utils";

export const metadata = generatePageMetadata({
  title: "Activity Cards",
  description: "Spontane Aktivitäten und Begegnungen in deiner Stadt",
  path: "/cards",
  icon: "🎴",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  const schema = getCollectionPageSchema(env.appUrl, "/cards", "Aktions-Karten", "Spontane Aktivitäten und Begegnungen");
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      {children}
    </>
  );
}
