import { KpiGrid } from "./kpi-grid";
import { ScreenHeader } from "./screen-header";

const items = [
  { label: "Registrations", value: "9.1k", delta: "+8.2% day over day", tone: "positive" as const },
  { label: "Verification rate", value: "68%", delta: "+2.1% week over week", tone: "positive" as const },
  { label: "Match rate", value: "14.2%", delta: "-0.8% this week", tone: "warning" as const },
  { label: "Chat start rate", value: "41%", delta: "+3.3% after icebreakers", tone: "positive" as const }
];

export function KpiScreen() {
  return (
    <div className="space-y-6">
      <ScreenHeader
        eyebrow="KPIs"
        title="Core business and trust KPIs"
        description="Track registrations, moderation pressure, match performance and post-match conversation quality."
      />

      <KpiGrid items={items} />

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.04] p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Funnel snapshot</div>
          <div className="mt-5 space-y-4">
            {[
              ["Signup", "100%"],
              ["Verified", "68%"],
              ["Profile complete", "54%"],
              ["First swipe", "49%"],
              ["First match", "21%"],
              ["First chat", "9%"]
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-3xl border border-white/10 bg-[#091522] px-4 py-4">
                <span className="text-sm text-slate-300">{label}</span>
                <span className="text-sm font-semibold text-white">{value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.04] p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Moderation pressure</div>
          <div className="mt-5 grid gap-4">
            {[
              ["Profile reports / DAU", "0.12%"],
              ["Message reports / DAU", "0.19%"],
              ["Auto-moderated photos", "91%"],
              ["Average review time", "18 min"]
            ].map(([label, value]) => (
              <div key={label} className="rounded-3xl border border-white/10 bg-[#091522] px-4 py-4">
                <div className="text-sm text-slate-400">{label}</div>
                <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
