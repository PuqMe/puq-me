import { AuthGuard } from "@/components/auth-guard";
import { OnboardingFlow } from "@/components/onboarding-flow";

export default function OnboardingPage() {
  return (
    <main className="auth-shell safe-px" style={{ position: "relative", zIndex: 10 }}>
      <AuthGuard>
        <div className="mx-auto w-full max-w-sm">
          <OnboardingFlow />
        </div>
      </AuthGuard>
    </main>
  );
}
