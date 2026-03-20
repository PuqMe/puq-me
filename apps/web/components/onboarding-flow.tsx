"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  fetchMyProfile,
  updateMyProfile,
  updateMyInterests,
  updateMyLocation,
  uploadMyPhoto,
  uploadMyVideo,
  type ProfileResponse
} from "@/lib/profile";
import { useAuth } from "@/lib/auth";
import { useLanguage } from "@/lib/i18n";

const interestOptions = [
  "Live music",
  "Coffee dates",
  "City walks",
  "Museums",
  "Night drives",
  "Pilates",
  "Food spots",
  "Books",
  "Travel",
  "Photography",
  "Cooking",
  "Yoga",
  "Hiking",
  "Art",
  "Movies"
];

export function OnboardingFlow() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Step 1: Media
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Step 2: Info
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  // Derive greeting name from user email or profile
  const greetingName = profile?.profile.displayName
    || user?.email?.split("@")[0]
    || "there";

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const data = await fetchMyProfile();
        if (cancelled) return;
        setProfile(data);
        setDisplayName(data.profile.displayName || user?.email?.split("@")[0] || "");
        setBio(data.profile.bio || "");
        setSelectedInterests(data.interests || []);
      } catch {
        // Profile not found is fine for new users
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [user]);

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);
    setPhotoFile(file);
  }

  function handleVideoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      setErrorMessage("Video must be under 50 MB.");
      return;
    }
    const url = URL.createObjectURL(file);
    setVideoPreview(url);
    setVideoFile(file);
  }

  function toggleInterest(interest: string) {
    setSelectedInterests((current) => {
      if (current.includes(interest)) {
        return current.filter((i) => i !== interest);
      }
      if (current.length >= 5) return current;
      return [...current, interest];
    });
  }

  async function saveMediaAndContinue() {
    setErrorMessage(null);
    if (!photoPreview) {
      setErrorMessage(t.profilePictureRequired);
      return;
    }

    setIsSaving(true);
    try {
      // Upload photo to the server so it persists after re-login
      if (photoFile) {
        await uploadMyPhoto(photoFile);
      }
      // Upload video if selected
      if (videoFile) {
        await uploadMyVideo(videoFile).catch(() => {
          // Video upload failure is non-fatal — continue
        });
      }
    } catch {
      // Upload failure is non-fatal during onboarding; proceed to next step
    } finally {
      setIsSaving(false);
    }

    setStep(2);
  }

  async function saveInfoAndFinish() {
    setErrorMessage(null);

    if (displayName.trim().length < 2) {
      setErrorMessage("Name needs at least 2 characters.");
      return;
    }

    if (selectedInterests.length < 3) {
      setErrorMessage("Pick at least 3 interests.");
      return;
    }

    setIsSaving(true);

    try {
      // Save profile info
      await updateMyProfile({
        displayName: displayName.trim(),
        bio: bio.trim() || undefined,
        birthDate: profile?.profile.birthDate || "2000-01-01"
      });

      // Save interests
      await updateMyInterests(selectedInterests);

      // Try to save location silently
      try {
        if (typeof navigator !== "undefined" && navigator.geolocation) {
          const position = await new Promise<GeolocationPosition>((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 5000
            })
          );

          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          let city: string | undefined;
          let countryCode: string | undefined;

          try {
            const geoRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=10&accept-language=en`
            );
            if (geoRes.ok) {
              const data = (await geoRes.json()) as {
                address?: {
                  city?: string;
                  town?: string;
                  village?: string;
                  municipality?: string;
                  country_code?: string;
                };
              };
              city = data.address?.city ?? data.address?.town ?? data.address?.village ?? data.address?.municipality;
              countryCode = data.address?.country_code?.toUpperCase();
            }
          } catch {
            // Best effort
          }

          await updateMyLocation({ latitude, longitude, ...(city && { city }), ...(countryCode && { countryCode }) });
        }
      } catch {
        // Location is optional during onboarding
      }

      setStep(3);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not save profile.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-sm text-white/60">{t.loading}</div>
      </div>
    );
  }

  // ─── Step 0: Welcome greeting ───
  if (step === 0) {
    return (
      <section className="flex min-h-[calc(100vh-3rem)] flex-col items-center justify-center gap-6 px-4 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#A855F7] to-[#6D28D9]">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>

        <div>
          <h1 className="text-3xl font-semibold text-white">
            {t.onboardingWelcomeTitle.replace("{name}", greetingName)}
          </h1>
          <p className="mx-auto mt-3 max-w-xs text-base leading-7 text-white/70">
            {t.onboardingWelcomeDesc}
          </p>
        </div>

        <button
          className="glow-button mt-4 w-full max-w-xs rounded-[1.3rem] px-6 py-4 text-base font-semibold text-white"
          onClick={() => setStep(1)}
        >
          {t.setupProfile}
        </button>

        <button
          className="text-sm text-white/50 underline underline-offset-4"
          onClick={() => router.push("/nearby")}
        >
          {t.skipForNow}
        </button>
      </section>
    );
  }

  // ─── Step 1: Photo + Video ───
  if (step === 1) {
    return (
      <section className="flex min-h-[calc(100vh-3rem)] flex-col justify-between gap-4">
        <div className="glass-card rounded-[2rem] p-6 text-white">
          <div className="flex items-center gap-2">
            <div className="warm-pill inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]">
              {t.step1of2}
            </div>
          </div>

          <h1 className="mt-6 text-3xl font-semibold leading-tight text-white">
            {t.showYourself}
          </h1>
          <p className="mt-2 text-sm leading-6 text-white/70">
            {t.showYourselfDesc}
          </p>

          {/* Photo upload */}
          <div className="mt-6 flex items-start gap-4">
            <button
              className="group relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-[1.4rem] border-2 border-dashed border-white/20 bg-white/5 transition hover:border-[#A855F7]/60"
              onClick={() => photoInputRef.current?.click()}
              type="button"
            >
              {photoPreview ? (
                <img src={photoPreview} alt="Profile" className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-white/40">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <span className="text-[10px] font-semibold uppercase tracking-wider">{t.photoLabel}</span>
                </div>
              )}
            </button>
            <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />

            {/* Video upload */}
            <button
              className="group relative flex h-28 flex-1 items-center justify-center overflow-hidden rounded-[1.4rem] border-2 border-dashed border-white/20 bg-white/5 transition hover:border-[#A855F7]/60"
              onClick={() => videoInputRef.current?.click()}
              type="button"
            >
              {videoPreview ? (
                <div className="flex flex-col items-center gap-1 text-[#A855F7]">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <span className="text-xs font-medium">{t.videoReady}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 text-white/40">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="23 7 16 12 23 17 23 7" />
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                  </svg>
                  <span className="text-[10px] font-semibold uppercase tracking-wider">{t.videoLabel}</span>
                  <span className="text-[9px] text-white/30">{t.videoOptional}</span>
                </div>
              )}
            </button>
            <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoSelect} />
          </div>

          {errorMessage ? <div className="mt-4 text-sm text-[#ffb4c7]">{errorMessage}</div> : null}
        </div>

        <div className="grid gap-3 pb-2">
          <button
            className="glow-button rounded-[1.3rem] px-4 py-4 text-sm font-semibold text-white"
            disabled={isSaving}
            onClick={() => void saveMediaAndContinue()}
          >
            {isSaving ? t.saving : t.continueStep}
          </button>
          <button
            className="rounded-[1.3rem] px-4 py-3 text-center text-sm text-white/50"
            onClick={() => setStep(0)}
          >
            {t.back}
          </button>
        </div>
      </section>
    );
  }

  // ─── Step 2: Name, Bio, Interests ───
  if (step === 2) {
    return (
      <section className="flex min-h-[calc(100vh-3rem)] flex-col justify-between gap-4">
        <div className="glass-card rounded-[2rem] p-6 text-white">
          <div className="warm-pill inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]">
            {t.step2of2}
          </div>

          <h1 className="mt-6 text-3xl font-semibold leading-tight text-white">
            {t.fewDetails}
          </h1>
          <p className="mt-2 text-sm leading-6 text-white/70">
            {t.fewDetailsDesc}
          </p>

          <div className="mt-6 grid gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50">{t.nameLabel}</label>
              <input
                className="w-full rounded-[1.2rem] border border-white/12 bg-white/10 px-4 py-3.5 text-white outline-none placeholder:text-white/30 focus:border-[#A855F7]/50"
                placeholder={t.namePlaceholder}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={40}
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-white/50">
                <span>{t.bioLabel}</span>
                <span className="normal-case tracking-normal text-white/30">{bio.length}/100</span>
              </label>
              <textarea
                className="min-h-[5rem] w-full resize-none rounded-[1.2rem] border border-white/12 bg-white/10 px-4 py-3.5 text-white outline-none placeholder:text-white/30 focus:border-[#A855F7]/50"
                placeholder={t.bioPlaceholder}
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 100))}
                maxLength={100}
              />
            </div>

            <div>
              <label className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-white/50">
                <span>{t.interestsStep}</span>
                <span className="normal-case tracking-normal text-white/30">{selectedInterests.length}/5</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {interestOptions.map((interest) => (
                  <button
                    key={interest}
                    className={`rounded-full px-3.5 py-2 text-xs font-semibold transition ${
                      selectedInterests.includes(interest)
                        ? "bg-[#A855F7] text-white shadow-lg shadow-[#A855F7]/25"
                        : "bg-white/8 text-white/70 hover:bg-white/14"
                    }`}
                    onClick={() => toggleInterest(interest)}
                    type="button"
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {errorMessage ? <div className="mt-4 text-sm text-[#ffb4c7]">{errorMessage}</div> : null}
        </div>

        <div className="grid gap-3 pb-2">
          <button
            className="glow-button rounded-[1.3rem] px-4 py-4 text-sm font-semibold text-white"
            disabled={isSaving}
            onClick={() => void saveInfoAndFinish()}
          >
            {isSaving ? t.saving : t.finishProfile}
          </button>
          <button
            className="rounded-[1.3rem] px-4 py-3 text-center text-sm text-white/50"
            onClick={() => setStep(1)}
          >
            {t.back}
          </button>
        </div>
      </section>
    );
  }

  // ─── Step 3: Done / Overview ───
  return (
    <section className="flex min-h-[calc(100vh-3rem)] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#1F8F62] to-[#34D399]">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      </div>

      <div>
        <h1 className="text-3xl font-semibold text-white">{t.allSet}</h1>
        <p className="mx-auto mt-3 max-w-xs text-base leading-7 text-white/70">
          {t.allSetDesc}
        </p>
      </div>

      {/* Mini profile preview */}
      <div className="glass-card mx-auto w-full max-w-xs rounded-[1.6rem] p-5">
        <div className="flex items-center gap-4">
          {photoPreview ? (
            <img src={photoPreview} alt="You" className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#E6A77A] to-[#e9c98b]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
          )}
          <div className="text-left">
            <div className="text-lg font-semibold text-white">{displayName || greetingName}</div>
            {bio ? <div className="mt-0.5 text-xs text-white/60 line-clamp-2">{bio}</div> : null}
          </div>
        </div>

        {selectedInterests.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {selectedInterests.map((interest) => (
              <span key={interest} className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-white/70">
                {interest}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-2 grid w-full max-w-xs gap-3">
        <button
          className="glow-button rounded-[1.3rem] px-6 py-4 text-base font-semibold text-white"
          onClick={() => router.push("/nearby")}
        >
          {t.goToRadar}
        </button>
        <Link
          className="rounded-[1.3rem] px-4 py-3 text-center text-sm text-white/50 underline underline-offset-4"
          href="/profile"
        >
          {t.editProfile}
        </Link>
      </div>
    </section>
  );
}
