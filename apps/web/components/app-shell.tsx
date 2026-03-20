"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { BRAND_NAME } from "@puqme/config";
import { LogoMark } from "@puqme/ui";
import { useLanguage } from "@/lib/i18n";

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

/* ── Header icon buttons (matching Nearby/Circle) ── */
function SearchIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg>; }
function BellIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>; }
function MenuIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>; }

const headerBtnClass = "inline-flex h-8 w-8 items-center justify-center rounded-full text-white/60 hover:text-white transition";

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
  const [showNotifToast, setShowNotifToast] = useState(false);
  const { t } = useLanguage();

  const navItems = [
    { href: "/nearby",   label: t.nearby,   icon: "radar"  },
    { href: "/circle",   label: t.circle,   icon: "circle" },
    { href: "/matches",  label: t.matches,  icon: "heart"  },
    { href: "/chat",     label: t.chat,     icon: "chat"   },
    { href: "/profile",  label: t.profile,  icon: "user"   },
    { href: "/settings", label: t.more,     icon: "grid"   },
  ];

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
    <div className="relative z-10 min-h-screen" style={{ background: "#07050f" }}>
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
          {/* Header matching Nearby/Circle layout */}
          <header className="mb-3 flex items-center gap-2" style={{ paddingTop: "max(12px, env(safe-area-inset-top))" }}>
            <Link href="/" className="flex items-center gap-2 flex-1 no-underline lg:hidden">
              <LogoMark className="h-5 w-5 shrink-0 text-[#a855f7]" size={20} />
              <div style={{ lineHeight: 1 }}>
                <div className="text-sm font-bold text-white" style={{ letterSpacing: "-0.01em" }}>{BRAND_NAME}</div>
                <div className="text-[11px] text-white/50" style={{ marginTop: 2 }}>{title}</div>
              </div>
            </Link>
            {/* Desktop: just the title */}
            <h1 className="hidden lg:block flex-1 text-base font-semibold text-white">{title}</h1>

            {/* Right header icons – matching Nearby/Circle */}
            <div className="flex gap-0.5 lg:hidden">
              <Link href="/nearby" aria-label="Nearby" className={headerBtnClass}><NavIcon type="radar" size={18} /></Link>
              <Link href="/circle" aria-label="Circle" className={headerBtnClass}><NavIcon type="circle" size={18} /></Link>
              <button aria-label="Search" className={headerBtnClass}><SearchIcon /></button>
              <button aria-label="Notifications" onClick={() => { setShowNotifToast(true); setTimeout(() => setShowNotifToast(false), 2500); }} className={headerBtnClass}><BellIcon /></button>
              <button
                type="button"
                onClick={() => setIsMenuOpen((c) => !c)}
                className={headerBtnClass}
                aria-expanded={isMenuOpen}
                aria-label="Menu"
              >
                <MenuIcon />
              </button>
            </div>
          </header>

          {/* Notification toast */}
          {showNotifToast && (
            <div className="fixed top-16 left-1/2 z-[9999] -translate-x-1/2 rounded-2xl border border-white/12 bg-[#0c081c]/95 px-5 py-3 text-[13px] text-white/80 backdrop-blur-xl lg:hidden">
              {t.noNotifications}
            </div>
          )}

          <div className="flex-1">{children}</div>
        </div>
      </div>

      {/* Mobile slide-in menu – transparent, icons only at right edge */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        >
          <div
            className="absolute right-0 top-0 bottom-0 flex flex-col items-center justify-center gap-6"
            style={{ width: 44 }}
            onClick={(e) => e.stopPropagation()}
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={clsx(
                  "flex h-10 w-10 items-center justify-center rounded-full transition-all",
                  active === item.href
                    ? "text-[#a855f7] drop-shadow-[0_0_6px_rgba(168,85,247,0.7)]"
                    : "text-white/60 hover:text-white"
                )}
              >
                <NavIcon type={item.icon} size={24} />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-white/8 bg-[#08070f]/80 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl lg:hidden">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "flex flex-col items-center justify-center gap-0.5 p-1 transition-all",
              active === item.href ? "text-[#a855f7]" : "text-white/35 hover:text-white/70"
            )}
          >
            <NavIcon type={item.icon} size={20} />
            <span className="text-[9px] font-medium leading-none">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
