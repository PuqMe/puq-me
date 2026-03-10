"use client";

import { useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { SwipeCard, type SwipeCardData } from "@/components/swipe-card";

const profiles: SwipeCardData[] = [
  {
    id: "1",
    name: "Lina",
    age: 27,
    city: "Berlin",
    tagline: "Sunrise runs, brutal design opinions and dinner spots worth dressing up for.",
    distance: "3 km away",
    gradient: "bg-gradient-to-br from-coral via-[#ff8f70] to-amber"
  },
  {
    id: "2",
    name: "Maya",
    age: 29,
    city: "Hamburg",
    tagline: "Ceramic studio by day, jazz bars by night. Looking for curious people.",
    distance: "7 km away",
    gradient: "bg-gradient-to-br from-mint via-[#6ebea9] to-[#336d67]"
  },
  {
    id: "3",
    name: "Noor",
    age: 26,
    city: "Munich",
    tagline: "Product lead, espresso loyalist, museum detours on purpose.",
    distance: "11 km away",
    gradient: "bg-gradient-to-br from-[#1b1b1b] via-[#404040] to-[#82715a]"
  }
];

export function SwipeExperience() {
  const [deck, setDeck] = useState(profiles);
  const [offsetX, setOffsetX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);
  const dragOffsetRef = useRef(0);

  const current = deck[0];
  const next = deck[1];

  function applySwipe(nextDirection: "left" | "right") {
    setDirection(nextDirection);
    setOffsetX(nextDirection === "right" ? 420 : -420);
    dragOffsetRef.current = nextDirection === "right" ? 420 : -420;

    window.setTimeout(() => {
      setDeck((items) => items.slice(1));
      setOffsetX(0);
      setDirection(null);
      dragOffsetRef.current = 0;
    }, 220);
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    const startX = event.clientX;
    setDragging(true);

    function onMove(moveEvent: PointerEvent) {
      const delta = moveEvent.clientX - startX;
      setOffsetX(delta);
      dragOffsetRef.current = delta;
      setDirection(delta > 48 ? "right" : delta < -48 ? "left" : null);
    }

    function onUp() {
      setDragging(false);
      if (dragOffsetRef.current > 110) {
        applySwipe("right");
      } else if (dragOffsetRef.current < -110) {
        applySwipe("left");
      } else {
        setOffsetX(0);
        setDirection(null);
        dragOffsetRef.current = 0;
      }

      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp, { once: true });
  }

  return (
    <AppShell active="/swipe" title="Discover" subtitle="Profiles ranked for intent, chemistry and distance">
      <section className="grid gap-4">
        <div className="glass-card rounded-[2rem] p-4 text-sm text-black/60">
          Swipe right on profiles you want to meet. Your top cards are prioritized by relevance and activity.
        </div>

        <div
          className="relative h-[64vh] touch-none"
          onPointerDown={current ? onPointerDown : undefined}
          style={{ cursor: dragging ? "grabbing" : "grab" }}
        >
          {next ? (
            <div className="absolute inset-x-4 inset-y-3 scale-[0.96] opacity-70">
              <SwipeCard profile={next} offsetX={0} direction={null} />
            </div>
          ) : null}
          {current ? <SwipeCard profile={current} offsetX={offsetX} direction={direction} /> : null}
          {!current ? (
            <div className="glass-card flex h-full items-center justify-center rounded-[2rem] p-8 text-center text-black/60">
              No more profiles nearby right now.
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button className="rounded-2xl border border-black/10 bg-white px-4 py-4 text-sm font-medium text-ink" onClick={() => applySwipe("left")}>
            Pass
          </button>
          <button className="rounded-2xl bg-ink px-4 py-4 text-sm font-medium text-white" onClick={() => applySwipe("right")}>
            Like
          </button>
        </div>
      </section>
    </AppShell>
  );
}
