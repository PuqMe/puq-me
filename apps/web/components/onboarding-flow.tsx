"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  fetchMyProfile,
  updateMyInterests,
  updateMyLocation,
  updateMyPreferences,
  type ProfileResponse
} from "@/lib/profile";

const interestOptions = [
  "Live music",
  "Coffee dates",
  "City walks",
  "Museums",
  "Night drives",
  "Pilates",
  "Food spots",
  "Books"
];

const interestedInOptions = [
  { value: "women", label: "Women" },
  { value: "men", label: "Men" },
  { value: "non_binary", label: "Non-binary" },
  { value: "everyone", label: "Everyone" }
] as const;

export function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [interestedIn, setInterestedIn] = useState<Array<"men" | "women" | "non_binary" | "everyone">>(["everyone"]);
  const [minAge, setMinAge] = useState(24);
  const [maxAge, setMaxAge] = useState(36);
  const [maxDistanceKm, setMaxDistanceKm] = useState(25);
  const [showMeGlobally, setShowMeGlobally] = useState(false);
  const [onlyVerifiedProfiles, setOnlyVerifiedProfiles] = useState(false);
  const [locationStatus, setLocationStatus] = useState("Standort noch nicht gesetzt.");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const data = await fetchMyProfile();
        if (cancelled) return;
        setProfile(data);
        setSelectedInterests(data.interests);
        setInterestedIn((data.preferences.interestedIn as Array<"men" | "women" | "non_binary" | "everyone">) || ["everyone"]);
        setMinAge(data.preferences.minAge);
        setMaxAge(data.preferences.maxAge);
        setMaxDistanceKm(data.preferences.maxDistanceKm);
        setShowMeGlobally(data.preferences.showMeGlobally);
        setOnlyVerifiedProfiles(data.preferences.onlyVerifiedProfiles);
        if (data.location) {
          setLocationStatus(`${data.location.city ?? "Standort aktiv"} gespeichert.`);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error instanceof Error ? error.message : "Onboarding konnte nicht geladen werden.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const steps = useMemo(
    () => [
      {
        title: "Standort aktivieren",
        text: "Je praeziser dein Standort, desto besser wird dein Radar und desto relevanter sind spaetere Matches."
      },
      {
        title: "Interessen setzen",
        text: "Gib dem ersten Matchgespraech direkt Stoff und steuere die Qualitaet deines Profils."
      },
      {
        title: "Radar filtern",
        text: "Lege Alter, Distanz und Sichtbarkeit fest, damit dein Feed von Anfang an zu dir passt."
      }
    ],
    []
  );

  async function saveLocation() {
    setErrorMessage(null);
    setIsSaving(true);

    try {
      if (typeof navigator === "undefined" || !navigator.geolocation) {
        throw new Error("Geolocation wird auf diesem Geraet nicht unterstuetzt.");
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000
        })
      );

      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      let city: string | undefined;
      let countryCode: string | undefined;

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=10&accept-language=en`
        );
        if (response.ok) {
          const data = (await response.json()) as {
            address?: {
              city?: string;
              town?: string;
              village?: string;
              municipality?: string;
              country_code?: string;
            };
          };

          city =
            data.address?.city ??
            data.address?.town ??
            data.address?.village ??
            data.address?.municipality;
          countryCode = data.address?.country_code?.toUpperCase();
        }
      } catch {
        // Best effort reverse geocoding. Coordinates remain the source of truth.
      }

      const locationInput: Parameters<typeof updateMyLocation>[0] = {
        latitude,
        longitude
      };

      if (city) {
        locationInput.city = city;
      }

      if (countryCode) {
        locationInput.countryCode = countryCode;
      }

      const nextProfile = await updateMyLocation(locationInput);

      setProfile(nextProfile);
      setLocationStatus(`${city ?? "Standort"} gespeichert und aktiv.`);
      setStep(1);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Standort konnte nicht gespeichert werden.");
    } finally {
      setIsSaving(false);
    }
  }

  async function saveInterests() {
    setErrorMessage(null);
    if (selectedInterests.length === 0) {
      setErrorMessage("Waehle mindestens ein Interesse.");
      return;
    }

    setIsSaving(true);
    try {
      const nextProfile = await updateMyInterests(selectedInterests);
      setProfile(nextProfile);
      setStep(2);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Interessen konnten nicht gespeichert werden.");
    } finally {
      setIsSaving(false);
    }
  }

  async function savePreferences() {
    setErrorMessage(null);
    if (interestedIn.length === 0) {
      setErrorMessage("Waehle mindestens eine Zielgruppe.");
      return;
    }

    setIsSaving(true);
    try {
      await updateMyPreferences({
        interestedIn,
        minAge,
        maxAge,
        maxDistanceKm,
        showMeGlobally,
        onlyVerifiedProfiles
      });
      router.push("/radar");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Praeferenzen konnten nicht gespeichert werden.");
    } finally {
      setIsSaving(false);
    }
  }

  function toggleInterest(interest: string) {
    setSelectedInterests((current) =>
      current.includes(interest) ? current.filter((item) => item !== interest) : [...current, interest]
    );
  }

  function toggleInterestedIn(value: "men" | "women" | "non_binary" | "everyone") {
    setInterestedIn((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
    );
  }

  const current = steps[step] ?? steps[0]!;

  return (
    <section className="flex min-h-[calc(100vh-3rem)] flex-col justify-between gap-4">
      <div className="mesh-panel glass-card rounded-[2rem] p-6 text-white">
        <div className="warm-pill inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]">Onboarding live</div>
        <div className="mt-6 flex gap-2">
          {steps.map((_, index) => (
            <div key={index} className={`h-1.5 flex-1 rounded-full ${index <= step ? "bg-[#1F8F62]" : "bg-black/10"}`} />
          ))}
        </div>
        <h1 className="mt-8 text-4xl font-semibold leading-tight text-white">{current.title}</h1>
        <p className="mt-4 text-base leading-7 text-white/72">{current.text}</p>

        {step === 0 ? (
          <div className="mt-6 rounded-[1.4rem] bg-white/8 p-4">
            <div className="text-sm font-semibold text-white">Standortstatus</div>
            <div className="mt-2 text-sm text-white/72">{locationStatus}</div>
            <div className="mt-3 text-xs uppercase tracking-[0.18em] text-white/45">
              {profile?.location ? `${profile.location.latitude.toFixed(3)}, ${profile.location.longitude.toFixed(3)}` : "Kein aktiver Standort"}
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="mt-6 flex flex-wrap gap-2">
            {interestOptions.map((interest) => (
              <button
                key={interest}
                className={`rounded-full px-3 py-2 text-xs font-semibold ${selectedInterests.includes(interest) ? "bg-[#A855F7] text-white" : "bg-white/10 text-white/82"}`}
                onClick={() => toggleInterest(interest)}
                type="button"
              >
                {interest}
              </button>
            ))}
          </div>
        ) : null}

        {step === 2 ? (
          <div className="mt-6 grid gap-4">
            <div>
              <div className="text-sm font-semibold text-white">Ich moechte sehen</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {interestedInOptions.map((option) => (
                  <button
                    key={option.value}
                    className={`rounded-full px-3 py-2 text-xs font-semibold ${interestedIn.includes(option.value) ? "bg-[#A855F7] text-white" : "bg-white/10 text-white/82"}`}
                    onClick={() => toggleInterestedIn(option.value)}
                    type="button"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <label className="grid gap-2 text-sm text-white/82">
              Min age: {minAge}
              <input max={maxAge} min={18} onChange={(event) => setMinAge(Number(event.target.value))} type="range" value={minAge} />
            </label>
            <label className="grid gap-2 text-sm text-white/82">
              Max age: {maxAge}
              <input max={60} min={minAge} onChange={(event) => setMaxAge(Number(event.target.value))} type="range" value={maxAge} />
            </label>
            <label className="grid gap-2 text-sm text-white/82">
              Max distance: {maxDistanceKm} km
              <input max={200} min={5} onChange={(event) => setMaxDistanceKm(Number(event.target.value))} type="range" value={maxDistanceKm} />
            </label>

            <label className="flex items-center justify-between rounded-[1rem] bg-white/8 px-4 py-3 text-sm text-white/82">
              Show me globally
              <input checked={showMeGlobally} onChange={(event) => setShowMeGlobally(event.target.checked)} type="checkbox" />
            </label>
            <label className="flex items-center justify-between rounded-[1rem] bg-white/8 px-4 py-3 text-sm text-white/82">
              Only verified profiles
              <input checked={onlyVerifiedProfiles} onChange={(event) => setOnlyVerifiedProfiles(event.target.checked)} type="checkbox" />
            </label>
          </div>
        ) : null}

        {errorMessage ? <div className="mt-5 text-sm text-[#ffb4c7]">{errorMessage}</div> : null}
      </div>

      <div className="grid gap-3">
        {step === 0 ? (
          <button className="glow-button rounded-[1.3rem] px-4 py-4 text-sm font-semibold text-white" disabled={isSaving} onClick={() => void saveLocation()}>
            {isSaving ? "Standort wird gespeichert..." : "Standort aktivieren"}
          </button>
        ) : null}

        {step === 1 ? (
          <button className="glow-button rounded-[1.3rem] px-4 py-4 text-sm font-semibold text-white" disabled={isSaving} onClick={() => void saveInterests()}>
            {isSaving ? "Interessen werden gespeichert..." : "Interessen speichern"}
          </button>
        ) : null}

        {step === 2 ? (
          <button className="glow-button rounded-[1.3rem] px-4 py-4 text-sm font-semibold text-white" disabled={isSaving} onClick={() => void savePreferences()}>
            {isSaving ? "Radar wird vorbereitet..." : "Radar starten"}
          </button>
        ) : null}

        <Link className="glass-card rounded-[1.3rem] px-4 py-4 text-center text-sm font-semibold text-white" href={step === 2 ? "/radar" : "/profile/create"}>
          Vorerst ueberspringen
        </Link>
      </div>
    </section>
  );
}
