import { AuthGuard } from "@/components/auth-guard";
import { SwipeExperience } from "@/components/swipe-experience";

export default function DiscoverPage() {
  return (
    <main className="page-shell safe-px safe-pb">
      <AuthGuard>
        <SwipeExperience />
      </AuthGuard>
    </main>
  );
}
