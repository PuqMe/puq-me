import { AuthGuard } from "@/components/auth-guard";
import { CircleExperience } from "@/components/circle-experience";

export default function CirclePage() {
  return (
    <main className="safe-px safe-pb mx-auto min-h-screen w-full max-w-md py-4">
      <AuthGuard>
        <CircleExperience />
      </AuthGuard>
    </main>
  );
}
