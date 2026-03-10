import { AuthGuard } from "@/components/auth-guard";
import { SwipeExperience } from "@/components/swipe-experience";

export default function DiscoverPage() {
  return (
    <main className="safe-px safe-pb mx-auto min-h-screen w-full max-w-md py-4">
      <AuthGuard>
        <SwipeExperience />
      </AuthGuard>
    </main>
  );
}
