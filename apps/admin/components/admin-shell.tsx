"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BRAND_NAME } from "@puqme/config";
import { Button, LogoMark } from "@puqme/ui";
import { useAdminAuth } from "@/lib/admin-auth";

const navigation = [
  { href: "/overview", label: "Overview" },
  { href: "/reports", label: "Reports" },
  { href: "/profiles", label: "Profiles" },
  { href: "/messages", label: "Messages" },
  { href: "/users", label: "Users" },
  { href: "/kpi", label: "KPIs" }
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { admin, signOut } = useAdminAuth();

  return (
    <div className="min-h-screen px-3 py-3 sm:px-5">
      <div className="mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-[1440px] gap-3 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(11,23,35,0.96),rgba(8,17,27,0.92))] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <LogoMark className="mt-0.5 h-9 w-9 shrink-0" size={36} />
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                {BRAND_NAME}
                </div>
                <div className="mt-2 text-2xl font-semibold">Admin</div>
              </div>
            </div>
            <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-300">
              {admin?.role ?? "admin"}
            </div>
          </div>

          <nav className="mt-8 space-y-2">
            {navigation.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "flex items-center justify-between rounded-2xl px-4 py-3 text-sm transition",
                    active
                      ? "bg-[linear-gradient(135deg,rgba(255,138,76,0.24),rgba(255,105,48,0.12))] text-white shadow-[0_20px_50px_rgba(255,105,48,0.14)]"
                      : "text-slate-300 hover:bg-white/[0.04] hover:text-white"
                  ].join(" ")}
                >
                  <span>{item.label}</span>
                  {active ? <span className="text-[10px] uppercase tracking-[0.2em] text-orange-200">Live</span> : null}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-4">
            <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Signed in</div>
            <div className="mt-2 text-sm font-medium text-white">{admin?.email ?? "ops@puq.me"}</div>
            <div className="mt-1 text-sm text-slate-400">
              Roles: {admin?.permissions.join(", ") ?? "reports.read"}
            </div>
            <Button className="mt-4 w-full bg-white text-slate-950 hover:opacity-100" onClick={signOut}>
              Sign out
            </Button>
          </div>
        </aside>

        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(9,18,28,0.92),rgba(7,15,24,0.88))] shadow-[0_30px_90px_rgba(0,0,0,0.28)]">
          <div className="border-b border-white/10 px-5 py-4 sm:px-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Trust & safety operations
                </div>
                <div className="mt-2 text-2xl font-semibold text-white">Moderation cockpit</div>
              </div>
              <div className="flex gap-3 text-xs text-slate-400">
                <div className="rounded-full border border-white/10 px-3 py-1.5">Staging-ready</div>
                <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-emerald-200">
                  Queue stable
                </div>
              </div>
            </div>
          </div>
          <main className="p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
