import { Button } from "@puqme/ui";
import { KpiGrid } from "./kpi-grid";
import { ScreenHeader } from "./screen-header";
import { StatusPill } from "./status-pill";

const kpis = [
  { label: "Daily active users", value: "182.4k", delta: "+6.4% vs yesterday", tone: "positive" as const },
  { label: "Open reports", value: "184", delta: "-11 resolved in last hour", tone: "warning" as const },
  { label: "Flagged messages", value: "73", delta: "4 require escalation", tone: "danger" as const },
  { label: "New matches", value: "41.2k", delta: "+9.1% conversation lift", tone: "positive" as const }
];

const incidents = [
  { title: "Payment scam cluster", detail: "12 linked accounts detected in Berlin", tone: "danger" as const },
  { title: "Photo moderation backlog", detail: "29 images waiting manual review", tone: "warning" as const },
  { title: "Realtime delivery", detail: "WebSocket event queue nominal", tone: "success" as const }
];

export function DashboardOverview() {
  return (
    <div className="space-y-6">
      <ScreenHeader
        eyebrow="Overview"
        title="Marketplace and safety overview"
        description="Track risk pressure, moderation load and daily marketplace performance from one dashboard."
        actions={<Button className="bg-white/[0.05] text-white hover:opacity-100">Export snapshot</Button>}
      />

      <KpiGrid items={kpis} />

      <section className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.04] p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Live queue</div>
          <div className="mt-5 space-y-4">
            {incidents.map((incident) => (
              <div
                key={incident.title}
                className="flex items-start justify-between gap-4 rounded-3xl border border-white/10 bg-[#091522] px-4 py-4"
              >
                <div>
                  <div className="text-sm font-medium text-white">{incident.title}</div>
                  <div className="mt-1 text-sm text-slate-400">{incident.detail}</div>
                </div>
                <StatusPill
                  tone={
                    incident.tone === "success"
                      ? "success"
                      : incident.tone === "warning"
                        ? "warning"
                        : "danger"
                  }
                >
                  {incident.tone}
                </StatusPill>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.04] p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Today</div>
          <div className="mt-5 grid gap-4">
            {[
              ["Profile reports", "48"],
              ["Message reports", "91"],
              ["Users suspended", "17"],
              ["Profiles disabled", "12"]
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
