"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { PushPermissionCard } from "@/components/push-permission-card";
import { fetchMyProfile, updateMyPreferences, updateMyVisibility, type ProfileResponse } from "@/lib/profile";
import { useAuth } from "@/lib/auth";
import { useLanguage } from "@/lib/i18n";

export function SettingsPanel() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { locale, setLocale, t } = useLanguage();
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

  function handleSignOut() {
    signOut();
    router.replace("/");
  }

  return (
    <AppShell active="/settings" title={t.settingsTitle} subtitle="Echte Radar- und Privacy-Steuerung">
      <section className="grid gap-3">
        <PushPermissionCard />

        {errorMessage ? <article className="glass-card rounded-[2rem] px-4 py-4 text-sm text-[#ffb4c7]">{errorMessage}</article> : null}
        {successMessage ? <article className="glass-card rounded-[2rem] px-4 py-4 text-sm text-[#b8ffd9]">{successMessage}</article> : null}

        {/* Language switcher */}
        <article className="glass-card rounded-[2rem] px-4 py-4">
          <div className="text-sm font-medium text-white">{t.language}</div>
          <div className="mt-1 text-xs text-white/58">{t.languageDesc}</div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => setLocale("en")}
              className={`flex-1 rounded-xl border py-2 text-sm font-semibold transition ${
                locale === "en"
                  ? "border-[#a855f7] bg-[#a855f7]/20 text-[#c084fc]"
                  : "border-white/12 bg-white/5 text-white/60 hover:text-white"
              }`}
            >
              🇬🇧 {t.english}
            </button>
            <button
              onClick={() => setLocale("de")}
              className={`flex-1 rounded-xl border py-2 text-sm font-semibold transition ${
                locale === "de"
                  ? "border-[#a855f7] bg-[#a855f7]/20 text-[#c084fc]"
                  : "border-white/12 bg-white/5 text-white/60 hover:text-white"
              }`}
            >
              🇩🇪 {t.german}
            </button>
          </div>
        </article>

        <article className="glass-card rounded-[2rem] px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-white">{t.onlyVerified}</div>
              <div className="mt-1 text-xs text-white/58">{t.onlyVerifiedDesc}</div>
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
              <div className="text-sm font-medium text-white">{t.showGlobally}</div>
              <div className="mt-1 text-xs text-white/58">{t.showGloballyDesc}</div>
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
          <div className="text-sm font-medium text-white">{t.distance}</div>
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
          <div className="text-sm font-medium text-white">{t.agePrefs}</div>
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
              <div className="text-sm font-medium text-white">{t.visibility}</div>
              <div className="mt-1 text-xs text-white/58">{t.visibilityDesc}</div>
            </div>
            <input checked={data?.profile.isVisible ?? true} disabled={!data || isSaving} onChange={(event) => void saveProfileVisibility(event.target.checked)} type="checkbox" />
          </div>
        </article>

        {/* Sign out */}
        <article className="glass-card rounded-[2rem] px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-white">{t.logout}</div>
              <div className="mt-1 text-xs text-white/58">{t.logoutDesc}</div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex h-9 items-center gap-2 rounded-xl border border-[#ff6b8a]/30 bg-[#ff1a4b]/10 px-4 text-sm font-semibold text-[#ff6b8a] transition hover:bg-[#ff1a4b]/20 active:scale-95"
            >
              {/* Sign-out arrow icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              {t.logout}
            </button>
          </div>
        </article>
      </section>
    </AppShell>
  );
}
