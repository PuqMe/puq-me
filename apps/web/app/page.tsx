import Link from "next/link";
import { Card } from "@puqme/ui";

export default function HomePage() {
  return (
    <main className="page-shell safe-px safe-pb relative z-10 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(22rem,28rem)] lg:items-end lg:gap-8">
      <section className="animate-slide-up flex flex-col justify-between">
        <div className="glass-card mb-5 inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#A855F7]">
          Browser installieren
        </div>
        <h1 className="max-w-2xl text-[2.9rem] font-semibold leading-[0.92] text-white md:text-[4rem] lg:text-[5rem]">
          Purple Glass, City Lights, Dating mit einem Tap.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-white/76 md:text-lg">
          Finde Menschen in deiner Naehe mit glasklarer UI, schnellem Chat, touch-optimiertem Radar und Homescreen-PWA.
        </p>
      </section>

      <Card className="mesh-panel animate-fade-in rounded-[2rem] p-5 text-white md:p-6">
        <div className="mb-4 grid grid-cols-3 gap-2 text-center text-[11px] font-medium md:gap-3">
          <div className="surface-card rounded-[1rem] px-3 py-3 text-white/84">Geo radar</div>
          <div className="surface-card rounded-[1rem] px-3 py-3 text-white/84">Fast chat</div>
          <div className="surface-card rounded-[1rem] px-3 py-3 text-white/84">PWA install</div>
        </div>
        <div className="grid gap-3">
          <Link className="glow-button rounded-[1.35rem] px-4 py-4 text-center text-sm font-semibold text-white" href="/onboarding">
            Onboarding starten
          </Link>
          <Link className="glass-card rounded-[1.35rem] px-4 py-4 text-center text-sm font-semibold text-white" href="/register">
            Konto erstellen
          </Link>
          <Link className="glass-card rounded-[1.35rem] px-4 py-4 text-center text-sm font-semibold text-white" href="/login">
            Ich habe bereits ein Konto
          </Link>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3 text-xs text-white/72">
          <div className="rounded-[1.2rem] bg-white/8 p-3">Stadt-Mosaik</div>
          <div className="rounded-[1.2rem] bg-white/8 p-3">Blur-Ebenen</div>
          <div className="rounded-[1.2rem] bg-white/8 p-3">Touch-Flow</div>
        </div>
      </Card>
    </main>
  );
}
