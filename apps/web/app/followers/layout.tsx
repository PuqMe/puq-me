import { getCollectionPageSchema } from "@/lib/structured-data";
import { env } from "@/lib/env";
import { generatePageMetadata } from "@/lib/seo-utils";

export const metadata = generatePageMetadata({
  title: "Follower",
  description: "Deine Follower und Verbindungen verwalten",
  path: "/followers",
  icon: "👥",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  const schema = getCollectionPageSchema(env.appUrl, "/followers", "Follower", "Deine Follower und Verbindungen");
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      {children}
    </>
  );
}
