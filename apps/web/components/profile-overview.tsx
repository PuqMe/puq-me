import { AppShell } from "@/components/app-shell";
import { Card } from "@puqme/ui";

const interests = ["Live music", "City trips", "Pilates", "Coffee bars", "Sunday markets"];

export function ProfileOverview() {
  return (
    <AppShell active="/profile" title="Profil" subtitle="Dein Auftritt, deine Sichtbarkeit und deine wichtigsten Angaben">
      <section className="grid gap-4">
        <Card className="mesh-panel rounded-[2rem] p-5 text-white">
          <div className="flex items-start gap-4">
            <div className="h-24 w-20 rounded-[1.5rem] bg-gradient-to-br from-[#E6A77A] to-[#e9c98b]" />
            <div className="flex-1">
              <div className="text-2xl font-semibold text-white">Lina, 27</div>
              <div className="mt-1 text-sm text-white/68">Berlin · Verifiziert · Heute aktiv</div>
              <p className="mt-3 text-sm leading-6 text-white/74">
                Design Lead, fruehe Laeufe und immer auf der Suche nach neuen Dinner-Spots mit guter Musik.
              </p>
            </div>
          </div>
        </Card>

        <Card className="glass-card rounded-[2rem] p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-white">Profilqualitaet</div>
              <div className="mt-1 text-sm text-white/68">Bessere Profile werden im Radar prominenter gezeigt.</div>
            </div>
            <div className="text-3xl font-semibold text-white">86</div>
          </div>
          <div className="mt-4 h-2 rounded-full bg-black/10">
            <div className="h-2 w-[86%] rounded-full bg-gradient-to-r from-[#1F8F62] to-[#9FC8B1]" />
          </div>
        </Card>

        <Card className="glass-card rounded-[2rem] p-5 text-white">
          <div className="text-sm font-semibold text-white">Interessen</div>
          <div className="mt-4 flex flex-wrap gap-2">
            {interests.map((interest) => (
              <span key={interest} className="rounded-full bg-white/10 px-3 py-2 text-xs font-medium text-white/82">
                {interest}
              </span>
            ))}
          </div>
        </Card>
      </section>
    </AppShell>
  );
}
