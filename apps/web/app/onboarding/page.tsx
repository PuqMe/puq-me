import { AuthGuard } from "@/components/auth-guard";
import { OnboardingFlow } from "@/components/onboarding-flow";

export default function OnboardingPage() {
  return (
    <main className="page-shell safe-px safe-pb">
      <AuthGuard>
        <OnboardingFlow />
      </AuthGuard>
    </main>
  );
}
