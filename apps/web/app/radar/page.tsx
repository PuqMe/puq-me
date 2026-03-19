import type { Metadata } from "next";
import { AuthGuard } from "@/components/auth-guard";
import { SwipeExperience } from "@/components/swipe-experience";

export const metadata: Metadata = {
  title: "Radar (Maps kommen)"
};

export default function RadarPage() {
  return (
    <main className="page-shell safe-px safe-pb">
      <AuthGuard>
        <SwipeExperience />
      </AuthGuard>
    </main>
  );
}
