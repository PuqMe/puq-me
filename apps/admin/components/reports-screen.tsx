import { FilterBar } from "./filter-bar";
import { DataTable } from "./data-table";
import { DetailPanel } from "./detail-panel";
import { ScreenHeader } from "./screen-header";
import { StatusPill } from "./status-pill";
import { ActionRow } from "./action-row";

const reportRows = [
  { id: "R-1042", target: "Profile #4812", reason: "Scam", priority: "High", status: "Open", reporter: "user_881" },
  { id: "R-1038", target: "Message #9911", reason: "Harassment", priority: "Medium", status: "Reviewing", reporter: "user_124" },
  { id: "R-1027", target: "Profile #4123", reason: "Fake photos", priority: "High", status: "Open", reporter: "user_221" }
];

export function ReportsScreen() {
  return (
    <div className="space-y-6">
      <ScreenHeader
        eyebrow="Reports"
        title="Review incoming abuse reports"
        description="Search and filter user reports, then escalate, resolve or dismiss them with a clear audit trail."
      />

      <FilterBar
        searchPlaceholder="Search by report id, user or target"
        filters={[
          { label: "Status", options: ["All statuses", "Open", "Reviewing", "Resolved"] },
          { label: "Priority", options: ["All priorities", "High", "Medium", "Low"] }
        ]}
      />

      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <DataTable
          columns={[
            { key: "id", header: "Report", render: (row) => <span className="font-medium text-white">{row.id}</span> },
            { key: "target", header: "Target", render: (row) => row.target },
            { key: "reason", header: "Reason", render: (row) => row.reason },
            {
              key: "priority",
              header: "Priority",
              render: (row) => <StatusPill tone={row.priority === "High" ? "danger" : "warning"}>{row.priority}</StatusPill>
            },
            {
              key: "status",
              header: "Status",
              render: (row) => (
                <StatusPill tone={row.status === "Open" ? "warning" : "neutral"}>{row.status}</StatusPill>
              )
            }
          ]}
          rows={reportRows}
        />

        <DetailPanel title="R-1042" subtitle="Selected report">
          <div className="rounded-3xl border border-white/10 bg-[#091522] p-4 text-sm text-slate-300">
            Multiple users reported external payment requests and repeated Telegram redirects from Profile #4812.
          </div>
          <div className="grid gap-3 text-sm text-slate-400">
            <div className="flex justify-between">
              <span>Reported by</span>
              <span className="text-white">user_881</span>
            </div>
            <div className="flex justify-between">
              <span>Linked reports</span>
              <span className="text-white">6</span>
            </div>
            <div className="flex justify-between">
              <span>Risk score</span>
              <span className="text-white">83 / 100</span>
            </div>
          </div>
          <ActionRow primaryLabel="Escalate review" secondaryLabel="Dismiss" dangerLabel="Suspend user" />
        </DetailPanel>
      </section>
    </div>
  );
}
