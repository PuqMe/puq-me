"use client";

/* PuQ.me — UI primitives that all 83 mockup screens share. */

import { ReactNode } from "react";
import clsx from "clsx";

/* ──────────────── BUTTONS ──────────────── */

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  color?: "pink" | "mint" | "lemon" | "danger" | "cyan";
};
export function PrimaryBtn({ children, className, color = "pink", ...rest }: BtnProps) {
  const map = {
    pink: "bg-puq-pink text-white shadow-puq-glow",
    mint: "bg-puq-mint text-puq-deep",
    lemon: "bg-puq-lemon text-[#3a2400]",
    danger: "bg-puq-danger text-white",
    cyan: "bg-[#5BC8FF] text-puq-deep",
  } as const;
  return (
    <button
      type={rest.type ?? "button"}
      {...rest}
      className={clsx(
        "w-full rounded-full px-7 py-4 text-[15px] font-semibold tracking-tight transition active:scale-[0.98] disabled:opacity-60",
        map[color],
        className
      )}
    >
      {children}
    </button>
  );
}

export function GhostBtn({ children, className, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={rest.type ?? "button"}
      {...rest}
      className={clsx(
        "w-full rounded-full border border-puq-line-2 bg-transparent px-7 py-4 text-[14px] font-semibold text-puq-text/90 transition hover:bg-white/5 disabled:opacity-60",
        className
      )}
    >
      {children}
    </button>
  );
}

export function TextBtn({
  children,
  color = "pink",
  className,
}: {
  children: ReactNode;
  color?: "pink" | "mint" | "lemon" | "muted";
  className?: string;
}) {
  const map = { pink: "text-puq-pink", mint: "text-puq-mint", lemon: "text-puq-lemon", muted: "text-puq-muted" };
  return <button className={clsx("text-sm font-semibold", map[color], className)}>{children}</button>;
}

/* ──────────────── HEADERS / NAV ──────────────── */

export function ScreenHeader({
  title,
  subtitle,
  back = true,
  trailing,
  centered = false,
}: {
  title?: string;
  subtitle?: string;
  back?: boolean;
  trailing?: ReactNode;
  centered?: boolean;
}) {
  return (
    <div className="relative z-10 flex items-center justify-between px-5 pt-2 pb-3">
      <div className="flex w-8 items-center">
        {back ? (
          <button className="flex h-7 w-7 items-center justify-center text-puq-pink">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-5 w-5">
              <path d="M14 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ) : null}
      </div>
      <div className={clsx("flex-1 px-2", centered && "text-center")}>
        {title ? <div className="text-[15px] font-semibold">{title}</div> : null}
        {subtitle ? <div className="mt-0.5 text-[11px] tracking-wider text-puq-muted">{subtitle}</div> : null}
      </div>
      <div className="flex w-8 items-center justify-end">{trailing}</div>
    </div>
  );
}

export function PageTitle({
  pre,
  text,
  italic,
  className,
}: {
  pre?: string;
  text?: string;
  italic?: string;
  className?: string;
}) {
  return (
    <div className={clsx("px-5", className)}>
      {pre ? (
        <div className="mb-2 text-[11px] font-bold tracking-[0.18em] text-puq-mint">{pre}</div>
      ) : null}
      <h1 className="text-[34px] font-bold leading-[1.05] tracking-tight">
        {text}
        {italic ? <em className="block bg-gradient-to-r from-puq-pink to-puq-pink-2 bg-clip-text font-serif italic text-transparent">{italic}</em> : null}
      </h1>
    </div>
  );
}

/* ──────────────── PROGRESS ──────────────── */

export function Dots({ total, active, color = "pink" }: { total: number; active: number; color?: "pink" | "mint" }) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={clsx(
            "h-2 rounded-full transition-all",
            i === active
              ? color === "pink"
                ? "w-6 bg-puq-pink"
                : "w-6 bg-puq-mint"
              : i < active
              ? "w-2 bg-puq-pink/70"
              : "w-2 bg-white/15"
          )}
        />
      ))}
    </div>
  );
}

export function StepBar({ value, total }: { value: number; total: number }) {
  return (
    <div className="px-5">
      <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-puq-pink to-puq-indigo-2 transition-all"
          style={{ width: `${(value / total) * 100}%` }}
        />
      </div>
      <div className="mt-1.5 text-xs text-puq-muted">Schritt {value} von {total}</div>
    </div>
  );
}

/* ──────────────── CARDS / OPTIONS ──────────────── */

export function Card({
  children,
  className,
  variant = "default",
}: {
  children: ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "danger" | "warning" | "success";
}) {
  const map = {
    default: "bg-puq-card border-puq-line-2/60",
    elevated: "bg-puq-card-2 border-puq-line-2",
    danger: "bg-puq-danger/10 border-puq-danger/40",
    warning: "bg-puq-lemon/8 border-puq-lemon/40",
    success: "bg-puq-mint/8 border-puq-mint/40",
  } as const;
  return <div className={clsx("rounded-2xl border p-4", map[variant], className)}>{children}</div>;
}

export function OptionRow({
  icon,
  title,
  subtitle,
  selected,
  selectColor = "pink",
  trailing,
  onClick,
}: {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  selected?: boolean;
  selectColor?: "pink" | "mint" | "lemon" | "indigo";
  trailing?: ReactNode;
  onClick?: () => void;
}) {
  const ring = {
    pink: "border-puq-pink",
    mint: "border-puq-mint",
    lemon: "border-puq-lemon",
    indigo: "border-puq-indigo-2",
  }[selectColor];
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex w-full items-center gap-3 rounded-2xl border bg-puq-card/80 px-4 py-3.5 text-left transition",
        selected ? `${ring} bg-puq-card` : "border-puq-line-2/40"
      )}
    >
      {icon ? <div className="grid h-10 w-10 place-items-center rounded-xl bg-puq-card-2">{icon}</div> : null}
      <div className="flex-1">
        <div className="text-[15px] font-semibold leading-tight">{title}</div>
        {subtitle ? <div className="mt-0.5 text-[12px] text-puq-muted">{subtitle}</div> : null}
      </div>
      {trailing ?? (selected ? <SelectDot color={selectColor} /> : <RadioRing />)}
    </button>
  );
}

export function SelectDot({ color = "pink" }: { color?: "pink" | "mint" | "lemon" | "indigo" }) {
  const map = { pink: "bg-puq-pink", mint: "bg-puq-mint", lemon: "bg-puq-lemon", indigo: "bg-puq-indigo-2" };
  return (
    <div className={clsx("grid h-6 w-6 place-items-center rounded-full text-puq-deep", map[color])}>
      <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3" fill="none" className="h-3.5 w-3.5">
        <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
export function RadioRing() {
  return <div className="h-6 w-6 rounded-full border-2 border-puq-line-2/70" />;
}

/* ──────────────── PILLS / BADGES ──────────────── */

export function Pill({
  children,
  variant = "default",
  className,
}: {
  children: ReactNode;
  variant?: "default" | "active" | "pink" | "mint" | "lemon" | "indigo" | "outline" | "danger";
  className?: string;
}) {
  const map = {
    default: "bg-puq-card text-puq-text border border-puq-line-2/40",
    active: "bg-puq-pink text-white",
    pink: "bg-puq-pink/15 text-puq-pink-2 border border-puq-pink/40",
    mint: "bg-puq-mint/15 text-puq-mint border border-puq-mint/40",
    lemon: "bg-puq-lemon/15 text-puq-lemon border border-puq-lemon/40",
    indigo: "bg-puq-indigo/30 text-puq-muted border border-puq-indigo-2/50",
    outline: "border border-puq-line-2/60 text-puq-muted",
    danger: "bg-puq-danger/15 text-puq-danger border border-puq-danger/40",
  } as const;
  return (
    <span className={clsx("inline-flex items-center rounded-full px-3 py-1 text-[12px] font-semibold", map[variant], className)}>
      {children}
    </span>
  );
}

export function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-puq-mint/50 bg-puq-mint/15 px-2.5 py-0.5 text-[11px] font-semibold text-puq-mint">
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3">
        <path d="M12 1l3 3 4-1 1 4 3 3-3 3 1 4-4-1-3 3-3-3-4 1 1-4-3-3 3-3-1-4 4 1 3-3z" />
        <path d="M9 12l2 2 4-4" stroke="#06101A" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Verifiziert
    </span>
  );
}

export function OnlinePill() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-puq-mint/15 px-2.5 py-0.5 text-[11px] font-semibold text-puq-mint">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-puq-mint opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-puq-mint" />
      </span>
      Online
    </span>
  );
}

export function RepeatBadge({ n = 3 }: { n?: number }) {
  return (
    <span className="inline-flex items-center rounded-full bg-puq-lemon px-2.5 py-0.5 text-[11px] font-bold text-[#3a2400]">
      {n}× wiederholt
    </span>
  );
}

/* ──────────────── INPUTS ──────────────── */

export function Field({
  label,
  children,
  hint,
}: {
  label?: string;
  children: ReactNode;
  hint?: ReactNode;
}) {
  return (
    <label className="block">
      {label ? (
        <div className="mb-1.5 text-[10.5px] font-bold tracking-[0.2em] text-puq-muted">{label}</div>
      ) : null}
      {children}
      {hint ? <div className="mt-1.5 text-xs text-puq-faint">{hint}</div> : null}
    </label>
  );
}
export function Input({
  value,
  placeholder,
  type = "text",
  trailing,
  className,
}: {
  value?: string;
  placeholder?: string;
  type?: string;
  trailing?: ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx("flex items-center gap-2 rounded-2xl border border-puq-line-2 bg-puq-card px-4 py-3.5", className)}>
      <input
        type={type}
        defaultValue={value}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-[15px] font-medium text-puq-text outline-none placeholder:text-puq-faint"
      />
      {trailing}
    </div>
  );
}

export function Toggle({ on, color = "pink" }: { on?: boolean; color?: "pink" | "mint" | "lemon" }) {
  const map = { pink: "bg-puq-pink", mint: "bg-puq-mint", lemon: "bg-puq-lemon" };
  return (
    <span
      className={clsx(
        "relative inline-flex h-7 w-12 items-center rounded-full transition-colors",
        on ? map[color] : "bg-puq-card-2"
      )}
    >
      <span
        className={clsx(
          "absolute h-5 w-5 rounded-full bg-white shadow transition-transform",
          on ? "translate-x-6" : "translate-x-1"
        )}
      />
    </span>
  );
}

/* ──────────────── AVATARS ──────────────── */

export function Avatar({
  initials,
  color = "pink",
  size = 48,
  ring,
  online,
}: {
  initials: string;
  color?: "pink" | "mint" | "lemon" | "indigo" | "blue" | "violet" | "tangerine" | "rose";
  size?: number;
  ring?: "pink" | "mint" | "lemon" | "indigo" | "violet";
  online?: boolean;
}) {
  const bg: Record<string, string> = {
    pink: "linear-gradient(135deg,#FF3D7F,#FF6B9D)",
    mint: "linear-gradient(135deg,#00D9A6,#7DF9C4)",
    lemon: "linear-gradient(135deg,#F59E0B,#FCD34D)",
    indigo: "linear-gradient(135deg,#1A3A8C,#2D5BC8)",
    blue: "linear-gradient(135deg,#2D5BC8,#5BC8FF)",
    violet: "linear-gradient(135deg,#7C3AED,#C026D3)",
    tangerine: "linear-gradient(135deg,#F59E0B,#FF6B9D)",
    rose: "linear-gradient(135deg,#FF6B9D,#FCD34D)",
  };
  const ringMap: Record<string, string> = {
    pink: "ring-puq-pink",
    mint: "ring-puq-mint",
    lemon: "ring-puq-lemon",
    indigo: "ring-puq-indigo-2",
    violet: "ring-[#7C3AED]",
  };
  return (
    <div className="relative inline-flex" style={{ width: size, height: size }}>
      <div
        className={clsx(
          "flex h-full w-full items-center justify-center rounded-full font-bold text-white",
          ring ? `ring-[2.5px] ring-offset-2 ring-offset-puq-deep ${ringMap[ring]}` : ""
        )}
        style={{ background: bg[color], fontSize: size * 0.36 }}
      >
        {initials}
      </div>
      {online ? (
        <span className="absolute -right-0.5 -bottom-0.5 h-3.5 w-3.5 rounded-full border-2 border-puq-deep bg-puq-mint" />
      ) : null}
    </div>
  );
}

/* ──────────────── INTEREST PILLS GROUP ──────────────── */

export function InterestPills({
  items,
  selected = [],
  variant = "pink",
}: {
  items: string[];
  selected?: string[];
  variant?: "pink" | "mint" | "mix";
}) {
  const isOn = (i: string) => selected.includes(i);
  const onClass = variant === "mint" ? "bg-puq-mint text-puq-deep" : "bg-puq-pink text-white";
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((i) => (
        <span
          key={i}
          className={clsx(
            "rounded-full border px-3.5 py-1.5 text-[13px] font-semibold",
            isOn(i)
              ? `${onClass} border-transparent`
              : "border-puq-line-2/70 text-puq-muted"
          )}
        >
          {i}
        </span>
      ))}
    </div>
  );
}

/* ──────────────── MISC ──────────────── */

export function SectionLabel({
  children,
  color = "muted",
  className,
}: {
  children: ReactNode;
  color?: "mint" | "pink" | "lemon" | "muted" | "indigo";
  className?: string;
}) {
  const map = { mint: "text-puq-mint", pink: "text-puq-pink", lemon: "text-puq-lemon", muted: "text-puq-muted", indigo: "text-puq-indigo-2" };
  return <div className={clsx("text-[10.5px] font-bold tracking-[0.2em] uppercase", map[color], className)}>{children}</div>;
}

export function Divider({ children }: { children?: ReactNode }) {
  return (
    <div className="my-3 flex items-center gap-3 text-xs text-puq-muted">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-puq-indigo-2 to-puq-indigo-2/40" />
      {children}
      <div className="h-px flex-1 bg-gradient-to-r from-puq-indigo-2/40 via-puq-indigo-2 to-transparent" />
    </div>
  );
}

export function FootBar({ children }: { children: ReactNode }) {
  return <div className="absolute inset-x-0 bottom-0 z-30 px-5 pb-6 pt-3">{children}</div>;
}

export function ModalSheet({ children, ringColor = "pink" }: { children: ReactNode; ringColor?: "pink" | "mint" | "lemon" }) {
  const map = { pink: "border-puq-pink/70", mint: "border-puq-mint/70", lemon: "border-puq-lemon/70" };
  return (
    <div className={clsx("mx-4 rounded-3xl border-2 bg-puq-deep/95 p-5 shadow-puq-glow", map[ringColor])}>
      {children}
    </div>
  );
}
