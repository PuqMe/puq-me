import type { Metadata } from "next";
import { AuthGuard } from "@/components/auth-guard";
import { MatchList } from "@/components/match-list";

export const metadata: Metadata = {
  title: "Matches • PuQ.me",
  description: "Deine Matches und Verbindungen",
  openGraph: {
    title: "Matches • PuQ.me",
    description: "Deine Matches und Verbindungen",
  },
};

export default function MatchesPage() {
  return (
    <main className="page-shell safe-px safe-pb">
      <AuthGuard>
        <MatchList />
      </AuthGuard>
    </main>
  );
}
