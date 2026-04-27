
import { ComponentType } from "react";
import {
  S01_Lockscreen, S02_Splash, S03_Language, S04_Welcome,
  S05_ValueSlide1, S06_ValueSlide2, S07_ValueSlide3, S08_Privacy,
  S13_LocationPermission, S14_Notifications,
} from "./screens/onboarding";
import { S09_Login, S10_Register, S11_Forgot, S12_TwoFA } from "./screens/auth";
import {
  S15_StepBirthday, S16_StepGender, S17_StepPhotos1, S18_StepPhotosAI,
  S19_StepBio, S20_StepInterests, S21_StepIntent, S22_Filter,
  S33_VoiceIntroRec, S34_VoiceIntroPlay, S35_ProfilePreview,
} from "./screens/profile-create";
import {
  S23_Visibility1, S24_Visibility2, S25_Visibility3,
  S26_Visibility4, S27_Visibility5, S28_Visibility6,
} from "./screens/visibility";
import {
  S29_VerifyStart, S30_VerifySelfie, S31_VerifiedSuccess, S32_VerifyDoc,
} from "./screens/verification";
import {
  S36_BegegnungEmpty, S37_BegegnungEmptyRadius, S38_BegegnungActive,
  S41_EncounterDetail, S42_HelloReceived, S44_HelloSent, S54_NearbyGrid,
} from "./screens/encounter";
import {
  S39_DailyQuestion, S40_MagicMatch, S43_AICoach,
  S45_MatchModal, S46_SuperHello, S47_Treffpunkt,
  S48_AISuggestion, S49_MeetType, S50_RealMeet,
} from "./screens/ai-match";
import {
  S55_DiscoverOutside, S56_DiscoverProfile, S57_ChatDetail,
  S58_VoiceChat, S59_MatchesTab,
} from "./screens/chat";
import {
  S60_ProfilOverview, S61_ProfilEdit, S62_ProfileCheck,
  S63_MyCircle, S64_ThisWeek, S65_MyDay,
} from "./screens/profile-daily";
import {
  S51_DateCheck, S52_LiveLocation, S53_Emergency,
  S77_EncounterActions, S78_ReportStatus, S81_AccountSuspended,
} from "./screens/safety";
import {
  S66_Plus, S67_LikesYou, S68_Boost,
  S69_Stories, S70_Events, S71_Invite,
  S72_Settings, S73_AppLock, S74_Pause,
} from "./screens/premium-settings";
import {
  S75_NotifInbox, S76_LockPush, S79_Privacy,
  S80_DeleteAccount, S82_Maintenance, S83_Offline,
} from "./screens/system";

export type ScreenEntry = {
  slug: string;
  no: number;
  title: string;
  group: ScreenGroup;
  Component: ComponentType;
};

export type ScreenGroup =
  | "Lock & Splash"
  | "Onboarding"
  | "Auth & Security"
  | "Profile-Erstellung"
  | "Voice & Filter"
  | "Visibility (Sichtbarkeit)"
  | "Verification"
  | "Begegnung-Feed"
  | "Hello & Match"
  | "AI Match & Treffpunkt"
  | "Chat & Voice"
  | "Discover"
  | "Profil & Daily"
  | "Safety & SOS"
  | "Reports & Moderation"
  | "Premium"
  | "Stories & Events"
  | "Social & Settings"
  | "System & DSGVO";

export const SCREENS: ScreenEntry[] = [
  { no:  1, slug: "lockscreen",          title: "Lockscreen mit App-Icons",         group: "Lock & Splash",          Component: S01_Lockscreen },
  { no:  2, slug: "splash",              title: "Splash · PuQ.me",                  group: "Lock & Splash",          Component: S02_Splash },
  { no:  3, slug: "language",            title: "Sprachwahl (10 Sprachen)",         group: "Onboarding",             Component: S03_Language },
  { no:  4, slug: "welcome",             title: "Willkommen · Echte Begegnungen",   group: "Onboarding",             Component: S04_Welcome },
  { no:  5, slug: "value-slide-1",       title: "Wert-Slide 1 · Stadt",             group: "Onboarding",             Component: S05_ValueSlide1 },
  { no:  6, slug: "value-slide-2",       title: "Wert-Slide 2 · Begegnungen",       group: "Onboarding",             Component: S06_ValueSlide2 },
  { no:  7, slug: "value-slide-3",       title: "Wert-Slide 3 · Momente",           group: "Onboarding",             Component: S07_ValueSlide3 },
  { no:  8, slug: "privacy-intro",       title: "Privacy · Du behältst Kontrolle",  group: "Onboarding",             Component: S08_Privacy },
  { no:  9, slug: "login",               title: "Login",                            group: "Auth & Security",        Component: S09_Login },
  { no: 10, slug: "register",            title: "Create Account",                   group: "Auth & Security",        Component: S10_Register },
  { no: 11, slug: "forgot-password",     title: "Passwort vergessen",               group: "Auth & Security",        Component: S11_Forgot },
  { no: 12, slug: "two-factor",          title: "2-Faktor-Authentifizierung",       group: "Auth & Security",        Component: S12_TwoFA },
  { no: 13, slug: "permission-location", title: "Standort-Berechtigung",            group: "Onboarding",             Component: S13_LocationPermission },
  { no: 14, slug: "permission-notify",   title: "Notifications-Berechtigung",       group: "Onboarding",             Component: S14_Notifications },
  { no: 15, slug: "profile-birthday",    title: "Profil Step 2/8 · Birthday",       group: "Profile-Erstellung",     Component: S15_StepBirthday },
  { no: 16, slug: "profile-gender",      title: "Profil Step 3/8 · Gender",         group: "Profile-Erstellung",     Component: S16_StepGender },
  { no: 17, slug: "profile-photos-1",    title: "Profil · Fotos hochladen",         group: "Profile-Erstellung",     Component: S17_StepPhotos1 },
  { no: 18, slug: "profile-photos-ai",   title: "Profil Step 4/8 · AI Photo Check", group: "Profile-Erstellung",     Component: S18_StepPhotosAI },
  { no: 19, slug: "profile-bio",         title: "Profil Step 5/8 · Bio",            group: "Profile-Erstellung",     Component: S19_StepBio },
  { no: 20, slug: "profile-interests",   title: "Profil · Interessen",              group: "Profile-Erstellung",     Component: S20_StepInterests },
  { no: 21, slug: "profile-intent",      title: "Profil · Intent",                  group: "Profile-Erstellung",     Component: S21_StepIntent },
  { no: 22, slug: "filter",              title: "Filter / Suchpräferenzen",         group: "Voice & Filter",         Component: S22_Filter },
  { no: 23, slug: "visibility-1-mode",   title: "Visibility 1/6 · Mode",            group: "Visibility (Sichtbarkeit)", Component: S23_Visibility1 },
  { no: 24, slug: "visibility-2-to",     title: "Visibility 2/6 · Visible to",      group: "Visibility (Sichtbarkeit)", Component: S24_Visibility2 },
  { no: 25, slug: "visibility-3-gender", title: "Visibility 3/6 · Gender",          group: "Visibility (Sichtbarkeit)", Component: S25_Visibility3 },
  { no: 26, slug: "visibility-4-radius", title: "Visibility 4/6 · Radius",          group: "Visibility (Sichtbarkeit)", Component: S26_Visibility4 },
  { no: 27, slug: "visibility-5-time",   title: "Visibility 5/6 · Duration",        group: "Visibility (Sichtbarkeit)", Component: S27_Visibility5 },
  { no: 28, slug: "visibility-6-map",    title: "Visibility 6/6 · Karte+Summary",   group: "Visibility (Sichtbarkeit)", Component: S28_Visibility6 },
  { no: 29, slug: "verify-start",        title: "Verifikation Start",               group: "Verification",           Component: S29_VerifyStart },
  { no: 30, slug: "verify-selfie",       title: "Verifikation · Selfie-Scan",       group: "Verification",           Component: S30_VerifySelfie },
  { no: 31, slug: "verify-success",      title: "Verifikation · Erfolg",            group: "Verification",           Component: S31_VerifiedSuccess },
  { no: 32, slug: "verify-document",     title: "Verifikation · Dokumentwahl",      group: "Verification",           Component: S32_VerifyDoc },
  { no: 33, slug: "voice-rec",           title: "Voice-Intro · Aufnahme",           group: "Voice & Filter",         Component: S33_VoiceIntroRec },
  { no: 34, slug: "voice-play",          title: "Voice-Intro · Playback",           group: "Voice & Filter",         Component: S34_VoiceIntroPlay },
  { no: 35, slug: "profile-preview",     title: "Profile Preview",                  group: "Profile-Erstellung",     Component: S35_ProfilePreview },
  { no: 36, slug: "begegnung-empty-day1",title: "Begegnung · Empty Day 1",          group: "Begegnung-Feed",         Component: S36_BegegnungEmpty },
  { no: 37, slug: "begegnung-empty-rad", title: "Begegnung · Leerer Radius",        group: "Begegnung-Feed",         Component: S37_BegegnungEmptyRadius },
  { no: 38, slug: "begegnung-active",    title: "Begegnung · 247 aktiv",            group: "Begegnung-Feed",         Component: S38_BegegnungActive },
  { no: 39, slug: "daily-question",      title: "Frage des Tages",                  group: "AI Match & Treffpunkt",  Component: S39_DailyQuestion },
  { no: 40, slug: "magic-match",         title: "Magic-Match · Daily 3",            group: "AI Match & Treffpunkt",  Component: S40_MagicMatch },
  { no: 41, slug: "encounter-detail",    title: "Encounter Detail",                 group: "Begegnung-Feed",         Component: S41_EncounterDetail },
  { no: 42, slug: "hello-received",      title: "Hello Received (Marie)",           group: "Hello & Match",          Component: S42_HelloReceived },
  { no: 43, slug: "ai-coach",            title: "AI Coach · First Message",         group: "AI Match & Treffpunkt",  Component: S43_AICoach },
  { no: 44, slug: "hello-sent",          title: "Hallo wurde gesendet",             group: "Hello & Match",          Component: S44_HelloSent },
  { no: 45, slug: "match-modal",         title: "Match-Modal · Es ist ein Match",   group: "Hello & Match",          Component: S45_MatchModal },
  { no: 46, slug: "super-hello",         title: "Super-Hello (Premium)",            group: "Hello & Match",          Component: S46_SuperHello },
  { no: 47, slug: "treffpunkt",          title: "Treffpunkt-Vorschlag",             group: "AI Match & Treffpunkt",  Component: S47_Treffpunkt },
  { no: 48, slug: "ai-suggestion",       title: "AI Suggestion · 3 Places",         group: "AI Match & Treffpunkt",  Component: S48_AISuggestion },
  { no: 49, slug: "meet-type",           title: "Treffen-Wahl",                     group: "AI Match & Treffpunkt",  Component: S49_MeetType },
  { no: 50, slug: "real-meet",           title: "Echtes Treffen · Bestätigung",     group: "AI Match & Treffpunkt",  Component: S50_RealMeet },
  { no: 51, slug: "date-check-sos",      title: "Date-Check · SOS",                 group: "Safety & SOS",           Component: S51_DateCheck },
  { no: 52, slug: "live-location",       title: "Live Location",                    group: "Safety & SOS",           Component: S52_LiveLocation },
  { no: 53, slug: "emergency",           title: "Emergency · Notruf",               group: "Safety & SOS",           Component: S53_Emergency },
  { no: 54, slug: "nearby-grid",         title: "In der Nähe (Grid)",               group: "Begegnung-Feed",         Component: S54_NearbyGrid },
  { no: 55, slug: "discover-outside",    title: "Entdecken · Outside-Radius",       group: "Discover",               Component: S55_DiscoverOutside },
  { no: 56, slug: "discover-profile",    title: "Entdecken · Profile + Actions",    group: "Discover",               Component: S56_DiscoverProfile },
  { no: 57, slug: "chat-detail",         title: "Chat Detail",                      group: "Chat & Voice",           Component: S57_ChatDetail },
  { no: 58, slug: "voice-chat",          title: "Voice Chat · Live Recording",      group: "Chat & Voice",           Component: S58_VoiceChat },
  { no: 59, slug: "matches-tab",         title: "Matches / Chats / Wartet",         group: "Chat & Voice",           Component: S59_MatchesTab },
  { no: 60, slug: "profil-overview",     title: "Profil Übersicht",                 group: "Profil & Daily",         Component: S60_ProfilOverview },
  { no: 61, slug: "profil-edit",         title: "Profil bearbeiten",                group: "Profil & Daily",         Component: S61_ProfilEdit },
  { no: 62, slug: "profile-check",       title: "AI Profile Check · 7.2 / 10",      group: "Profil & Daily",         Component: S62_ProfileCheck },
  { no: 63, slug: "my-circle",           title: "My Circle · Karte",                group: "Profil & Daily",         Component: S63_MyCircle },
  { no: 64, slug: "this-week",           title: "This Week · KW 17",                group: "Profil & Daily",         Component: S64_ThisWeek },
  { no: 65, slug: "my-day",              title: "My Day · Streak & Goals",          group: "Profil & Daily",         Component: S65_MyDay },
  { no: 66, slug: "puq-plus",            title: "PuQ.me Plus",                      group: "Premium",                Component: S66_Plus },
  { no: 67, slug: "likes-you",           title: "Likes You (Plus)",                 group: "Premium",                Component: S67_LikesYou },
  { no: 68, slug: "boost",               title: "Boost",                            group: "Premium",                Component: S68_Boost },
  { no: 69, slug: "stories",             title: "Stories · Sunrise at Spreeufer",   group: "Stories & Events",       Component: S69_Stories },
  { no: 70, slug: "events",              title: "Events · 12 in deiner Stadt",      group: "Stories & Events",       Component: S70_Events },
  { no: 71, slug: "invite-friends",      title: "Invite Friends · QR + Referral",   group: "Stories & Events",       Component: S71_Invite },
  { no: 72, slug: "settings",            title: "Settings · Hauptmenü",             group: "Social & Settings",      Component: S72_Settings },
  { no: 73, slug: "app-lock",            title: "App Lock · Face-ID",               group: "Social & Settings",      Component: S73_AppLock },
  { no: 74, slug: "pause-mode",          title: "Pause-Mode aktivieren",            group: "Social & Settings",      Component: S74_Pause },
  { no: 75, slug: "notifications-inbox", title: "Notifications Inbox",              group: "System & DSGVO",         Component: S75_NotifInbox },
  { no: 76, slug: "lockscreen-push",     title: "Lockscreen mit Push",              group: "System & DSGVO",         Component: S76_LockPush },
  { no: 77, slug: "encounter-actions",   title: "Encounter · Actions",              group: "Reports & Moderation",   Component: S77_EncounterActions },
  { no: 78, slug: "report-status",       title: "Report-Status · #4732",            group: "Reports & Moderation",   Component: S78_ReportStatus },
  { no: 79, slug: "privacy-cockpit",     title: "Privacy · Daten-Cockpit",          group: "System & DSGVO",         Component: S79_Privacy },
  { no: 80, slug: "delete-account",      title: "Konto löschen · DSGVO Art. 17",    group: "System & DSGVO",         Component: S80_DeleteAccount },
  { no: 81, slug: "account-suspended",   title: "Konto temporär gesperrt",          group: "Reports & Moderation",   Component: S81_AccountSuspended },
  { no: 82, slug: "maintenance",         title: "Maintenance / Update",             group: "System & DSGVO",         Component: S82_Maintenance },
  { no: 83, slug: "offline",             title: "Offline · keine Verbindung",       group: "System & DSGVO",         Component: S83_Offline },
];

export const GROUPS: ScreenGroup[] = Array.from(new Set(SCREENS.map((s) => s.group)));
export function getScreen(slug: string): ScreenEntry | undefined {
  return SCREENS.find((s) => s.slug === slug);
}
