import { AppShell } from "@/components/app-shell";

const matches = [
  { name: "Maya", note: "Matched 12 min ago", accent: "bg-gradient-to-br from-[#7cb596] to-[#2f6b5f]" },
  { name: "Lina", note: "Sent you a wave", accent: "bg-gradient-to-br from-[#E6A77A] to-[#d3885f]" },
  { name: "Noor", note: "Matched yesterday", accent: "bg-gradient-to-br from-[#405047] to-[#8c7d64]" }
];

export function MatchList() {
  return (
    <AppShell active="/matches" title="Matches" subtitle="Menschen, bei denen es auf beiden Seiten gepasst hat">
      <section className="grid gap-3">
        {matches.map((match) => (
          <article key={match.name} className="glass-card flex items-center gap-4 rounded-[2rem] p-4">
            <div className={`h-16 w-16 rounded-[1.5rem] ${match.accent}`} />
            <div className="flex-1">
              <div className="text-base font-semibold text-white">{match.name}</div>
              <div className="mt-1 text-sm text-white/68">{match.note}</div>
            </div>
            <button className="glow-button rounded-[1rem] px-4 py-3 text-xs font-semibold text-white">Chat</button>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
