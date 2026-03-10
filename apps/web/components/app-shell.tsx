import Link from "next/link";
import clsx from "clsx";

const navItems = [
  { href: "/discover", label: "Discover" },
  { href: "/matches", label: "Matches" },
  { href: "/chat", label: "Chat" },
  { href: "/profile", label: "Profile" },
  { href: "/settings", label: "Settings" }
];

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
    <div className="flex min-h-screen flex-col">
      <header className="mb-4 flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-black/45">PuQ.me</div>
          <h1 className="mt-2 text-3xl font-semibold text-ink">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-black/55">{subtitle}</p> : null}
        </div>
        <div className="glass-card rounded-2xl px-3 py-2 text-sm font-medium text-black/70">Live</div>
      </header>

      <div className="flex-1">{children}</div>

      <nav className="glass-card sticky bottom-0 mt-6 grid grid-cols-5 gap-2 rounded-[1.75rem] p-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "rounded-2xl px-3 py-3 text-center text-xs font-medium transition",
              active === item.href ? "bg-ink text-white" : "text-black/60"
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
