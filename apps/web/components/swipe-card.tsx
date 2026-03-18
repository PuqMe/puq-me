import clsx from "clsx";

export type SwipeCardData = {
  id: string;
  name: string;
  age: number;
  city: string;
  tagline: string;
  distance: string;
  gradient: string;
  vibe: string;
  availability: string;
};

export function SwipeCard({
  profile,
  offsetX,
  direction
}: {
  profile: SwipeCardData;
  offsetX: number;
  direction: "left" | "right" | null;
}) {
  return (
    <article
      className="absolute inset-0 overflow-hidden rounded-[2rem] shadow-card"
      style={{
        transform: `translateX(${offsetX}px) rotate(${offsetX / 18}deg)`,
        transition: direction ? "transform 220ms ease-out" : undefined
      }}
    >
      <div className={clsx("flex h-full flex-col justify-between p-5 text-white", profile.gradient)}>
        <div className="flex justify-between gap-3">
          <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]">Nearby now</span>
          <span className="rounded-full bg-black/15 px-3 py-1 text-[11px] font-medium">{profile.distance}</span>
        </div>

        <div>
          <div className="max-w-[12rem] text-4xl font-semibold leading-none">
            {profile.name}, {profile.age}
          </div>
          <div className="mt-2 text-sm text-white/85">{profile.city}</div>
          <p className="mt-4 max-w-[16rem] text-sm leading-6 text-white/85">{profile.tagline}</p>
          <div className="mt-5 flex flex-wrap gap-2 text-[11px] font-medium">
            <span className="rounded-full bg-white/18 px-3 py-1.5">{profile.vibe}</span>
            <span className="rounded-full bg-white/18 px-3 py-1.5">{profile.availability}</span>
          </div>
        </div>
      </div>

      <div
        className={clsx(
          "absolute left-4 top-4 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] transition-opacity",
          direction === "right" ? "border-white bg-white text-[#2b1144] opacity-100" : "opacity-0"
        )}
      >
        Like
      </div>
      <div
        className={clsx(
          "absolute right-4 top-4 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] transition-opacity",
          direction === "left" ? "border-white bg-transparent text-white opacity-100" : "opacity-0"
        )}
      >
        Nope
      </div>
    </article>
  );
}
