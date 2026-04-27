"use client";

import { ReactNode } from "react";
import clsx from "clsx";

/* ──────────────────────────────────────────────────────────────────────── */
/*  Phone-Frame — alle 83 Mockups laufen darin.                              */
/* ──────────────────────────────────────────────────────────────────────── */

export function PhoneFrame({
  children,
  className,
  label,
}: {
  children: ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <div className={clsx("flex flex-col items-center gap-3", className)}>
      {label ? (
        <div className="text-xs uppercase tracking-[0.18em] text-puq-faint">
          {label}
        </div>
      ) : null}
      <div className="relative h-[844px] w-[390px] shrink-0 rounded-[54px] bg-[#0a0414] p-[6px] shadow-[0_40px_80px_-30px_rgba(255,61,127,0.35),0_60px_120px_-40px_rgba(0,0,0,0.6)]">
        <div className="relative h-full w-full overflow-hidden rounded-[48px] bg-puq-deep">
          {/* notch */}
          <div className="absolute left-1/2 top-2 z-50 h-7 w-32 -translate-x-1/2 rounded-full bg-black" />
          {children}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────── */
/*  Status-Bar (9:41, signal, wifi, battery)                                 */
/* ──────────────────────────────────────────────────────────────────────── */

export function StatusBar({ time = "9:41", dim = false }: { time?: string; dim?: boolean }) {
  return (
    <div
      className={clsx(
        "relative z-10 flex h-11 items-center justify-between px-7 pt-3 text-[15px] font-semibold",
        dim ? "text-puq-muted/70" : "text-white"
      )}
    >
      <span>{time}</span>
      <div className="flex items-center gap-1.5">
        {/* signal */}
        <svg viewBox="0 0 18 12" className="h-3 w-4 fill-current">
          <rect x="0" y="8" width="3" height="4" rx="0.5" />
          <rect x="5" y="5" width="3" height="7" rx="0.5" />
          <rect x="10" y="2" width="3" height="10" rx="0.5" />
          <rect x="15" y="0" width="3" height="12" rx="0.5" />
        </svg>
        {/* wifi */}
        <svg viewBox="0 0 18 13" className="h-3 w-4 fill-current">
          <path d="M9 13 L11 11 A3 3 0 0 0 7 11 Z" />
          <path d="M9 8 L13 4 A6 6 0 0 0 5 4 L9 8" opacity="0.5" />
          <path d="M9 4 L15 -2 A9 9 0 0 0 3 -2 L9 4" opacity="0.3" />
        </svg>
        {/* battery */}
        <svg viewBox="0 0 26 12" className="h-3 w-7 stroke-current">
          <rect x="0.5" y="0.5" width="22" height="11" rx="2.5" fill="none" strokeWidth="1" />
          <rect x="2" y="2" width="18" height="8" rx="1" className="fill-current" />
          <rect x="23" y="4" width="2" height="4" rx="0.5" className="fill-current" />
        </svg>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────── */
/*  Bottom-Nav — Begegnung / Entdecken / Center-FAB / Chat / Profil           */
/* ──────────────────────────────────────────────────────────────────────── */

export type NavTab = "begegnung" | "entdecken" | "chat" | "profil" | "radar" | "likes";

export function BottomNav({
  active = "begegnung",
  variant = "main",
}: {
  active?: NavTab;
  variant?: "main" | "matches";
}) {
  const tabs: { key: NavTab; label: string; icon: ReactNode }[] = variant === "matches"
    ? [
        { key: "radar", label: "Radar", icon: <RadarIcon /> },
        { key: "likes", label: "Likes", icon: <HeartIcon /> },
        { key: "chat", label: "Chat", icon: <ChatIcon /> },
        { key: "profil", label: "Profil", icon: <UserIcon /> },
      ]
    : [
        { key: "begegnung", label: "Begegnung", icon: <CircleIcon /> },
        { key: "entdecken", label: "Entdecken", icon: <CardsIcon /> },
        { key: "chat", label: "Chat", icon: <ChatIcon /> },
        { key: "profil", label: "Profil", icon: <UserIcon /> },
      ];

  return (
    <div className="absolute inset-x-0 bottom-0 z-40 px-3 pb-2 pt-1.5">
      <div className="relative flex items-end justify-between rounded-3xl bg-puq-night/90 px-3 pb-2 pt-2 backdrop-blur-md">
        {tabs.slice(0, Math.ceil(tabs.length / 2)).map((t) => (
          <NavTabBtn key={t.key} label={t.label} icon={t.icon} active={active === t.key} />
        ))}
        {/* Center FAB */}
        <div className="relative -top-4 flex h-14 w-14 items-center justify-center rounded-full bg-puq-pink shadow-puq-glow">
          <span className="text-2xl">🥺</span>
        </div>
        {tabs.slice(Math.ceil(tabs.length / 2)).map((t) => (
          <NavTabBtn key={t.key} label={t.label} icon={t.icon} active={active === t.key} />
        ))}
      </div>
      <div className="mx-auto mt-1.5 h-1.5 w-32 rounded-full bg-white/40" />
    </div>
  );
}

function NavTabBtn({
  label,
  icon,
  active,
}: {
  label: string;
  icon: ReactNode;
  active?: boolean;
}) {
  return (
    <button
      className={clsx(
        "flex w-16 flex-col items-center gap-0.5 py-1 text-[10.5px]",
        active ? "text-puq-pink" : "text-puq-muted/70"
      )}
    >
      <span className="h-5 w-5">{icon}</span>
      <span>{label}</span>
      {active ? <span className="h-0.5 w-4 rounded-full bg-puq-pink" /> : null}
    </button>
  );
}

/* ──────────────────────────────────────────────────────────────────────── */
/*  Generic Screen container                                                  */
/* ──────────────────────────────────────────────────────────────────────── */

export function Screen({
  children,
  bg = "aurora",
  className,
}: {
  children: ReactNode;
  bg?: "aurora" | "deep" | "none";
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "relative flex h-full w-full flex-col text-puq-text",
        bg === "aurora" && "bg-puq-aurora",
        bg === "deep" && "bg-puq-deep",
        className
      )}
    >
      <Stars />
      {children}
    </div>
  );
}

/* Star-field decoration — used across the brand */
export function Stars() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {([
        [12, 22, 0.3, 1.4], [80, 18, 0.5, 1.0], [40, 60, 0.6, 0.9],
        [70, 80, 0.4, 1.5], [25, 75, 0.8, 0.7], [55, 30, 0.4, 1.1],
        [88, 55, 0.6, 1.3], [10, 90, 0.5, 0.9], [62, 12, 0.7, 1.2],
        [33, 45, 0.5, 0.8], [50, 95, 0.6, 1.0], [92, 35, 0.4, 1.1],
        [18, 50, 0.5, 0.9], [73, 65, 0.7, 1.2], [45, 88, 0.5, 1.0],
      ] as const).map((p, i) => {
        const [x, y, op, sz] = p;
        return (
          <span
            key={i}
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: `${sz}px`,
              height: `${sz}px`,
              opacity: op,
            }}
            className="absolute animate-puq-twinkle rounded-full bg-white"
          />
        );
      })}
      {/* Aurora glow */}
      <div className="absolute -right-24 top-0 h-[55%] w-[70%] rounded-full bg-puq-pink/20 blur-3xl" />
      <div className="absolute -left-24 bottom-0 h-[50%] w-[60%] rounded-full bg-puq-indigo/20 blur-3xl" />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────── */
/*  Lock-Bar (home-indicator)                                                 */
/* ──────────────────────────────────────────────────────────────────────── */

export function HomeBar() {
  return (
    <div className="absolute inset-x-0 bottom-0 z-50 flex h-2 items-end justify-center pb-1.5">
      <div className="h-1.5 w-32 rounded-full bg-white/50" />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────── */
/*  Brand Mark                                                                 */
/* ──────────────────────────────────────────────────────────────────────── */

export function PuqMark({
  size = 32,
  pulse = false,
}: {
  size?: number;
  pulse?: boolean;
}) {
  return (
    <div
      className={clsx("relative inline-flex items-center justify-center", pulse && "animate-puq-pulse rounded-full")}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 36 24" className="h-full w-full">
        <circle cx="13" cy="12" r="10" fill="none" stroke="#FF3D7F" strokeWidth="1.6" />
        <circle cx="23" cy="12" r="10" fill="none" stroke="#FF3D7F" strokeWidth="1.6" />
      </svg>
    </div>
  );
}

export function PuqWordmark({
  size = "lg",
}: {
  size?: "sm" | "md" | "lg";
}) {
  const map = { sm: "text-base", md: "text-lg", lg: "text-2xl" };
  return (
    <div className="flex items-center gap-2">
      <PuqMark size={size === "sm" ? 18 : size === "md" ? 24 : 32} />
      <span className={clsx("font-semibold tracking-tight", map[size])}>PuQ.me</span>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────── */
/*  Icons (inline SVGs to keep the bundle small)                              */
/* ──────────────────────────────────────────────────────────────────────── */

export function CircleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-full w-full">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3.5" fill="currentColor" />
    </svg>
  );
}
export function CardsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-full w-full">
      <rect x="6" y="3" width="12" height="18" rx="3" />
      <rect x="9" y="6" width="6" height="3" rx="1" />
    </svg>
  );
}
export function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-full w-full">
      <path d="M4 6h16v10H8l-4 4V6z" />
    </svg>
  );
}
export function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-full w-full">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1-5 5-7 8-7s7 2 8 7" />
    </svg>
  );
}
export function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
      <path d="M12 21s-7-4.35-9.5-9.5C0.5 7.5 3.5 4 7 4c2 0 3.5 1 5 3 1.5-2 3-3 5-3 3.5 0 6.5 3.5 4.5 7.5C19 16.65 12 21 12 21z" />
    </svg>
  );
}
export function RadarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-full w-full">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}
export function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-full w-full">
      <path d="M6 16h12l-1.5-2.5V10a4.5 4.5 0 0 0-9 0v3.5L6 16z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </svg>
  );
}
export function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-full w-full">
      <path d="M5 7h14M5 12h14M5 17h14" strokeLinecap="round" />
    </svg>
  );
}
export function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-full w-full">
      <path d="M14 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
export function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className={clsx("h-full w-full", className)}>
      <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
export function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-full w-full">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}
export function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
      <path d="M12 2c-3.5 0-6 2.7-6 6 0 4.5 6 13 6 13s6-8.5 6-13c0-3.3-2.5-6-6-6zm0 8a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
    </svg>
  );
}
export function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-full w-full">
      <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />
    </svg>
  );
}
export function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
      <rect x="9" y="3" width="6" height="12" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </svg>
  );
}
export function PlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={clsx("h-full w-full", className)}>
      <path d="M7 4l13 8-13 8z" />
    </svg>
  );
}
export function PauseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={clsx("h-full w-full", className)}>
      <rect x="6" y="4" width="5" height="16" rx="1" />
      <rect x="13" y="4" width="5" height="16" rx="1" />
    </svg>
  );
}
export function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-full w-full">
      <path d="M6 6l12 12M18 6l-12 12" strokeLinecap="round" />
    </svg>
  );
}
export function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
      <path d="M5 4l3-1 2 4-2 1a12 12 0 0 0 8 8l1-2 4 2-1 3a2 2 0 0 1-2 2A18 18 0 0 1 3 6a2 2 0 0 1 2-2z" />
    </svg>
  );
}
export function StarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={clsx("h-full w-full", className)}>
      <path d="M12 2l3 7h7l-5.5 4.5 2 7-6.5-4.5-6.5 4.5 2-7L2 9h7l3-7z" />
    </svg>
  );
}
