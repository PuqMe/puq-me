import { generatePageMetadata } from "@/lib/seo-utils";

export const metadata = generatePageMetadata({
  title: "Anmelden",
  description: "Melde dich bei PuQ.me an und entdecke Menschen in deiner N\u00e4he.",
  path: "/login",
  noIndex: true,
});

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
