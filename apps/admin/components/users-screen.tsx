import { FilterBar } from "./filter-bar";
import { DataTable } from "./data-table";
import { DetailPanel } from "./detail-panel";
import { ScreenHeader } from "./screen-header";
import { StatusPill } from "./status-pill";
import { ActionRow } from "./action-row";

const rows = [
  { user: "user_4812", status: "Suspended", risk: "83", city: "Berlin" },
  { user: "user_2201", status: "Active", risk: "42", city: "Paris" },
  { user: "user_8440", status: "Profile disabled", risk: "77", city: "Hamburg" }
];

export function UsersScreen() {
  return (
    <div className="space-y-6">
      <ScreenHeader
        eyebrow="Users"
        title="Manage account status and trust actions"
        description="Search users, inspect trust signals and apply account-level enforcement actions like suspend, unsuspend and profile disable."
      />

      <FilterBar
        searchPlaceholder="Search by user id, email or city"
        filters={[
          { label: "Account state", options: ["All states", "Active", "Suspended", "Profile disabled"] },
          { label: "Risk", options: ["All risk levels", "High", "Medium", "Low"] }
        ]}
      />

      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <DataTable
          columns={[
            { key: "user", header: "User", render: (row) => <span className="font-medium text-white">{row.user}</span> },
            { key: "city", header: "City", render: (row) => row.city },
            {
              key: "risk",
              header: "Risk score",
              render: (row) => <span className="font-semibold text-white">{row.risk}</span>
            },
            {
              key: "status",
              header: "Status",
              render: (row) => (
                <StatusPill tone={row.status === "Active" ? "success" : "danger"}>{row.status}</StatusPill>
              )
            }
          ]}
          rows={rows}
        />
        <DetailPanel title="user_4812" subtitle="User controls">
          <div className="grid gap-3 text-sm text-slate-400">
            <div className="flex justify-between">
              <span>Current status</span>
              <span className="text-white">Suspended</span>
            </div>
            <div className="flex justify-between">
              <span>Open reports</span>
              <span className="text-white">6</span>
            </div>
            <div className="flex justify-between">
              <span>Fraud score</span>
              <span className="text-white">83 / 100</span>
            </div>
          </div>
          <ActionRow primaryLabel="Unsuspend user" secondaryLabel="Disable profile" dangerLabel="Ban permanently" />
        </DetailPanel>
      </section>
    </div>
  );
}
