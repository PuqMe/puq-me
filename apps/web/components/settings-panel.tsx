"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { PushPermissionCard } from "@/components/push-permission-card";
import { fetchMyProfile, updateMyPreferences, updateMyVisibility, type ProfileResponse } from "@/lib/profile";

export function SettingsPanel() {
  const [data, setData] = useState<ProfileResponse | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const profile = await fetchMyProfile();
        if (!cancelled) {
          setData(profile);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error instanceof Error ? error.message : "Could not load settings.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  async function saveProfileVisibility(isVisible: boolean) {
    if (!data) return;
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const next = await updateMyVisibility(isVisible);
      setData(next);
      setSuccessMessage("Visibility updated.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not save visibility.");
    } finally {
      setIsSaving(false);
    }
  }

  async function savePreferencePatch(input: Partial<ProfileResponse["preferences"]>) {
    if (!data) return;
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const next = await updateMyPreferences({
        interestedIn: (input.interestedIn as Array<"men" | "women" | "non_binary" | "everyone">) ?? (data.preferences.interestedIn as Array<"men" | "women" | "non_binary" | "everyone">),
        minAge: input.minAge ?? data.preferences.minAge,
        maxAge: input.maxAge ?? data.preferences.maxAge,
        maxDistanceKm: input.maxDistanceKm ?? data.preferences.maxDistanceKm,
        showMeGlobally: input.showMeGlobally ?? data.preferences.showMeGlobally,
        onlyVerifiedProfiles: input.onlyVerifiedProfiles ?? data.preferences.onlyVerifiedProfiles
      });
      setData(next);
      setSuccessMessage("Radar-Settings gespeichert.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not save settings.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AppShell active="/settings" title="Settings" subtitle="Echte Radar- und Privacy-Steuerung statt Platzhalter-Schalter">
      <section className="grid gap-3">
        <PushPermissionCard />

        {errorMessage ? <article className="glass-card rounded-[2rem] px-4 py-4 text-sm text-[#ffb4c7]">{errorMessage}</article> : null}
        {successMessage ? <article className="glass-card rounded-[2rem] px-4 py-4 text-sm text-[#b8ffd9]">{successMessage}</article> : null}

        <article className="glass-card rounded-[2rem] px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-white">Only verified profiles</div>
              <div className="mt-1 text-xs text-white/58">Hoehere Trust-Qualitaet im Feed.</div>
            </div>
            <input
              checked={data?.preferences.onlyVerifiedProfiles ?? false}
              disabled={!data || isSaving}
              onChange={(event) => void savePreferencePatch({ onlyVerifiedProfiles: event.target.checked })}
              type="checkbox"
            />
          </div>
        </article>

        <article className="glass-card rounded-[2rem] px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-white">Show me globally</div>
              <div className="mt-1 text-xs text-white/58">Nicht nur lokales, sondern globales Radar zulassen.</div>
            </div>
            <input
              checked={data?.preferences.showMeGlobally ?? false}
              disabled={!data || isSaving}
              onChange={(event) => void savePreferencePatch({ showMeGlobally: event.target.checked })}
              type="checkbox"
            />
          </div>
        </article>

        <article className="glass-card rounded-[2rem] px-4 py-4">
          <div className="text-sm font-medium text-white">Distance radius</div>
          <div className="mt-1 text-xs text-white/58">{data?.preferences.maxDistanceKm ?? 25} km</div>
          <input
            className="mt-4 w-full"
            disabled={!data || isSaving}
            max={200}
            min={5}
            onChange={(event) => void savePreferencePatch({ maxDistanceKm: Number(event.target.value) })}
            type="range"
            value={data?.preferences.maxDistanceKm ?? 25}
          />
        </article>

        <article className="glass-card rounded-[2rem] px-4 py-4">
          <div className="text-sm font-medium text-white">Age preferences</div>
          <div className="mt-1 text-xs text-white/58">
            {data?.preferences.minAge ?? 24} - {data?.preferences.maxAge ?? 36}
          </div>
          <div className="mt-4 grid gap-3">
            <input
              className="w-full"
              disabled={!data || isSaving}
              max={data?.preferences.maxAge ?? 36}
              min={18}
              onChange={(event) => void savePreferencePatch({ minAge: Number(event.target.value) })}
              type="range"
              value={data?.preferences.minAge ?? 24}
            />
            <input
              className="w-full"
              disabled={!data || isSaving}
              max={60}
              min={data?.preferences.minAge ?? 24}
              onChange={(event) => void savePreferencePatch({ maxAge: Number(event.target.value) })}
              type="range"
              value={data?.preferences.maxAge ?? 36}
            />
          </div>
        </article>

        <article className="glass-card rounded-[2rem] px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-white">Profile visibility</div>
              <div className="mt-1 text-xs text-white/58">Steuert, ob du im Radar sichtbar bist.</div>
            </div>
            <input checked={data?.profile.isVisible ?? true} disabled={!data || isSaving} onChange={(event) => void saveProfileVisibility(event.target.checked)} type="checkbox" />
          </div>
        </article>
      </section>
    </AppShell>
  );
}
