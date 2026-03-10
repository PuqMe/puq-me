import { FilterBar } from "./filter-bar";
import { DataTable } from "./data-table";
import { DetailPanel } from "./detail-panel";
import { ScreenHeader } from "./screen-header";
import { StatusPill } from "./status-pill";
import { ActionRow } from "./action-row";

const rows = [
  { thread: "C-8121", sender: "user_992", issue: "Payment request", status: "Blocked" },
  { thread: "C-8014", sender: "user_145", issue: "Spam link", status: "Review" },
  { thread: "C-7902", sender: "user_743", issue: "Harassment", status: "Review" }
];

export function MessageReviewScreen() {
  return (
    <div className="space-y-6">
      <ScreenHeader
        eyebrow="Messages"
        title="Review flagged conversations"
        description="Inspect reported message threads, confirm scam indicators and take action against unsafe conversations."
      />

      <FilterBar
        searchPlaceholder="Search by conversation id, sender or keyword"
        filters={[
          { label: "Status", options: ["All statuses", "Blocked", "Review", "Resolved"] },
          { label: "Type", options: ["All types", "Payment request", "Spam link", "Harassment"] }
        ]}
      />

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <DataTable
          columns={[
            { key: "thread", header: "Conversation", render: (row) => <span className="font-medium text-white">{row.thread}</span> },
            { key: "sender", header: "Sender", render: (row) => row.sender },
            { key: "issue", header: "Issue", render: (row) => row.issue },
            {
              key: "status",
              header: "Status",
              render: (row) => <StatusPill tone={row.status === "Blocked" ? "danger" : "warning"}>{row.status}</StatusPill>
            }
          ]}
          rows={rows}
        />
        <DetailPanel title="Conversation C-8121" subtitle="Thread evidence">
          <div className="space-y-3">
            <div className="rounded-3xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-50">
              “I need help urgently. Can you send money to my wallet?”
            </div>
            <div className="rounded-3xl border border-white/10 bg-[#091522] p-4 text-sm text-slate-300">
              The account sent similar phrasing to 11 conversations in the last 20 minutes.
            </div>
          </div>
          <ActionRow primaryLabel="Keep blocked" secondaryLabel="Mark false positive" dangerLabel="Suspend sender" />
        </DetailPanel>
      </section>
    </div>
  );
}
