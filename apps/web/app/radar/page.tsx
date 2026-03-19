import type { Metadata } from "next";
import { AuthGuard } from "@/components/auth-guard";
import { RadarMap } from "@/components/radar-map";

export const metadata: Metadata = {
  title: "Radar • Finde Menschen in deiner Nähe"
};

export default function RadarPage() {
  return (
    <main className="page-shell safe-px safe-pb">
      <AuthGuard>
        <RadarMap />
      </AuthGuard>
    </main>
  );
}
