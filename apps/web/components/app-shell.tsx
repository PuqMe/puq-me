import Link from "next/link";
import clsx from "clsx";
import { BRAND_NAME } from "@puqme/config";
import { LogoMark } from "@puqme/ui";

const navItems = [
  { href: "/discover", label: "Radar", icon: "radar" },
  { href: "/circle", label: "Circle", icon: "circle" },
  { href: "/matches", label: "Matches", icon: "heart" },
  { href: "/chat", label: "Chat", icon: "chat" },
  { href: "/profile", label: "Profile", icon: "user" },
  { href: "/settings", label: "More", icon: "grid" }
];

function NavIcon({ type }: { type: string }) {
  const iconClass = "h-[18px] w-[18px] stroke-[#A855F7]";

  if (type === "heart") {
    return (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24">
        <path d="M12 20s-6.5-4.2-8.5-8A5 5 0 0 1 12 6a5 5 0 0 1 8.5 6C18.5 15.8 12 20 12 20Z" strokeWidth="1.8" />
      </svg>
    );
  }

  if (type === "chat") {
    return (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24">
        <path d="M5 6.5h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9l-4 3v-3H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z" strokeWidth="1.8" />
      </svg>
    );
  }

  if (type === "user") {
    return (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24">
        <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-7 8a7 7 0 0 1 14 0" strokeWidth="1.8" />
      </svg>
    );
  }

  if (type === "grid") {
    return (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24">
        <path d="M5 5h5v5H5zM14 5h5v5h-5zM5 14h5v5H5zM14 14h5v5h-5z" strokeWidth="1.8" />
      </svg>
    );
  }

  if (type === "circle") {
    return (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24">
        <path d="M12 21a9 9 0 1 0-9-9 9 9 0 0 0 9 9Zm0-13a4 4 0 1 1-4 4" strokeWidth="1.8" />
      </svg>
    );
  }

  return (
    <svg className={iconClass} fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="7" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3" strokeWidth="1.8" />
    </svg>
  );
}

export function AppShell({
  title,
  subtitle,
  active,
  children
}: {
  title: string;
  subtitle?: string;
  active?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative z-10 flex min-h-screen flex-col pb-20">
      <header className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-[#d7b8ff]">
            <LogoMark className="h-5 w-5 shrink-0" size={20} />
            {BRAND_NAME}
          </div>
          <h1 className="mt-2 text-[2rem] font-semibold leading-none text-white">{title}</h1>
          {subtitle ? <p className="mt-2 max-w-[18rem] text-sm leading-5 text-white/72">{subtitle}</p> : null}
        </div>
        <div className="glass-card rounded-full px-3 py-2 text-xs font-semibold text-[#A855F7]">Live</div>
      </header>

      <div className="flex-1">{children}</div>

      <nav className="glass-card sticky bottom-0 mt-6 grid grid-cols-6 gap-2 rounded-[1.8rem] p-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "flex flex-col items-center gap-1 rounded-[1.25rem] px-2 py-3 text-center text-[11px] font-semibold transition",
              active === item.href ? "bg-white/12 text-white shadow-sm" : "text-white/66"
            )}
          >
            <NavIcon type={item.icon} />
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
