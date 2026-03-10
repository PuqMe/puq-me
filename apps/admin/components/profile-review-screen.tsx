import { FilterBar } from "./filter-bar";
import { DataTable } from "./data-table";
import { DetailPanel } from "./detail-panel";
import { ScreenHeader } from "./screen-header";
import { StatusPill } from "./status-pill";
import { ActionRow } from "./action-row";

const rows = [
  { profile: "Ava, 29", issue: "Fake profile", city: "Berlin", state: "Pending review" },
  { profile: "Noah, 33", issue: "Duplicate photos", city: "Hamburg", state: "Escalated" },
  { profile: "Lina, 26", issue: "Underage concern", city: "Munich", state: "Pending review" }
];

export function ProfileReviewScreen() {
  return (
    <div className="space-y-6">
      <ScreenHeader
        eyebrow="Profiles"
        title="Review flagged profiles"
        description="Inspect reported identities, validate evidence and disable profiles before they damage marketplace trust."
      />

      <FilterBar
        searchPlaceholder="Search by user id, display name or city"
        filters={[
          { label: "Queue", options: ["All queues", "Pending review", "Escalated", "Closed"] },
          { label: "Signal", options: ["All signals", "Fake profile", "Duplicate photos", "Underage concern"] }
        ]}
      />

      <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <DataTable
          columns={[
            { key: "profile", header: "Profile", render: (row) => <span className="font-medium text-white">{row.profile}</span> },
            { key: "issue", header: "Issue", render: (row) => row.issue },
            { key: "city", header: "City", render: (row) => row.city },
            {
              key: "state",
              header: "State",
              render: (row) => <StatusPill tone={row.state === "Escalated" ? "danger" : "warning"}>{row.state}</StatusPill>
            }
          ]}
          rows={rows}
        />
        <DetailPanel title="Ava, 29" subtitle="Profile review">
          <div className="rounded-3xl border border-white/10 bg-[#091522] p-4 text-sm text-slate-300">
            Three reports mention stolen Instagram photos and inconsistent location claims. AI photo similarity score: 0.94.
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-3xl border border-white/10 bg-[#091522] p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Trust score</div>
              <div className="mt-2 text-2xl font-semibold text-white">21 / 100</div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-[#091522] p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Verification</div>
              <div className="mt-2 text-2xl font-semibold text-white">Missing</div>
            </div>
          </div>
          <ActionRow primaryLabel="Disable profile" secondaryLabel="Request verification" dangerLabel="Ban account" />
        </DetailPanel>
      </section>
    </div>
  );
}
