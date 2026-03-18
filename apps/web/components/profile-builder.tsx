import { Button, Card } from "@puqme/ui";
import { PageHeader } from "@/components/page-header";

export function ProfileBuilder() {
  return (
    <section className="grid gap-4">
      <PageHeader
        eyebrow="Profil erstellen"
        title="Zeig deine beste Seite"
        description="Ein starkes Profil wird besser gefunden und fuehlt sich direkt vertrauenswuerdig an."
      />

      <Card className="mesh-panel rounded-[2rem] p-5 text-white">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-white">Die wichtigsten Angaben zuerst</div>
            <div className="mt-1 text-sm text-white/70">Wenige Schritte, klarer Auftritt.</div>
          </div>
          <div className="soft-pill rounded-full px-3 py-1 text-[11px] font-semibold">Schritt 1</div>
        </div>
        <div className="grid gap-3">
          <input className="rounded-[1.2rem] border border-white/12 bg-white/10 px-4 py-4 text-white outline-none placeholder:text-white/35" placeholder="Anzeigename" />
          <textarea className="min-h-28 rounded-[1.2rem] border border-white/12 bg-white/10 px-4 py-4 text-white outline-none placeholder:text-white/35" placeholder="Kurze Bio" />
          <div className="grid grid-cols-2 gap-3">
            <input className="rounded-[1.2rem] border border-white/12 bg-white/10 px-4 py-4 text-white outline-none placeholder:text-white/35" placeholder="Alter" />
            <input className="rounded-[1.2rem] border border-white/12 bg-white/10 px-4 py-4 text-white outline-none placeholder:text-white/35" placeholder="Stadt" />
          </div>
        </div>
      </Card>

      <Card className="glass-card rounded-[2rem] p-5 text-white">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-white">Fotos</div>
          <div className="warm-pill rounded-full px-3 py-1 text-[11px] font-semibold">Schritt 2</div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="aspect-[3/4] rounded-[1.5rem] border border-dashed border-white/16 bg-white/8" />
          ))}
        </div>
      </Card>

      <Button className="glow-button rounded-[1.35rem] py-4 text-sm font-semibold">Profil speichern</Button>
    </section>
  );
}
