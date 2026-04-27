"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Screen, StatusBar } from "@/components/showcase/chrome";
import { PrimaryBtn, FootBar, Dots, SectionLabel } from "@/components/showcase/ui";
import { PuqAppRoot } from "@/components/showcase/app-shell";
import {
  S05_ValueSlide1, S06_ValueSlide2, S07_ValueSlide3, S08_Privacy,
} from "@/components/showcase/screens/onboarding";

const SLIDES = [
  { Comp: S05_ValueSlide1 },
  { Comp: S06_ValueSlide2 },
  { Comp: S07_ValueSlide3 },
  { Comp: S08_Privacy },
];

export default function ValuesPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const next = () => {
    if (step < SLIDES.length - 1) setStep(step + 1);
    else router.push("/login");
  };

  const Step = (SLIDES[step] ?? SLIDES[0]!).Comp;

  return (
    <PuqAppRoot>
      <main className="min-h-[100dvh] bg-puq-deep text-puq-text">
        <div className="relative h-[100dvh]">
          <Step />
          <div className="absolute inset-x-0 bottom-0 z-50 flex justify-center pb-20">
            <button
              onClick={next}
              className="rounded-full bg-puq-pink px-12 py-4 text-[15px] font-semibold text-white shadow-puq-glow active:scale-[0.98]"
            >
              {step < SLIDES.length - 1 ? "Continue" : "Verstanden, weiter"}
            </button>
          </div>
        </div>
      </main>
    </PuqAppRoot>
  );
}
