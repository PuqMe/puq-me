import { AuthGuard } from "@/components/auth-guard";
import { MatchList } from "@/components/match-list";

export default function MatchesPage() {
  return (
    <main className="page-shell safe-px safe-pb">
      <AuthGuard>
        <MatchList />
      </AuthGuard>
    </main>
  );
}
