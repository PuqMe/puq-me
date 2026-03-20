"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { fetchMyProfile, type ProfileResponse } from "@/lib/profile";
import { useLanguage } from "@/lib/i18n";

/* ── Helpers ── */

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
    data.profile.isVisible,
  ];
  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
}

/* ── Inline SVG icons ── */

function CameraIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.4 }}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function LogOutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

/* ── Tappable row component ── */

function ProfileRow({
  href,
  icon,
  label,
  value,
  accent,
  danger,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  value?: string;
  accent?: boolean;
  danger?: boolean;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 16px",
        borderRadius: 16,
        background: "rgba(255,255,255,0.04)",
        textDecoration: "none",
        transition: "background 0.15s",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          background: danger ? "rgba(239,68,68,0.15)" : accent ? "rgba(168,85,247,0.15)" : "rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: danger ? "#ef4444" : accent ? "#a855f7" : "rgba(255,255,255,0.6)",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: danger ? "#ef4444" : "rgba(255,255,255,0.9)",
          }}
        >
          {label}
        </div>
        {value && (
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
            {value}
          </div>
        )}
      </div>
      <ChevronRight />
    </Link>
  );
}

/* ── Stat box component ── */

function StatBox({ number, label }: { number: string | number; label: string }) {
  return (
    <div style={{ flex: 1, textAlign: "center" }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: "white" }}>{number}</div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{label}</div>
    </div>
  );
}

/* ── i18n keys (profile-specific) ── */

const profileI18n = {
  en: {
    editPhoto: "Change photo",
    encounters: "Encounters",
    matchesStat: "Matches",
    level: "Level",
    completeProfile: "Complete your profile",
    completeProfileDesc: "Add more details to rank higher",
    editBio: "Edit bio & details",
    editBioDesc: "Name, birthday, occupation",
    editInterests: "Edit interests",
    editInterestsDesc: "Add your hobbies and passions",
    badgesAndLevel: "Badges & Level",
    badgesAndLevelDesc: "View achievements and progress",
    settingsRow: "Settings",
    settingsRowDesc: "Language, visibility, preferences",
    privacy: "Privacy policy",
    privacyDesc: "GDPR & data protection",
    deleteAccount: "Delete account",
    deleteAccountDesc: "Permanently delete all data",
    signOut: "Sign out",
    signOutDesc: "Log out of your account",
    profileSection: "Profile",
    accountSection: "Account",
    version: "PuQ.me v1.0",
  },
  de: {
    editPhoto: "Foto ändern",
    encounters: "Begegnungen",
    matchesStat: "Matches",
    level: "Level",
    completeProfile: "Profil vervollständigen",
    completeProfileDesc: "Mehr Details = besseres Ranking",
    editBio: "Bio & Details bearbeiten",
    editBioDesc: "Name, Geburtstag, Beruf",
    editInterests: "Interessen bearbeiten",
    editInterestsDesc: "Hobbys und Leidenschaften",
    badgesAndLevel: "Badges & Level",
    badgesAndLevelDesc: "Erfolge und Fortschritt ansehen",
    settingsRow: "Einstellungen",
    settingsRowDesc: "Sprache, Sichtbarkeit, Präferenzen",
    privacy: "Datenschutz",
    privacyDesc: "DSGVO & Datenschutzerklärung",
    deleteAccount: "Konto löschen",
    deleteAccountDesc: "Alle Daten dauerhaft löschen",
    signOut: "Abmelden",
    signOutDesc: "Von deinem Konto abmelden",
    profileSection: "Profil",
    accountSection: "Konto",
    version: "PuQ.me v1.0",
  },
};

/* ── Main Component ── */

export function ProfileOverview() {
  const { t, locale } = useLanguage();
  const pt = profileI18n[locale] || profileI18n.en;
  const [data, setData] = useState<ProfileResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const nextData = await fetchMyProfile();
        if (!cancelled) setData(nextData);
      } catch (error) {
        if (!cancelled) setErrorMessage(error instanceof Error ? error.message : t.couldNotLoadProfile);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const completionScore = useMemo(() => (data ? calculateCompletionScore(data) : 0), [data]);
  const age = data?.profile.birthDate ? calculateAge(data.profile.birthDate) : null;

  // Stats
  const xpData = typeof window !== "undefined" ? localStorage.getItem("puqme.xp") : null;
  const levelNum = xpData ? JSON.parse(xpData).level || 1 : 1;

  return (
    <AppShell active="/profile" title={t.profileTitle} subtitle={t.profileSubtitle}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingBottom: 80 }}>

        {/* ── Hero: Photo + Name + Stats ── */}
        <div
          style={{
            background: "linear-gradient(180deg, rgba(168,85,247,0.12) 0%, rgba(7,5,15,0) 100%)",
            borderRadius: 24,
            padding: "24px 20px 20px",
          }}
        >
          {/* Loading skeleton */}
          {!data && !errorMessage && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, opacity: 0.5 }}>
              <div style={{ width: 88, height: 88, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
              <div style={{ width: 120, height: 20, borderRadius: 8, background: "rgba(255,255,255,0.06)" }} />
              <div style={{ width: 180, height: 14, borderRadius: 6, background: "rgba(255,255,255,0.04)" }} />
            </div>
          )}

          {errorMessage && (
            <div style={{ textAlign: "center", fontSize: 13, color: "#ffb4c7", padding: "20px 0" }}>{errorMessage}</div>
          )}

          {data && (
            <>
              {/* Centered photo + name */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                {/* Tappable photo */}
                <Link href="/profile/create" style={{ position: "relative", textDecoration: "none" }}>
                  {data.profile.photoUrl ? (
                    <img
                      src={data.profile.photoUrl}
                      alt={data.profile.displayName}
                      style={{
                        width: 88,
                        height: 88,
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "3px solid rgba(168,85,247,0.4)",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 88,
                        height: 88,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #E6A77A, #e9c98b)",
                        border: "3px solid rgba(168,85,247,0.4)",
                      }}
                    />
                  )}
                  {/* Camera overlay */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "#a855f7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      border: "2px solid #07050f",
                    }}
                  >
                    <CameraIcon />
                  </div>
                </Link>

                {/* Name + subtitle */}
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "white" }}>
                    {data.profile.displayName}{age ? `, ${age}` : ""}
                  </div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
                    {data.profile.city ?? t.cityPending}
                    {" · "}
                    {data.profile.isVisible ? t.visible : t.paused}
                  </div>
                  {data.profile.bio && (
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 8, lineHeight: 1.5, maxWidth: 280 }}>
                      {data.profile.bio}
                    </div>
                  )}
                </div>

                {/* Edit profile button */}
                <Link
                  href="/profile/create"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 20px",
                    borderRadius: 20,
                    background: "rgba(168,85,247,0.2)",
                    border: "1px solid rgba(168,85,247,0.3)",
                    color: "#c084fc",
                    fontSize: 13,
                    fontWeight: 600,
                    textDecoration: "none",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(168,85,247,0.35)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(168,85,247,0.2)")}
                >
                  <EditIcon />
                  {t.editProfile}
                </Link>
              </div>

              {/* Stats row */}
              <div
                style={{
                  display: "flex",
                  marginTop: 20,
                  padding: "14px 0",
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <StatBox number="—" label={pt.encounters} />
                <div style={{ width: 1, background: "rgba(255,255,255,0.08)" }} />
                <StatBox number="—" label={pt.matchesStat} />
                <div style={{ width: 1, background: "rgba(255,255,255,0.08)" }} />
                <StatBox number={levelNum} label={pt.level} />
              </div>
            </>
          )}
        </div>

        {/* ── Profile Quality Bar ── */}
        {data && completionScore < 100 && (
          <Link
            href="/profile/create"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 16px",
              borderRadius: 16,
              background: "rgba(168,85,247,0.08)",
              border: "1px solid rgba(168,85,247,0.15)",
              textDecoration: "none",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(168,85,247,0.15)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(168,85,247,0.08)")}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#c084fc" }}>
                  {pt.completeProfile}
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#c084fc" }}>{completionScore}%</div>
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                {pt.completeProfileDesc}
              </div>
              <div style={{ marginTop: 8, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)" }}>
                <div
                  style={{
                    height: 4,
                    borderRadius: 2,
                    background: "linear-gradient(90deg, #a855f7, #c084fc)",
                    width: `${completionScore}%`,
                    transition: "width 0.3s",
                  }}
                />
              </div>
            </div>
            <ChevronRight />
          </Link>
        )}

        {/* ── Profile Section ── */}
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1.5, paddingLeft: 4, marginBottom: 8 }}>
            {pt.profileSection}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <ProfileRow
              href="/profile/create"
              icon={<EditIcon />}
              label={pt.editBio}
              value={pt.editBioDesc}
            />
            <ProfileRow
              href="/profile/create"
              icon={<StarIcon />}
              label={pt.editInterests}
              value={data?.interests.length ? data.interests.slice(0, 3).join(", ") + (data.interests.length > 3 ? ` +${data.interests.length - 3}` : "") : pt.editInterestsDesc}
            />
            <ProfileRow
              href="/badges"
              icon={<TrophyIcon />}
              label={pt.badgesAndLevel}
              value={`Level ${levelNum} · ${pt.badgesAndLevelDesc}`}
              accent
            />
          </div>
        </div>

        {/* ── Account Section ── */}
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1.5, paddingLeft: 4, marginBottom: 8 }}>
            {pt.accountSection}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <ProfileRow
              href="/settings"
              icon={<GearIcon />}
              label={pt.settingsRow}
              value={pt.settingsRowDesc}
            />
            <ProfileRow
              href="/privacy"
              icon={<ShieldIcon />}
              label={pt.privacy}
              value={pt.privacyDesc}
            />
            <ProfileRow
              href="/delete-account"
              icon={<TrashIcon />}
              label={pt.deleteAccount}
              value={pt.deleteAccountDesc}
              danger
            />
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{ textAlign: "center", padding: "24px 0 8px", fontSize: 11, color: "rgba(255,255,255,0.2)" }}>
          {pt.version}
        </div>
      </div>
    </AppShell>
  );
}
