"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { BRAND_NAME } from "@puqme/config";
import { LogoMark } from "@puqme/ui";

const navItems = [
  { href: "/nearby", label: "Nearby", icon: "radar" },
  { href: "/circle", label: "Circle", icon: "circle" },
  { href: "/matches", label: "Matches", icon: "heart" },
  { href: "/chat", label: "Chat", icon: "chat" },
  { href: "/profile", label: "Profile", icon: "user" },
  { href: "/settings", label: "More", icon: "grid" }
];

function NavIcon({ type, size = 22 }: { type: string; size?: number }) {
  const s = size;
  const cls = `shrink-0`;

  if (type === "radar")
    return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={cls} stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><line x1="12" y1="12" x2="20" y2="5.5" strokeWidth="1.4"/></svg>;

  if (type === "heart")
    return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={cls} stroke="currentColor" strokeWidth="1.6"><path d="M12 20s-6.5-4.2-8.5-8A5 5 0 0 1 12 6a5 5 0 0 1 8.5 6C18.5 15.8 12 20 12 20Z"/></svg>;

  if (type === "chat")
    return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={cls} stroke="currentColor" strokeWidth="1.6"><path d="M5 6.5h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9l-4 3v-3H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z"/></svg>;

  if (type === "user")
    return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={cls} stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="8" r="4"/><path d="M5 20a7 7 0 0 1 14 0"/></svg>;

  if (type === "grid")
    return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={cls} stroke="currentColor" strokeWidth="1.6"><rect x="4" y="4" width="6" height="6" rx="1.5"/><rect x="14" y="4" width="6" height="6" rx="1.5"/><rect x="4" y="14" width="6" height="6" rx="1.5"/><rect x="14" y="14" width="6" height="6" rx="1.5"/></svg>;

  if (type === "circle")
    return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={cls} stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/></svg>;

  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={cls} stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="7"/></svg>;
}

export function AppShell({
  title,
  active,
  children
}: {
  title: string;
  subtitle?: string;
  active?: string;
  children: React.ReactNode;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navContent = navItems.map((item) => (
    <Link
      key={item.href}
      href={item.href}
      onClick={() => setIsMenuOpen(false)}
      className={clsx(
        "flex items-center gap-3 rounded-[1rem] px-3 py-2.5 text-sm font-medium transition",
        active === item.href ? "bg-white/10 text-white" : "text-white/55 hover:bg-white/6 hover:text-white"
      )}
    >
      <NavIcon type={item.icon} size={18} />
      <span>{item.label}</span>
    </Link>
  ));

  return (
    <div className="relative z-10">
      {/* Desktop sidebar + content */}
      <div className="grid gap-4 lg:grid-cols-[14rem_minmax(0,1fr)] lg:items-start lg:gap-5">
        {/* Desktop sidebar */}
        <aside className="glass-card hidden rounded-[1.5rem] p-3 lg:sticky lg:top-4 lg:block">
          <div className="mb-3 flex items-center gap-2 px-2 text-[10px] uppercase tracking-[0.22em] text-[#d7b8ff]">
            <LogoMark className="h-4 w-4 shrink-0" size={16} />
            {BRAND_NAME}
          </div>
          <div className="grid gap-0.5">{navContent}</div>
        </aside>

        <div className="flex flex-col">
          {/* Single-line compact header */}
          <header className="mb-3 flex h-10 items-center gap-2">
            <LogoMark className="h-4 w-4 shrink-0 text-[#d7b8ff] lg:hidden" size={16} />
            <h1 className="flex-1 text-base font-semibold text-white">{title}</h1>
            {/* Hamburger – mobile only */}
            <button
              type="button"
              onClick={() => setIsMenuOpen((c) => !c)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-white/70 hover:text-white lg:hidden"
              aria-expanded={isMenuOpen}
              aria-label="Navigation öffnen"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          </header>

          <div className="flex-1">{children}</div>
        </div>
      </div>

      {/* Mobile slide-in menu */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        >
          <div
            className="glass-card absolute right-3 top-3 w-52 rounded-[1.5rem] p-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2 flex items-center justify-between px-2">
              <span className="text-[10px] uppercase tracking-widest text-white/50">{BRAND_NAME}</span>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="text-white/50 hover:text-white"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="grid gap-0.5">{navContent}</div>
          </div>
        </div>
      )}

      {/* Bottom nav – icons only, no background */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-white/8 bg-[#08070f]/80 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl lg:hidden">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "flex flex-col items-center justify-center p-1.5 transition-all",
              active === item.href ? "text-[#a855f7]" : "text-white/35 hover:text-white/70"
            )}
          >
            <NavIcon type={item.icon} size={22} />
            {active === item.href && (
              <span className="mt-0.5 h-1 w-1 rounded-full bg-[#a855f7]" />
            )}
          </Link>
        ))}
      </nav>
    </div>
  );
}
