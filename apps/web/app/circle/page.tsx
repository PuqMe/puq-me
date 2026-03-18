import { AuthGuard } from "@/components/auth-guard";
import { CircleExperience } from "@/components/circle-experience";

export default function CirclePage() {
  return (
    <main className="page-shell safe-px safe-pb">
      <AuthGuard>
        <CircleExperience />
      </AuthGuard>
    </main>
  );
}
