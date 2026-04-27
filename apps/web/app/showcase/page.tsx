import Link from "next/link";
import { SCREENS, GROUPS } from "@/components/showcase/registry";

export const metadata = {
  title: "PuQ.me · Mockup Showcase (83 Screens)",
  description:
    "Komplettes 83-Screen Mockup von PuQ.me — Begegnungen, Chat, Verifikation, Premium, Safety & DSGVO.",
};

export default function ShowcaseIndexPage() {
  return (
    <main className="relative z-30 min-h-screen bg-puq-deep text-puq-text">
      <style>{`.mosaic-wall, .install-now-fab, .offline-banner { display: none !important; } body { background: #02060F; }`}</style>
      <div className="mx-auto max-w-[1400px] px-6 py-10">
        <header className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-[11px] font-bold tracking-[0.2em] text-puq-mint">★ MOCKUP COMPLETE · 83 SCREENS</div>
            <h1 className="mt-2 text-4xl font-bold leading-tight tracking-tight md:text-5xl">
              PuQ.me <span className="font-serif italic text-puq-pink">Showcase.</span>
            </h1>
            <p className="mt-2 max-w-xl text-sm text-puq-muted">
              Alle 83 Screens des kompletten Mockups als pixelnahe React-Implementation
              — gerendert in einem iPhone-Frame, gruppiert nach Funktion. Jeder Screen
              ist ein eigener Standalone-Component.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <Stat v="83" l="Screens" />
            <Stat v="19" l="Gruppen" />
            <Stat v="1" l="App-Shell" />
          </div>
        </header>

        {GROUPS.map((g) => {
          const items = SCREENS.filter((s) => s.group === g).sort((a, b) => a.no - b.no);
          return (
            <section key={g} className="mb-10">
              <div className="mb-4 flex items-baseline justify-between">
                <h2 className="text-[11px] font-bold tracking-[0.2em] uppercase text-puq-mint">{g}</h2>
                <span className="text-xs text-puq-muted">{items.length} Screens</span>
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
                {items.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/showcase/${s.slug}`}
                    className="group flex flex-col gap-2"
                  >
                    <div className="relative aspect-[9/19.5] overflow-hidden rounded-2xl border border-puq-line-2/40 bg-puq-card transition group-hover:border-puq-pink/60 group-hover:shadow-puq-glow">
                      <div className="absolute inset-0 origin-top-left scale-[0.32] sm:scale-[0.32]">
                        <div style={{ width: 390, height: 844 }} className="overflow-hidden rounded-[36px]">
                          <div className="h-full w-full">
                            <s.Component />
                          </div>
                        </div>
                      </div>
                      <span className="absolute right-1.5 top-1.5 rounded-full bg-puq-deep/80 px-1.5 py-0.5 text-[9px] font-bold text-puq-pink">
                        #{String(s.no).padStart(2, "0")}
                      </span>
                    </div>
                    <div className="px-1">
                      <div className="text-[12.5px] font-semibold leading-tight transition group-hover:text-puq-pink">
                        {s.title}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}

        <footer className="mt-12 border-t border-puq-line-2/40 pt-6 text-center text-xs text-puq-faint">
          PuQ.me · Made in Berlin · Aurora Brand · DSGVO-konform
        </footer>
      </div>
    </main>
  );
}

function Stat({ v, l }: { v: string; l: string }) {
  return (
    <div className="rounded-2xl border border-puq-line-2/40 bg-puq-card/70 px-4 py-3">
      <div className="text-2xl font-bold text-puq-pink">{v}</div>
      <div className="text-[10px] uppercase tracking-wider text-puq-muted">{l}</div>
    </div>
  );
}
