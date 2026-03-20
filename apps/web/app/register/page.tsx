"use client";

import { RegisterCard } from "@/components/register-card";
import { useLanguage } from "@/lib/i18n";

export default function RegisterPage() {
  const { t } = useLanguage();
  return (
    <main className="auth-shell safe-px safe-pb flex items-center">
      <div className="mx-auto w-full max-w-md lg:max-w-lg">
        <div className="mb-4 px-1">
          <div className="soft-pill inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]">{t.quickStart}</div>
          <p className="mt-3 text-sm leading-6 text-white/72">{t.registerDesc}</p>
        </div>
        <RegisterCard />
      </div>
    </main>
  );
}
