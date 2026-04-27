import Link from "next/link";
import { notFound } from "next/navigation";
import { SCREENS, getScreen } from "@/components/showcase/registry";
import { PhoneFrame } from "@/components/showcase/chrome";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return SCREENS.map((s) => ({ slug: s.slug }));
}

export function generateMetadata({ params }: { params: Params }) {
  const screen = getScreen(params.slug);
  if (!screen) return { title: "PuQ.me Showcase" };
  return {
    title: `${screen.title} · PuQ.me Showcase`,
    description: `Screen ${String(screen.no).padStart(2, "0")} / 83 · ${screen.group} · PuQ.me Mockup`,
  };
}

export default function ShowcaseScreenPage({ params }: { params: Params }) {
  const screen = getScreen(params.slug);
  if (!screen) notFound();

  const idx = SCREENS.findIndex((s) => s.slug === screen.slug);
  const prev = SCREENS[idx - 1];
  const next = SCREENS[idx + 1];

  return (
    <main className="min-h-screen bg-puq-aurora text-puq-text">
      <div className="mx-auto max-w-[1100px] px-6 py-8">
        <Link href="/showcase" className="inline-flex items-center gap-2 text-sm text-puq-pink hover:text-puq-pink-2">
          ← Zurück zur Galerie
        </Link>

        <div className="mt-6 grid items-start gap-10 md:grid-cols-[auto_1fr]">
          <div className="mx-auto">
            <PhoneFrame label={`#${String(screen.no).padStart(2, "0")} / 83 · ${screen.group}`}>
              <screen.Component />
            </PhoneFrame>
          </div>
          <div className="md:pt-12">
            <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-puq-mint">{screen.group}</div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{screen.title}</h1>
            <p className="mt-3 text-sm text-puq-muted">
              Screen {String(screen.no).padStart(2, "0")} von 83. Lauffähige React-Implementation
              im Aurora-Design-System auf Basis von Tailwind und Inline-SVG-Icons.
            </p>

            <div className="mt-8 flex flex-col gap-3">
              {prev ? (
                <Link
                  href={`/showcase/${prev.slug}`}
                  className="rounded-2xl border border-puq-line-2/40 bg-puq-card/60 px-4 py-3 transition hover:border-puq-pink/60"
                >
                  <div className="text-[10.5px] font-bold tracking-widest text-puq-muted">← VORHERIGER</div>
                  <div className="mt-1 text-[14px] font-semibold">#{String(prev.no).padStart(2, "0")} · {prev.title}</div>
                </Link>
              ) : null}
              {next ? (
                <Link
                  href={`/showcase/${next.slug}`}
                  className="rounded-2xl border border-puq-line-2/40 bg-puq-card/60 px-4 py-3 transition hover:border-puq-pink/60"
                >
                  <div className="text-[10.5px] font-bold tracking-widest text-puq-muted">NÄCHSTER →</div>
                  <div className="mt-1 text-[14px] font-semibold">#{String(next.no).padStart(2, "0")} · {next.title}</div>
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
