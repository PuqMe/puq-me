"use client";

import { useState } from "react";
import Link from "next/link";

const steps = [
  {
    title: "Standort waehlen",
    text: "Aktiviere deinen Standort, damit nur Menschen in deiner echten Nähe auftauchen."
  },
  {
    title: "Absicht festlegen",
    text: "Lege Alter, Distanz und Stimmung fest, bevor du die ersten Profile siehst."
  },
  {
    title: "Sicher bleiben",
    text: "Verifizierte Fotos sowie Blockieren- und Melden-Funktionen halten dein Umfeld angenehm."
  }
];

export function OnboardingFlow() {
  const [step, setStep] = useState(0);
  const current = steps[step];

  return (
    <section className="flex min-h-[calc(100vh-3rem)] flex-col justify-between">
      <div className="mesh-panel glass-card rounded-[2rem] p-6 text-white">
        <div className="warm-pill inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]">Onboarding</div>
        <div className="mt-6 flex gap-2">
          {steps.map((_, index) => (
            <div key={index} className={`h-1.5 flex-1 rounded-full ${index <= step ? "bg-[#1F8F62]" : "bg-black/10"}`} />
          ))}
        </div>
        <h1 className="mt-8 text-4xl font-semibold leading-tight text-white">{current.title}</h1>
        <p className="mt-4 text-base leading-7 text-white/72">{current.text}</p>
      </div>

      <div className="grid gap-3">
        {step < steps.length - 1 ? (
          <button className="glow-button rounded-[1.3rem] px-4 py-4 text-sm font-semibold text-white" onClick={() => setStep((value) => value + 1)}>
            Weiter
          </button>
        ) : (
          <Link className="glow-button rounded-[1.3rem] px-4 py-4 text-center text-sm font-semibold text-white" href="/profile/create">
            Profil erstellen
          </Link>
        )}
        <Link className="glass-card rounded-[1.3rem] px-4 py-4 text-center text-sm font-semibold text-white" href="/login">
          Vorerst ueberspringen
        </Link>
      </div>
    </section>
  );
}
