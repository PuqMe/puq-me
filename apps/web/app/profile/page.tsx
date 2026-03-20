import type { Metadata } from "next";
import { AuthGuard } from "@/components/auth-guard";
import { ProfileOverview } from "@/components/profile-overview";

export const metadata: Metadata = {
  title: "Mein Profil • PuQ.me",
  description: "Dein PuQ.me Profil verwalten",
  openGraph: {
    title: "Mein Profil • PuQ.me",
    description: "Dein PuQ.me Profil verwalten",
  },
};

export default function ProfilePage() {
  return (
    <main className="page-shell safe-px safe-pb">
      <AuthGuard>
        <ProfileOverview />
      </AuthGuard>
    </main>
  );
}
