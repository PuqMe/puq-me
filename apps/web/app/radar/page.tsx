import type { Metadata } from "next";
import { AuthGuard } from "@/components/auth-guard";
import { SwipeExperience } from "@/components/swipe-experience";
import { RadarMap } from "@/components/radar-map";

export const metadata: Metadata = {
  title: "Radar • Finde Menschen in deiner Nähe"
};

export default function RadarPage() {
  return (
    <main className="page-shell safe-px safe-pb">
      <AuthGuard>
        <div className="grid gap-6">
          {/* Radar Map Section */}
          <section className="animate-slide-up">
            <div className="mb-4">
              <h1 className="text-2xl font-semibold text-white">Radar</h1>
              <p className="text-sm text-white/60 mt-1">Finde Menschen in deiner Nähe mit interaktiver Karte</p>
            </div>
            <RadarMap />
          </section>

          {/* Swipe Experience Section */}
          <section className="animate-fade-in">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-white">Kandidaten durchsuchen</h2>
            </div>
            <SwipeExperience />
          </section>
        </div>
      </AuthGuard>
    </main>
  );
}
