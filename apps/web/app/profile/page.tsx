import { AuthGuard } from "@/components/auth-guard";
import { ProfileOverview } from "@/components/profile-overview";

export default function ProfilePage() {
  return (
    <main className="safe-px safe-pb mx-auto min-h-screen w-full max-w-md py-6">
      <AuthGuard>
        <ProfileOverview />
      </AuthGuard>
    </main>
  );
}
