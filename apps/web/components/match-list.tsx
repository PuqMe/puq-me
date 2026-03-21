"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { fetchMatches, type MatchItem } from "@/lib/social";
import { useLanguage } from "@/lib/i18n";

const accents = [
  "bg-gradient-to-br from-[#7cb596] to-[#2f6b5f]",
  "bg-gradient-to-br from-[#E6A77A] to-[#d3885f]",
  "bg-gradient-to-br from-[#405047] to-[#8c7d64]",
  "bg-gradient-to-br from-[#8b5cf6] to-[#4338ca]"
];

export function MatchList() {
  const { t } = useLanguage();
  const [items, setItems] = useState<MatchItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const matches = await fetchMatches();
        if (!cancelled) {
          setItems(matches);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error instanceof Error ? error.message : t.couldNotLoadMatches);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppShell active="/matches" title={t.matchesTitle} subtitle={t.matchesSubtitle}>
      <section className="grid gap-3">
        {isLoading ? <div className="glass-card rounded-[1.8rem] p-4 text-sm text-white/72">{t.matchesLoading}</div> : null}
        {errorMessage ? <div className="glass-card rounded-[1.8rem] p-4 text-sm text-[#ffb4c7]">{errorMessage}</div> : null}

        {!isLoading && !errorMessage && items.length === 0 ? (
          <div className="glass-card rounded-[1.8rem] p-8 text-center">
            <div style={{ fontSize: "48px", marginBottom: "16px", opacity: 0.6 }}>💜</div>
            <div className="text-base font-semibold text-white/80" style={{ marginBottom: "8px" }}>
              {t.matchesTitle}
            </div>
            <div className="text-sm leading-6 text-white/56">
              {t.matchesEmpty}
            </div>
          </div>
        ) : null}

        {items.map((match, index) => (
          <article key={match.matchId} className="glass-card flex items-center gap-4 rounded-[2rem] p-4">
            <div className={`h-16 w-16 rounded-[1.5rem] ${accents[index % accents.length] ?? accents[0]!}`} />
            <div className="flex-1">
              <div className="text-base font-semibold text-white">
                {match.peer.displayName}, {match.peer.age}
              </div>
              <div className="mt-1 text-sm text-white/68">
                {match.peer.city ?? t.unknown} · {new Date(match.matchedAt).toLocaleDateString()}
              </div>
              <div className="mt-1 text-sm text-white/58">{match.peer.bio ?? t.bioMissing}</div>
            </div>
            <Link className="glow-button rounded-[1rem] px-4 py-3 text-xs font-semibold text-white" href={match.conversation.conversationId ? `/chat?conversationId=${match.conversation.conversationId}` : "/chat"}>
              {t.chat}
            </Link>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
