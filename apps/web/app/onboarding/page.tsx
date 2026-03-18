import { AuthGuard } from "@/components/auth-guard";
import { OnboardingFlow } from "@/components/onboarding-flow";

export default function OnboardingPage() {
  return (
    <main className="safe-px safe-pb mx-auto min-h-screen w-full max-w-md py-6">
      <AuthGuard>
        <OnboardingFlow />
      </AuthGuard>
    </main>
  );
}
