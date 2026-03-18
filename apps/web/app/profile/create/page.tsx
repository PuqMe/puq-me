import { AuthGuard } from "@/components/auth-guard";
import { ProfileBuilder } from "@/components/profile-builder";

export default function CreateProfilePage() {
  return (
    <main className="page-shell safe-px safe-pb">
      <AuthGuard>
        <ProfileBuilder />
      </AuthGuard>
    </main>
  );
}
