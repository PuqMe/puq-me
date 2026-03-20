"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card } from "@puqme/ui";
import { fetchMyProfile, type ProfileResponse } from "@/lib/profile";
import { useLanguage } from "@/lib/i18n";

function calculateAge(birthDate: string) {
  const today = new Date();
  const birth = new Date(birthDate);

  let age = today.getFullYear() - birth.getFullYear();
  const monthDelta = today.getMonth() - birth.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }

  return age;
}

function calculateCompletionScore(data: ProfileResponse) {
  const checks = [
    Boolean(data.profile.displayName),
    Boolean(data.profile.birthDate),
    Boolean(data.profile.bio),
    Boolean(data.profile.occupation),
    Boolean(data.profile.city),
    data.interests.length > 0,
    Boolean(data.location),
    data.profile.isVisible
  ];

  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
}

export function ProfileOverview() {
  const { t } = useLanguage();
  const [data, setData] = useState<ProfileResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const nextData = await fetchMyProfile();
        if (!cancelled) {
          setData(nextData);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error instanceof Error ? error.message : t.couldNotLoadProfile);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const completionScore = useMemo(() => (data ? calculateCompletionScore(data) : 0), [data]);
  const age = data?.profile.birthDate ? calculateAge(data.profile.birthDate) : null;

  return (
    <AppShell active="/profile" title={t.profileTitle} subtitle={t.profileSubtitle}>
      <section className="grid gap-4">
        <Card className="mesh-panel rounded-[2rem] p-5 text-white">
          {!data && !errorMessage ? (
            <div className="text-sm text-white/72">{t.loadingProfile}</div>
          ) : null}

          {errorMessage ? <div className="text-sm text-[#ffb4c7]">{errorMessage}</div> : null}

          {data ? (
            <div className="flex items-start gap-4">
              {data.profile.photoUrl ? (
                <img
                  src={data.profile.photoUrl}
                  alt={data.profile.displayName}
                  className="h-24 w-20 rounded-[1.5rem] object-cover"
                />
              ) : (
                <div className="h-24 w-20 rounded-[1.5rem] bg-gradient-to-br from-[#E6A77A] to-[#e9c98b]" />
              )}
              <div className="flex-1">
                <div className="text-2xl font-semibold text-white">
                  {data.profile.displayName}
                  {age ? `, ${age}` : ""}
                </div>
                <div className="mt-1 text-sm text-white/68">
                  {data.profile.city ?? t.cityPending}
                  {" · "}
                  {data.profile.isVisible ? t.visible : t.paused}
                  {" · "}
                  {data.location ? t.locationActive : t.locationMissing}
                </div>
                <p className="mt-3 text-sm leading-6 text-white/74">
                  {data.profile.bio ?? t.bioPending}
                </p>
                <Link className="mt-4 inline-flex rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-white" href="/profile/create">
                  {t.editProfile}
                </Link>
              </div>
            </div>
          ) : null}
        </Card>

        <Card className="glass-card rounded-[2rem] p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-white">{t.profileQuality}</div>
              <div className="mt-1 text-sm text-white/68">{t.profileQualityDesc}</div>
            </div>
            <div className="text-3xl font-semibold text-white">{completionScore}</div>
          </div>
          <div className="mt-4 h-2 rounded-full bg-black/10">
            <div className="h-2 rounded-full bg-gradient-to-r from-[#1F8F62] to-[#9FC8B1]" style={{ width: `${completionScore}%` }} />
          </div>
        </Card>

        <Card className="glass-card rounded-[2rem] p-5 text-white">
          <div className="text-sm font-semibold text-white">{t.interestsLabel}</div>
          <div className="mt-4 flex flex-wrap gap-2">
            {data?.interests.length ? (
              data.interests.map((interest) => (
                <span key={interest} className="rounded-full bg-white/10 px-3 py-2 text-xs font-medium text-white/82">
                  {interest}
                </span>
              ))
            ) : (
              <span className="text-sm text-white/65">{t.noInterests}</span>
            )}
          </div>
        </Card>
      </section>
    </AppShell>
  );
}
