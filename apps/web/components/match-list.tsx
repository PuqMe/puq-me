import { AppShell } from "@/components/app-shell";

const matches = [
  { name: "Maya", note: "Matched 12 min ago", accent: "bg-gradient-to-br from-mint to-[#558c82]" },
  { name: "Lina", note: "Sent you a wave", accent: "bg-gradient-to-br from-coral to-[#ff8f70]" },
  { name: "Noor", note: "Matched yesterday", accent: "bg-gradient-to-br from-[#2d2d2d] to-[#7d6e58]" }
];

export function MatchList() {
  return (
    <AppShell active="/matches" title="Matches" subtitle="People who liked you back">
      <section className="grid gap-3">
        {matches.map((match) => (
          <article key={match.name} className="glass-card flex items-center gap-4 rounded-[2rem] p-4">
            <div className={`h-16 w-16 rounded-[1.5rem] ${match.accent}`} />
            <div className="flex-1">
              <div className="text-base font-semibold text-ink">{match.name}</div>
              <div className="mt-1 text-sm text-black/55">{match.note}</div>
            </div>
            <button className="rounded-2xl bg-ink px-4 py-3 text-xs font-medium text-white">Chat</button>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
