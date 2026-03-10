"use client";

import { useState } from "react";
import Link from "next/link";

const steps = [
  {
    title: "Choose your city",
    text: "Enable location to discover people close enough for real conversations and real dates."
  },
  {
    title: "Set your intent",
    text: "Adjust age, distance and vibe preferences before the first swipe."
  },
  {
    title: "Stay safe",
    text: "Profile review, block/report controls and verified photos help keep the feed clean."
  }
];

export function OnboardingFlow() {
  const [step, setStep] = useState(0);
  const current = steps[step];

  return (
    <section className="flex min-h-[calc(100vh-3rem)] flex-col justify-between">
      <div className="glass-card rounded-[2rem] p-6">
        <div className="text-xs uppercase tracking-[0.22em] text-black/45">Onboarding</div>
        <div className="mt-6 flex gap-2">
          {steps.map((_, index) => (
            <div key={index} className={`h-1.5 flex-1 rounded-full ${index <= step ? "bg-coral" : "bg-black/10"}`} />
          ))}
        </div>
        <h1 className="mt-8 text-4xl font-semibold leading-tight text-ink">{current.title}</h1>
        <p className="mt-4 text-base leading-7 text-black/60">{current.text}</p>
      </div>

      <div className="grid gap-3">
        {step < steps.length - 1 ? (
          <button className="rounded-2xl bg-ink px-4 py-4 text-sm font-medium text-white" onClick={() => setStep((value) => value + 1)}>
            Continue
          </button>
        ) : (
          <Link className="rounded-2xl bg-ink px-4 py-4 text-center text-sm font-medium text-white" href="/profile/create">
            Build my profile
          </Link>
        )}
        <Link className="rounded-2xl border border-black/10 px-4 py-4 text-center text-sm font-medium text-ink" href="/login">
          Skip for now
        </Link>
      </div>
    </section>
  );
}
