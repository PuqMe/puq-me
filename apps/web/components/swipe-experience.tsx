"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { SwipeCard, type SwipeCardData } from "@/components/swipe-card";
import { useAuth } from "@/lib/auth";
import { useLanguage } from "@/lib/i18n";
import { createSwipe, fetchRadarFeed, type RadarFeedItem } from "@/lib/social";

const gradients = [
  "bg-gradient-to-br from-[#8f4bd7] via-[#2b1144] to-[#111827]",
  "bg-gradient-to-br from-[#d97706] via-[#7c2d12] to-[#111827]",
  "bg-gradient-to-br from-[#0f766e] via-[#164e63] to-[#111827]",
  "bg-gradient-to-br from-[#be185d] via-[#4c1d95] to-[#111827]"
];

function toSwipeCard(item: RadarFeedItem, index: number, t: { unknown: string; bioMissing: string; qualityLabel: string; feedLabel: string }): SwipeCardData {
  return {
    id: item.userId,
    name: item.displayName,
    age: item.age,
    city: item.city ?? t.unknown,
    tagline: item.bio ?? t.bioMissing,
    distance: `${Math.round(item.distanceKm)} km`,
    gradient: gradients[index % gradients.length] ?? gradients[0]!,
    vibe: t.qualityLabel.replace("{score}", String(Math.round(item.profileQualityScore))),
    availability: t.feedLabel.replace("{score}", String(Math.round(item.feedScore)))
  };
}

export function SwipeExperience() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [items, setItems] = useState<RadarFeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);
  const isFallbackSession = user?.id.startsWith("fallback-") ?? false;

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const data = await fetchRadarFeed(12);
        if (!cancelled) {
          setItems(data.items);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error instanceof Error ? error.message : t.couldNotLoadNearby);
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

  const currentItem = items[0] ?? null;
  const nextItem = items[1] ?? null;
  const currentCard = useMemo(() => (currentItem ? toSwipeCard(currentItem, 0, t) : null), [currentItem, t]);
  const nextCard = useMemo(() => (nextItem ? toSwipeCard(nextItem, 1, t) : null), [nextItem, t]);

  async function handleSwipe(nextDirection: "left" | "right" | "super") {
    if (!currentItem || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setDirection(nextDirection === "super" ? "right" : nextDirection);

    try {
      const result = await createSwipe(currentItem.userId, nextDirection);
      setItems((current) => current.slice(1));
      setFeedback(
        result.isMatch
          ? t.matchFeedback.replace("{name}", currentItem.displayName)
          : nextDirection === "left"
            ? t.skippedFeedback.replace("{name}", currentItem.displayName)
            : t.likedFeedback.replace("{name}", currentItem.displayName)
      );
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t.couldNotSaveSwipe);
    } finally {
      window.setTimeout(() => setDirection(null), 220);
      setIsSubmitting(false);
    }
  }

  return (
    <AppShell active="/radar" title={t.nearby} subtitle={t.radarSubtitle}>
      <section className="grid gap-4">
        <div className="grid grid-cols-3 gap-2 text-[11px] font-medium">
          <div className="glass-card rounded-[1.2rem] px-3 py-3 text-white/82">
            {t.openCards.replace("{count}", String(items.length))}
          </div>
          <div className="glass-card rounded-[1.2rem] px-3 py-3 text-white/82">
            {isFallbackSession ? t.demoFeed : t.liveFeed}
          </div>
          <div className="glass-card rounded-[1.2rem] px-3 py-3 text-white/82">
            {isFallbackSession ? t.fallbackActive : t.apiActive}
          </div>
        </div>

        {isFallbackSession ? (
          <div className="glass-card rounded-[1.4rem] px-4 py-3 text-sm text-[#ffdca8]">
            {t.fallbackBanner}
          </div>
        ) : null}

        {errorMessage ? <div className="glass-card rounded-[1.4rem] px-4 py-3 text-sm text-[#ffb4c7]">{errorMessage}</div> : null}
        {feedback ? <div className="glass-card rounded-[1.4rem] px-4 py-3 text-sm text-[#b8ffd9]">{feedback}</div> : null}

        <div className="relative h-[31rem]">
          {isLoading ? (
            <div className="glass-card flex h-full items-center justify-center rounded-[2rem] text-sm text-white/72">
              {t.radarLoading}
            </div>
          ) : null}

          {!isLoading && !currentCard ? (
            <div className="glass-card flex h-full flex-col items-center justify-center rounded-[2rem] p-6 text-center">
              <div className="text-xl font-semibold text-white">{t.deckEmpty}</div>
              <p className="mt-3 max-w-xs text-sm leading-6 text-white/70">
                {t.deckEmptyDesc}
              </p>
            </div>
          ) : null}

          {nextCard ? <SwipeCard direction={null} offsetX={0} profile={nextCard} /> : null}
          {currentCard ? <SwipeCard direction={direction} offsetX={direction ? (direction === "right" ? 240 : -240) : 0} profile={currentCard} /> : null}
        </div>

        {currentItem ? (
          <div className="glass-card rounded-[1.8rem] p-4 text-white">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-lg font-semibold text-white">{currentItem.displayName}</div>
                <div className="mt-1 text-sm text-white/68">
                  {currentItem.city ?? t.unknown} · {Math.round(currentItem.distanceKm)} km
                </div>
              </div>
              <div className="soft-pill rounded-full px-3 py-1.5 text-[11px] font-semibold">
                {t.feedLabel.replace("{score}", String(Math.round(currentItem.feedScore)))}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-[11px] text-white/72">
              <div className="rounded-[1rem] bg-white/8 px-3 py-2">
                {t.qualityLabel.replace("{score}", String(Math.round(currentItem.profileQualityScore)))}
              </div>
              <div className="rounded-[1rem] bg-white/8 px-3 py-2">
                {t.activityLabel.replace("{score}", String(Math.round(currentItem.activityScore)))}
              </div>
              <div className="rounded-[1rem] bg-white/8 px-3 py-2">
                {t.responseLabel.replace("{score}", String(Math.round(currentItem.responseProbabilityScore)))}
              </div>
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-3 gap-3">
          <button className="glass-card rounded-[1.4rem] px-4 py-4 text-sm font-semibold text-white" disabled={!currentItem || isSubmitting} onClick={() => void handleSwipe("left")}>
            {t.skip}
          </button>
          <button className="glass-card rounded-[1.4rem] px-4 py-4 text-sm font-semibold text-white" disabled={!currentItem || isSubmitting} onClick={() => void handleSwipe("super")}>
            {t.super}
          </button>
          <button className="glow-button rounded-[1.4rem] px-4 py-4 text-sm font-semibold text-white" disabled={!currentItem || isSubmitting} onClick={() => void handleSwipe("right")}>
            {t.like}
          </button>
        </div>
      </section>
    </AppShell>
  );
}
