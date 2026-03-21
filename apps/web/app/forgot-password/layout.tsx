import { generatePageMetadata } from "@/lib/seo-utils";

export const metadata = generatePageMetadata({
  title: "Passwort zur\u00fccksetzen",
  description: "Setze dein PuQ.me Passwort zur\u00fcck.",
  path: "/forgot-password",
  noIndex: true,
});

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
