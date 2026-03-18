"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BRAND_NAME } from "@puqme/config";
import { Button, Card, LogoMark } from "@puqme/ui";
import { useAdminAuth } from "@/lib/admin-auth";

export function AdminLoginCard() {
  const router = useRouter();
  const { signInDemo } = useAdminAuth();
  const [email, setEmail] = useState("ops@puq.me");
  const [password, setPassword] = useState("AdminDemo123!");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.includes("@") || password.length < 10) {
      setError("Use a valid admin email and a strong password.");
      return;
    }

    signInDemo(email);
    router.replace("/overview");
  };

  return (
    <Card className="rounded-[2rem] border-white/10 bg-[linear-gradient(180deg,rgba(11,22,34,0.96),rgba(10,19,29,0.92))] p-7 text-white shadow-[0_40px_120px_rgba(0,0,0,0.38)]">
      <div className="flex items-center gap-3">
        <LogoMark className="h-8 w-8" size={32} />
        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{BRAND_NAME}</div>
      </div>
      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Admin access</div>
      <h2 className="mt-4 text-3xl font-semibold tracking-tight">Sign in to {BRAND_NAME} Control</h2>
      <p className="mt-3 text-sm leading-6 text-slate-400">
        Protected access for moderation, incident response and marketplace operations.
      </p>

      <form className="mt-8 space-y-5" onSubmit={onSubmit}>
        <label className="block">
          <span className="mb-2 block text-sm text-slate-300">Email</span>
          <input
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-orange-300/40 focus:bg-white/[0.06]"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="ops@puq.me"
            type="email"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-slate-300">Password</span>
          <input
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-orange-300/40 focus:bg-white/[0.06]"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••••"
            type="password"
          />
        </label>

        <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
          <span>Require elevated moderator role</span>
          <input checked readOnly type="checkbox" />
        </label>

        {error ? (
          <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        <Button className="w-full bg-[linear-gradient(135deg,#ff8a4c,#ff6930)] py-3.5 text-sm font-semibold text-white hover:opacity-100">
          Sign in
        </Button>
      </form>
    </Card>
  );
}
