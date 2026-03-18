import { BRAND_NAME } from "@puqme/config";
import { LogoMark } from "@puqme/ui";
import { AdminLoginCard } from "@/components/admin-login-card";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,138,76,0.22),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(88,180,255,0.16),transparent_22%)]" />
      <div className="absolute inset-y-0 left-0 hidden w-1/2 border-r border-white/5 bg-white/[0.02] lg:block" />
      <section className="relative z-10 grid w-full max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-10 shadow-[0_40px_120px_rgba(0,0,0,0.45)] backdrop-blur lg:block">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
            <LogoMark className="h-6 w-6" size={24} />
            {BRAND_NAME} Operations
          </div>
          <h1 className="mt-8 max-w-lg text-5xl font-semibold tracking-tight text-white">
            Moderate trust, safety and marketplace health from one control room.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-slate-300">
            Review reports, lock risky accounts, inspect flagged conversations and monitor live KPIs
            without leaving the admin workspace.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4 text-sm">
            <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
              <div className="text-slate-400">Open reports</div>
              <div className="mt-2 text-3xl font-semibold">184</div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
              <div className="text-slate-400">High risk users</div>
              <div className="mt-2 text-3xl font-semibold">23</div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
              <div className="text-slate-400">Live incidents</div>
              <div className="mt-2 text-3xl font-semibold">4</div>
            </div>
          </div>
        </div>
        <AdminLoginCard />
      </section>
    </main>
  );
}
