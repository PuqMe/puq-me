import { AuthGuard } from "@/components/auth-guard";
import { MatchList } from "@/components/match-list";

export default function MatchesPage() {
  return (
    <main className="safe-px safe-pb mx-auto min-h-screen w-full max-w-md py-6">
      <AuthGuard>
        <MatchList />
      </AuthGuard>
    </main>
  );
}
