import Link from "next/link";
import { Card } from "@puqme/ui";

export default function HomePage() {
  return (
    <main className="safe-px safe-pb mx-auto flex min-h-screen w-full max-w-md flex-col justify-between py-6">
      <section className="animate-slide-up">
        <div className="mb-5 inline-flex rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs uppercase tracking-[0.24em] text-black/60">
          PuQ.me
        </div>
        <h1 className="max-w-sm text-5xl font-semibold leading-[0.95] text-ink">
          Date locally. Match intentionally.
        </h1>
        <p className="mt-4 max-w-sm text-base leading-7 text-black/65">
          A mobile-first dating experience with curated swipes, instant chat and thoughtful safety controls.
        </p>
      </section>

      <Card className="animate-fade-in rounded-[2rem] p-5">
        <div className="grid gap-3">
          <Link className="rounded-2xl bg-ink px-4 py-4 text-center text-sm font-medium text-white" href="/onboarding">
            Start onboarding
          </Link>
          <Link className="rounded-2xl border border-black/10 px-4 py-4 text-center text-sm font-medium text-ink" href="/register">
            Create account
          </Link>
          <Link className="rounded-2xl border border-black/10 px-4 py-4 text-center text-sm font-medium text-ink" href="/login">
            I already have an account
          </Link>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3 text-xs text-black/55">
          <div className="rounded-2xl bg-white/80 p-3">Smooth swipe deck</div>
          <div className="rounded-2xl bg-white/80 p-3">Offline chat shell</div>
          <div className="rounded-2xl bg-white/80 p-3">Push-ready PWA</div>
        </div>
      </Card>
    </main>
  );
}
