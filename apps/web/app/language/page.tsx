"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Screen, StatusBar, PuqWordmark } from "@/components/showcase/chrome";
import { PrimaryBtn, SectionLabel, FootBar } from "@/components/showcase/ui";
import { PuqAppRoot } from "@/components/showcase/app-shell";

const LANGS = [
  { code: "DE", label: "Deutsch", sub: "Deutsch" },
  { code: "EN", label: "English", sub: "English" },
  { code: "ES", label: "Español", sub: "Spanisch" },
  { code: "FR", label: "Français", sub: "Französisch" },
  { code: "PT", label: "Português", sub: "Portugiesisch" },
  { code: "RU", label: "Русский", sub: "Russisch" },
  { code: "TR", label: "Türkçe", sub: "Türkisch" },
  { code: "ZH", label: "中文", sub: "Chinesisch" },
  { code: "HI", label: "हिन्दी", sub: "Hindi" },
  { code: "AR", label: "العربية", sub: "Arabisch" },
];

export default function LanguagePage() {
  const router = useRouter();
  const [picked, setPicked] = useState("DE");

  const confirm = () => {
    document.cookie = `puqme.lang=${picked.toLowerCase()}; path=/; max-age=31536000; SameSite=Lax`;
    try { localStorage.setItem("puqme.lang", picked.toLowerCase()); } catch {}
    router.push("/onboarding/values");
  };

  return (
    <PuqAppRoot>
      <main className="min-h-[100dvh] bg-puq-deep text-puq-text">
        <Screen>
          <StatusBar />
          <div className="relative z-10 flex-1 overflow-y-auto px-5 pb-28 pt-3">
            <PuqWordmark size="md" />
            <div className="mt-7">
              <SectionLabel color="mint">★ WORLDWIDE AVAILABLE</SectionLabel>
              <h1 className="mt-2 text-[34px] font-bold leading-[1.05]">
                Wähle deine
                <em className="block font-serif italic text-puq-pink">Sprache.</em>
              </h1>
              <p className="mt-3 text-sm text-puq-muted">10 Sprachen — von Berlin bis Tokio.</p>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2.5">
              {LANGS.map((l) => {
                const on = l.code === picked;
                return (
                  <button
                    key={l.code}
                    onClick={() => setPicked(l.code)}
                    className={`flex items-center gap-2.5 rounded-2xl border px-3 py-3 text-left transition active:scale-[0.98] ${on ? "border-puq-pink bg-puq-card" : "border-puq-line-2/40 bg-puq-card/60"}`}
                  >
                    <div className={`grid h-8 w-8 place-items-center rounded-xl text-[11px] font-bold ${on ? "bg-puq-pink text-white" : "bg-puq-card-2 text-puq-muted"}`}>{l.code}</div>
                    <div className="flex-1">
                      <div className="text-[13.5px] font-semibold">{l.label}</div>
                      <div className="text-[11px] text-puq-faint">{l.sub}</div>
                    </div>
                    {on ? <span className="grid h-5 w-5 place-items-center rounded-full bg-puq-pink text-[10px]">✓</span> : null}
                  </button>
                );
              })}
            </div>
          </div>
          <FootBar><PrimaryBtn onClick={confirm}>Confirm</PrimaryBtn></FootBar>
        </Screen>
      </main>
    </PuqAppRoot>
  );
}
