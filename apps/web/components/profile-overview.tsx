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
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age -= 1;
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
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

/* ── SVG Icons (16px) ── */
const icons = {
  camera: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  chevron: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ opacity: 0.3 }}><polyline points="9 18 15 12 9 6"/></svg>,
  edit: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  star: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  trophy: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>,
  gear: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v2m0 18v2m-7.07-3.93l1.41-1.41m11.32-11.32l1.41-1.41M1 12h2m18 0h2m-3.93 7.07l-1.41-1.41M4.34 4.34l1.41 1.41"/></svg>,
  shield: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  trash: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  eye: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  share: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  zap: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  fire: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 23c-3.6 0-8-2.9-8-8.3C4 9.4 8.3 3.2 12 1c3.7 2.2 8 8.4 8 13.7 0 5.4-4.4 8.3-8 8.3zm0-4c1.7 0 3-1.3 3-3 0-2-1.5-4-3-5.5C10.5 12 9 14 9 16c0 1.7 1.3 3 3 3z"/></svg>,
  check: () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>,
};

/* ── i18n ── */
const pt = {
  en: {
    encounters: "Encounters", crossingsToday: "Today", matches: "Matches",
    profileViews: "profile views this week", editProfile: "Edit Profile",
    shareProfile: "Share", completeProfile: "Complete your profile",
    completeDesc: "More details = higher in Nearby ranking",
    recentEncounters: "Recent encounters", viewAll: "View all",
    noEncountersYet: "No encounters yet — explore Nearby to start meeting people!",
    profileSection: "PROFILE", accountSection: "ACCOUNT",
    editBio: "Bio & Details", editBioDesc: "Name, birthday, occupation",
    editInterests: "Interests", editInterestsDesc: "Add your hobbies",
    badgesLevel: "Badges & Level",
    settings: "Settings", settingsDesc: "Language, visibility, preferences",
    privacy: "Privacy", privacyDesc: "GDPR & data protection",
    deleteAccount: "Delete account", deleteAccountDesc: "Permanently delete all data",
    verified: "Verified", streak: "Streak",
    version: "PuQ.me v1.0 · Made in Berlin",
  },
  de: {
    encounters: "Begegnungen", crossingsToday: "Heute", matches: "Matches",
    profileViews: "Profilaufrufe diese Woche", editProfile: "Profil bearbeiten",
    shareProfile: "Teilen", completeProfile: "Profil vervollständigen",
    completeDesc: "Mehr Details = höher im Nearby-Ranking",
    recentEncounters: "Letzte Begegnungen", viewAll: "Alle ansehen",
    noEncountersYet: "Noch keine Begegnungen — erkunde Nearby und triff neue Leute!",
    profileSection: "PROFIL", accountSection: "KONTO",
    editBio: "Bio & Details", editBioDesc: "Name, Geburtstag, Beruf",
    editInterests: "Interessen", editInterestsDesc: "Füge deine Hobbys hinzu",
    badgesLevel: "Badges & Level",
    settings: "Einstellungen", settingsDesc: "Sprache, Sichtbarkeit, Präferenzen",
    privacy: "Datenschutz", privacyDesc: "DSGVO & Datenschutzerklärung",
    deleteAccount: "Konto löschen", deleteAccountDesc: "Alle Daten dauerhaft löschen",
    verified: "Verifiziert", streak: "Streak",
    version: "PuQ.me v1.0 · Made in Berlin",
  },
};

/* ── Demo encounter data ── */
const demoEncounters = [
  { id: "demo-1", name: "Maya", initial: "M", color: "#06b6d4" },
  { id: "maya-1", name: "Noor", initial: "N", color: "#06b6d4" },
  { id: "demo-3", name: "LK", initial: "L", color: "#8b5cf6" },
  { id: "demo-4", name: "EM", initial: "E", color: "#a855f7" },
  { id: "demo-5", name: "SV", initial: "S", color: "#10b981" },
];

/* ── Reusable Components ── */

function ProfileRow({ href, icon, label, value, accent, danger }: {
  href: string; icon: React.ReactNode; label: string; value?: string; accent?: boolean; danger?: boolean;
}) {
  const bg = "rgba(255,255,255,0.03)";
  const hoverBg = "rgba(255,255,255,0.07)";
  return (
    <Link href={href} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 14px", borderRadius: 14, background: bg, textDecoration: "none", transition: "background 0.15s" }}
      onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
      onMouseLeave={e => (e.currentTarget.style.background = bg)}>
      <div style={{ width: 34, height: 34, borderRadius: 10, background: danger ? "rgba(239,68,68,0.12)" : accent ? "rgba(168,85,247,0.12)" : "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", color: danger ? "#ef4444" : accent ? "#a855f7" : "rgba(255,255,255,0.5)", flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: danger ? "#ef4444" : "rgba(255,255,255,0.88)" }}>{label}</div>
        {value && <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>{value}</div>}
      </div>
      <icons.chevron />
    </Link>
  );
}

/* ── Main Component ── */

export function ProfileOverview() {
  const { t, locale } = useLanguage();
  const tx = pt[locale] || pt.en;
  const [data, setData] = useState<ProfileResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const d = await fetchMyProfile();
        if (!cancelled) setData(d);
      } catch (error) {
        if (!cancelled) setErrorMessage(error instanceof Error ? error.message : t.couldNotLoadProfile);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const score = useMemo(() => (data ? calculateCompletionScore(data) : 0), [data]);
  const age = data?.profile.birthDate ? calculateAge(data.profile.birthDate) : null;
  const xp = typeof window !== "undefined" ? localStorage.getItem("puqme.xp") : null;
  const level = xp ? (JSON.parse(xp).level || 1) : 1;
  const profileViews = 24; // Demo — would come from API

  return (
    <AppShell active="/profile" title={t.profileTitle} subtitle={t.profileSubtitle}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingBottom: 80 }}>

        {/* ━━━ HERO SECTION ━━━ */}
        <div style={{ borderRadius: 24, padding: "28px 20px 0", background: "linear-gradient(180deg, rgba(168,85,247,0.10) 0%, transparent 100%)" }}>

          {/* Loading */}
          {!data && !errorMessage && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "20px 0 24px", opacity: 0.4 }}>
              <div style={{ width: 96, height: 96, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
              <div style={{ width: 140, height: 22, borderRadius: 8, background: "rgba(255,255,255,0.05)" }} />
            </div>
          )}

          {errorMessage && <div style={{ textAlign: "center", fontSize: 13, color: "#ffb4c7", padding: "30px 0" }}>{errorMessage}</div>}

          {data && (
            <>
              {/* Photo centered */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Link href="/profile/create" style={{ position: "relative", textDecoration: "none" }}>
                  {data.profile.photoUrl ? (
                    <img src={data.profile.photoUrl} alt="" style={{ width: 96, height: 96, borderRadius: "50%", objectFit: "cover", border: "3px solid rgba(168,85,247,0.5)" }} />
                  ) : (
                    <div style={{ width: 96, height: 96, borderRadius: "50%", background: "linear-gradient(135deg, #E6A77A, #e9c98b)", border: "3px solid rgba(168,85,247,0.5)" }} />
                  )}
                  <div style={{ position: "absolute", bottom: -2, right: -2, width: 30, height: 30, borderRadius: "50%", background: "#a855f7", display: "flex", alignItems: "center", justifyContent: "center", color: "white", border: "3px solid #07050f" }}>
                    <icons.camera />
                  </div>
                </Link>

                {/* Name + badges */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14 }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: "white", letterSpacing: "-0.02em" }}>
                    {data.profile.displayName}{age ? `, ${age}` : ""}
                  </div>
                </div>

                {/* Trust badges row */}
                <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "3px 8px", borderRadius: 8, background: "rgba(168,85,247,0.15)", fontSize: 10.5, fontWeight: 600, color: "#c084fc" }}>
                    <icons.zap /> Level {level}
                  </span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "3px 8px", borderRadius: 8, background: "rgba(16,185,129,0.12)", fontSize: 10.5, fontWeight: 600, color: "#34d399" }}>
                    <icons.check /> {tx.verified}
                  </span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "3px 8px", borderRadius: 8, background: "rgba(251,146,60,0.12)", fontSize: 10.5, fontWeight: 600, color: "#fb923c" }}>
                    <icons.fire /> {tx.streak}
                  </span>
                </div>

                {/* Subtitle */}
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 8 }}>
                  {data.profile.city ?? t.cityPending} · {data.profile.isVisible ? t.visible : t.paused}
                </div>

                {/* Bio */}
                {data.profile.bio && (
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginTop: 8, lineHeight: 1.6, textAlign: "center", maxWidth: 300 }}>
                    {data.profile.bio}
                  </div>
                )}
              </div>

              {/* ━━━ STATS ROW (Happn-style encounter metrics) ━━━ */}
              <div style={{ display: "flex", marginTop: 20, padding: "16px 0", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <Link href="/circle" style={{ flex: 1, display: "block", textAlign: "center", textDecoration: "none", padding: "4px 0", borderRadius: 8, transition: "background 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: "white" }}>12</div>
                  <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.4)", marginTop: 2, textTransform: "uppercase", letterSpacing: 0.5 }}>{tx.encounters}</div>
                </Link>
                <div style={{ width: 1, background: "rgba(255,255,255,0.06)" }} />
                <Link href="/circle" style={{ flex: 1, display: "block", textAlign: "center", textDecoration: "none", padding: "4px 0", borderRadius: 8, transition: "background 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: "white" }}>3</div>
                  <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.4)", marginTop: 2, textTransform: "uppercase", letterSpacing: 0.5 }}>{tx.crossingsToday}</div>
                </Link>
                <div style={{ width: 1, background: "rgba(255,255,255,0.06)" }} />
                <Link href="/matches" style={{ flex: 1, display: "block", textAlign: "center", textDecoration: "none", padding: "4px 0", borderRadius: 8, transition: "background 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: "white" }}>2</div>
                  <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.4)", marginTop: 2, textTransform: "uppercase", letterSpacing: 0.5 }}>{tx.matches}</div>
                </Link>
              </div>
            </>
          )}
        </div>

        {/* ━━━ PRIMARY ACTIONS (2 big buttons — like Bumble) ━━━ */}
        {data && (
          <div style={{ display: "flex", gap: 8, padding: "0 2px" }}>
            <Link href="/profile/create" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "12px 0", borderRadius: 14, background: "rgba(168,85,247,0.18)", border: "1px solid rgba(168,85,247,0.25)", color: "#c084fc", fontSize: 13.5, fontWeight: 600, textDecoration: "none", transition: "background 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(168,85,247,0.28)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(168,85,247,0.18)")}>
              <icons.edit /> {tx.editProfile}
            </Link>
            <Link href="/nearby" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "12px 0", borderRadius: 14, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)", fontSize: 13.5, fontWeight: 600, textDecoration: "none", transition: "background 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}>
              <icons.share /> {tx.shareProfile}
            </Link>
          </div>
        )}

        {/* ━━━ PROFILE VIEWS (Engagement hook — like Happn) ━━━ */}
        {data && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 12, background: "rgba(255,255,255,0.02)" }}>
            <div style={{ color: "rgba(168,85,247,0.6)" }}><icons.eye /></div>
            <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.4)" }}>
              <span style={{ color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>{profileViews}</span> {tx.profileViews}
            </div>
          </div>
        )}

        {/* ━━━ COMPLETION QUEST (only if < 100%) ━━━ */}
        {data && score < 100 && (
          <Link href="/profile/create" style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 14px", borderRadius: 14, background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.12)", textDecoration: "none", transition: "background 0.15s" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(168,85,247,0.12)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(168,85,247,0.06)")}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#c084fc" }}>{tx.completeProfile}</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: "#c084fc" }}>{score}%</span>
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 3 }}>{tx.completeDesc}</div>
              <div style={{ marginTop: 8, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.05)" }}>
                <div style={{ height: 3, borderRadius: 2, background: "linear-gradient(90deg, #a855f7, #c084fc)", width: `${score}%`, transition: "width 0.4s" }} />
              </div>
            </div>
            <icons.chevron />
          </Link>
        )}

        {/* ━━━ RECENT ENCOUNTERS (keeps users on profile) ━━━ */}
        {data && (
          <div style={{ padding: "6px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 4px", marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1.5 }}>{tx.recentEncounters}</div>
              <Link href="/circle" style={{ fontSize: 11, color: "#a855f7", fontWeight: 600, textDecoration: "none" }}>{tx.viewAll}</Link>
            </div>
            <div style={{ display: "flex", gap: 12, overflowX: "auto", padding: "4px 4px 8px", scrollbarWidth: "none" }}>
              {demoEncounters.map(enc => (
                <Link key={enc.id} href={`/encounter/${enc.id}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, textDecoration: "none", flexShrink: 0 }}>
                  <div style={{ width: 52, height: 52, borderRadius: "50%", background: `${enc.color}22`, border: `2px solid ${enc.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 600, color: enc.color, transition: "transform 0.15s" }}
                    onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.1)")}
                    onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}>
                    {enc.initial}
                  </div>
                  <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>{enc.name}</div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ━━━ PROFILE SECTION ━━━ */}
        <div style={{ marginTop: 4 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: 1.5, paddingLeft: 4, marginBottom: 6 }}>
            {tx.profileSection}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <ProfileRow href="/profile/create" icon={<icons.edit />} label={tx.editBio} value={tx.editBioDesc} />
            <ProfileRow href="/profile/create" icon={<icons.star />} label={tx.editInterests}
              value={data?.interests.length ? data.interests.slice(0, 3).join(", ") + (data.interests.length > 3 ? ` +${data.interests.length - 3}` : "") : tx.editInterestsDesc} />
            <ProfileRow href="/badges" icon={<icons.trophy />} label={tx.badgesLevel} value={`Level ${level}`} accent />
          </div>
        </div>

        {/* ━━━ ACCOUNT SECTION ━━━ */}
        <div style={{ marginTop: 4 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: 1.5, paddingLeft: 4, marginBottom: 6 }}>
            {tx.accountSection}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <ProfileRow href="/settings" icon={<icons.gear />} label={tx.settings} value={tx.settingsDesc} />
            <ProfileRow href="/privacy" icon={<icons.shield />} label={tx.privacy} value={tx.privacyDesc} />
            <ProfileRow href="/delete-account" icon={<icons.trash />} label={tx.deleteAccount} value={tx.deleteAccountDesc} danger />
          </div>
        </div>

        {/* ━━━ FOOTER ━━━ */}
        <div style={{ textAlign: "center", padding: "20px 0 4px", fontSize: 11, color: "rgba(255,255,255,0.15)" }}>
          {tx.version}
        </div>
      </div>
    </AppShell>
  );
}
