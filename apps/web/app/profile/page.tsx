import { AuthGuard } from "@/components/auth-guard";
import { ProfileOverview } from "@/components/profile-overview";

export default function ProfilePage() {
  return (
    <main className="page-shell safe-px safe-pb">
      <AuthGuard>
        <ProfileOverview />
      </AuthGuard>
    </main>
  );
}
