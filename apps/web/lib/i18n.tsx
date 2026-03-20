"use client";

import { createContext, useContext, useEffect, useState, type PropsWithChildren } from "react";

export type Locale = "en" | "de";

const STORAGE_KEY = "puqme.lang";

export const translations = {
  en: {
    // ── Navigation ──
    nearby: "Nearby",
    circle: "Circle",
    matches: "Matches",
    chat: "Chat",
    profile: "Profile",
    settings: "Settings",
    more: "More",

    // ── Auth ──
    login: "Login",
    loginTitle: "Welcome back",
    register: "Create account",
    registerTitle: "Join PuQ.me",
    logout: "Sign out",
    logoutDesc: "Log out of your account",
    signIn: "Sign in",
    emailLabel: "Email",
    passwordLabel: "Password",
    continueBtn: "Continue",
    loggingIn: "Logging in...",
    registering: "Creating account...",
    createAccountLink: "Create account",
    backToLogin: "Already have an account?",
    confirmPasswordLabel: "Confirm password",
    confirmPasswordPlaceholder: "Repeat password",
    passwordHint: "Min 10 chars, upper/lower, number, symbol",
    passwordsMismatch: "Passwords do not match.",
    quickStart: "Quick Start",
    registerDesc: "Create your profile and start meeting people nearby.",
    profilePictureRequired: "A profile picture is required.",
    registrationFailed: "Registration failed.",
    videoTooLarge: "Video must be under 50 MB.",
    nameMinChars: "Name needs at least 2 characters.",
    displayNameMinChars: "Display name needs at least 2 characters.",
    dobRequired: "Please enter your date of birth.",
    pickMinInterests: "Pick at least 3 interests.",
    couldNotSaveProfile: "Could not save profile.",
    couldNotLoadProfile: "Could not load profile.",
    couldNotLoadSettings: "Could not load settings.",
    couldNotSaveSettings: "Could not save settings.",
    couldNotSaveVisibility: "Could not save visibility.",
    visibilityUpdated: "Visibility updated.",
    radarSettingsSaved: "Radar settings saved.",
    couldNotLoadMatches: "Could not load matches.",
    couldNotLoadConversations: "Could not load conversations.",
    couldNotLoadMessages: "Could not load messages.",
    couldNotSendMessage: "Could not send message.",
    loginFailed: "Login failed.",
    googleLoginFailed: "Google Login failed.",
    signInFirst: "Please sign in first",
    signInFirstDesc: "Matches, chats and nearby will load after login.",
    offlineBanner: "Offline mode active. Cached screens remain available.",
    installTitle: "Install app",
    installDesc: "Fullscreen & Quick access",
    install: "Install",
    genderAll: "All",
    genderWomen: "Women",
    genderMen: "Men",
    genderOther: "Other",

    // ── Settings ──
    settingsTitle: "Settings",
    language: "Language",
    languageDesc: "Choose your preferred language",
    english: "English",
    german: "German",
    visibility: "Profile visibility",
    visibilityDesc: "Controls whether you appear in the Radar.",
    onlyVerified: "Only verified profiles",
    onlyVerifiedDesc: "Higher trust quality in feed.",
    showGlobally: "Show me globally",
    showGloballyDesc: "Allow global Radar, not just local.",
    distance: "Distance radius",
    agePrefs: "Age preferences",

    // ── Profile ──
    profileTitle: "Profile",
    profileSubtitle: "Your profile, visibility and key details",
    profileQuality: "Profile quality",
    profileQualityDesc: "The more complete your profile, the better it ranks in Nearby.",
    interestsLabel: "Interests",
    editProfile: "Edit profile",
    cityPending: "City pending",
    visible: "Visible",
    paused: "Paused",
    locationActive: "Location active",
    locationMissing: "Location missing",
    bioPending: "Your bio is missing. A strong first impression starts with two clear sentences.",
    loadingProfile: "Loading profile...",
    noInterests: "Interests will appear as your next data section.",

    // ── Matches ──
    matchesTitle: "Matches",
    matchesSubtitle: "People where it clicked on both sides",
    matchesLoading: "Loading matches...",
    matchesEmpty: "No matches yet. As soon as you like someone in the Radar and they like you back, they'll appear here.",
    unknown: "Unknown",
    bioMissing: "Bio coming soon.",

    // ── Chat ──
    chatTitle: "Chat",
    chatSubtitle: "Your conversations",
    chatsCount: "chats",
    unreadCount: "unread",
    sessionLive: "Session live",
    noNotifications: "No new notifications",
    noActiveChat: "No active chat",
    chooseChat: "Choose a conversation",
    openChat: "Open chat",
    send: "Send",
    sending: "Sending...",
    messagePlaceholder: "Write a message...",
    noConversation: "Select a conversation first",
    chatLoading: "Loading chat...",
    noMatchChat: "Once your first match chat exists, it will appear here.",

    // ── Onboarding ──
    onboardingWelcomeTitle: "Hi {name}!",
    onboardingWelcomeDesc: "Let's finish your profile so people can find and connect with you.",
    setupProfile: "Set up profile",
    skipForNow: "Skip for now",
    step1of2: "Step 1 of 2",
    showYourself: "Show yourself",
    showYourselfDesc: "Add a profile picture and an optional short video.",
    photoLabel: "Photo*",
    videoLabel: "Video",
    videoOptional: "optional · max 15s",
    videoReady: "Video ready",
    continueStep: "Continue",
    back: "Back",
    step2of2: "Step 2 of 2",
    fewDetails: "A few details",
    fewDetailsDesc: "Your name, a short bio, and what you're into.",
    nameLabel: "Name",
    namePlaceholder: "Your name",
    bioLabel: "Bio",
    bioPlaceholder: "Two sentences about you...",
    interestsStep: "Interests",
    finishProfile: "Finish profile",
    saving: "Saving...",
    allSet: "You're all set!",
    allSetDesc: "Your profile is live. People nearby can now find you.",
    goToRadar: "Go to Radar",

    // ── Radar / Swipe ──
    radarSubtitle: "Real profiles from the feed — swipe and get instant match feedback",
    radarLoading: "Loading radar...",
    deckEmpty: "Deck empty",
    deckEmptyDesc: "Your feed is ready. With more profiles, location and interests this will grow.",
    openCards: "{count} open",
    demoFeed: "Demo feed",
    liveFeed: "Live feed",
    fallbackActive: "Fallback active",
    apiActive: "API active",
    fallbackBanner: "This session uses local demo data. For real swipes and matches the production API must be reachable.",
    matchFeedback: "Match with {name}! Go to chat.",
    skippedFeedback: "{name} skipped.",
    likedFeedback: "{name} liked.",
    skip: "Skip",
    super: "Super",
    like: "Like",
    qualityLabel: "Quality {score}",
    activityLabel: "Active {score}",
    responseLabel: "Response {score}",
    feedLabel: "Feed {score}",
    couldNotLoadNearby: "Could not load nearby.",
    couldNotSaveSwipe: "Could not save swipe.",

    // ── Circle ──
    yourEncounters: "Your encounters",
    circleSubtitle: "Your encounters on a map or list — deliberately blurred for privacy",
    noEncounters: "No encounters found",
    noEncountersDesc: "Keep exploring. Nearby users appear here as blurred encounter zones.",
    detectingLocation: "Detecting location...",
    locationBlocked: "Location not shared",
    locationDetected: "Location: {city}",
    noEncountersPeriod: "No encounters in selected period",
    noEncountersPeriodDesc: "Try a longer time period or keep exploring with nearby enabled.",
    seenIn: "Seen in: {area}",
    timeWindow: "Time: {time}",
    blurredEncounter: "Blurred encounter in the same area. Exact locations and times are hidden for privacy.",

    // ── Settings subtitle ──
    radarPrivacySubtitle: "Real radar and privacy controls",

    // ── Profile Builder ──
    createProfileEyebrow: "Edit profile",
    createProfileTitle: "Show your best side",
    createProfileDesc: "A strong profile gets found more easily and builds trust.",
    keyDetails: "Key details",
    profileConnected: "Your profile is connected.",
    saveProfile: "Save profile",
    savingProfile: "Saving...",
    displayNamePlaceholder: "Display name",
    occupationPlaceholder: "Occupation",
    cityPlaceholder: "City",
    bioLongPlaceholder: "Short bio",

    // ── Push notifications ──
    pushTitle: "Push notifications",
    pushDesc: "Enable alerts for new matches, messages and updates.",
    pushStatus: "Status: {status}",
    pushEnable: "Enable",

    // ── Common ──
    save: "Save",
    cancel: "Cancel",
    loading: "Loading...",
    error: "An error occurred",
  },

  de: {
    // ── Navigation ──
    nearby: "In der Nähe",
    circle: "Mein Kreis",
    matches: "Matches",
    chat: "Chat",
    profile: "Profil",
    settings: "Einstellungen",
    more: "Mehr",

    // ── Auth ──
    login: "Anmelden",
    loginTitle: "Willkommen zurück",
    register: "Konto erstellen",
    registerTitle: "PuQ.me beitreten",
    logout: "Abmelden",
    logoutDesc: "Von deinem Konto abmelden",
    signIn: "Anmelden",
    emailLabel: "E-Mail",
    passwordLabel: "Passwort",
    continueBtn: "Weiter",
    loggingIn: "Anmeldung läuft...",
    registering: "Konto wird erstellt...",
    createAccountLink: "Konto erstellen",
    backToLogin: "Bereits ein Konto?",
    confirmPasswordLabel: "Passwort bestätigen",
    confirmPasswordPlaceholder: "Passwort wiederholen",
    passwordHint: "Mind. 10 Zeichen, Groß-/Kleinbuchstaben, Zahl, Symbol",
    passwordsMismatch: "Passwörter stimmen nicht überein.",
    quickStart: "Schnellstart",
    registerDesc: "Erstelle dein Profil und triff Menschen in deiner Nähe.",
    profilePictureRequired: "Ein Profilbild ist erforderlich.",
    registrationFailed: "Registrierung fehlgeschlagen.",
    videoTooLarge: "Video muss unter 50 MB sein.",
    nameMinChars: "Name benötigt mindestens 2 Zeichen.",
    displayNameMinChars: "Anzeigename benötigt mindestens 2 Zeichen.",
    dobRequired: "Bitte gib dein Geburtsdatum ein.",
    pickMinInterests: "Wähle mindestens 3 Interessen.",
    couldNotSaveProfile: "Profil konnte nicht gespeichert werden.",
    couldNotLoadProfile: "Profil konnte nicht geladen werden.",
    couldNotLoadSettings: "Einstellungen konnten nicht geladen werden.",
    couldNotSaveSettings: "Einstellungen konnten nicht gespeichert werden.",
    couldNotSaveVisibility: "Sichtbarkeit konnte nicht gespeichert werden.",
    visibilityUpdated: "Sichtbarkeit aktualisiert.",
    radarSettingsSaved: "Radar-Einstellungen gespeichert.",
    couldNotLoadMatches: "Matches konnten nicht geladen werden.",
    couldNotLoadConversations: "Gespräche konnten nicht geladen werden.",
    couldNotLoadMessages: "Nachrichten konnten nicht geladen werden.",
    couldNotSendMessage: "Nachricht konnte nicht gesendet werden.",
    loginFailed: "Anmeldung fehlgeschlagen.",
    googleLoginFailed: "Google-Anmeldung fehlgeschlagen.",
    signInFirst: "Bitte zuerst anmelden",
    signInFirstDesc: "Matches, Chats und Nearby laden nach dem Login.",
    offlineBanner: "Offline-Modus aktiv. Zwischengespeicherte Seiten sind weiterhin verfügbar.",
    installTitle: "App installieren",
    installDesc: "Vollbild & Schnellzugriff",
    install: "Installieren",
    genderAll: "Alle",
    genderWomen: "Frauen",
    genderMen: "Männer",
    genderOther: "Andere",

    // ── Settings ──
    settingsTitle: "Einstellungen",
    language: "Sprache",
    languageDesc: "Wähle deine bevorzugte Sprache",
    english: "Englisch",
    german: "Deutsch",
    visibility: "Profil-Sichtbarkeit",
    visibilityDesc: "Steuert, ob du im Radar sichtbar bist.",
    onlyVerified: "Nur verifizierte Profile",
    onlyVerifiedDesc: "Höhere Vertrauensqualität im Feed.",
    showGlobally: "Global anzeigen",
    showGloballyDesc: "Globales Radar zulassen, nicht nur lokales.",
    distance: "Entfernungsradius",
    agePrefs: "Alterseinstellungen",

    // ── Profile ──
    profileTitle: "Profil",
    profileSubtitle: "Dein Profil, Sichtbarkeit und Details",
    profileQuality: "Profilqualität",
    profileQualityDesc: "Je vollständiger dein Profil, desto besser rankst du in der Nähe.",
    interestsLabel: "Interessen",
    editProfile: "Profil bearbeiten",
    cityPending: "Stadt ausstehend",
    visible: "Sichtbar",
    paused: "Pausiert",
    locationActive: "Standort aktiv",
    locationMissing: "Kein Standort",
    bioPending: "Bio fehlt noch. Ein starker erster Eindruck beginnt mit zwei klaren Sätzen.",
    loadingProfile: "Profil wird geladen...",
    noInterests: "Interessen erscheinen als nächster Abschnitt.",

    // ── Matches ──
    matchesTitle: "Matches",
    matchesSubtitle: "Menschen, bei denen es auf beiden Seiten gepasst hat",
    matchesLoading: "Matches werden geladen...",
    matchesEmpty: "Noch keine Matches. Sobald du im Radar jemanden likst und derjenige zurückliked, erscheint er hier.",
    unknown: "Unbekannt",
    bioMissing: "Bio folgt.",

    // ── Chat ──
    chatTitle: "Chat",
    chatSubtitle: "Deine Unterhaltungen",
    chatsCount: "Chats",
    unreadCount: "ungelesen",
    sessionLive: "Session aktiv",
    noNotifications: "Keine neuen Benachrichtigungen",
    noActiveChat: "Kein aktiver Chat",
    chooseChat: "Wähle eine Unterhaltung",
    openChat: "Chat öffnen",
    send: "Senden",
    sending: "Senden...",
    messagePlaceholder: "Schreib eine Nachricht...",
    noConversation: "Erst einen Chat auswählen",
    chatLoading: "Chat wird geladen...",
    noMatchChat: "Sobald dein erster Match-Chat existiert, erscheint er hier.",

    // ── Onboarding ──
    onboardingWelcomeTitle: "Hi {name}!",
    onboardingWelcomeDesc: "Lass uns dein Profil fertigstellen, damit andere dich finden können.",
    setupProfile: "Profil einrichten",
    skipForNow: "Jetzt überspringen",
    step1of2: "Schritt 1 von 2",
    showYourself: "Zeig dich",
    showYourselfDesc: "Füge ein Profilbild und ein optionales kurzes Video hinzu.",
    photoLabel: "Foto*",
    videoLabel: "Video",
    videoOptional: "optional · max 15 Sek.",
    videoReady: "Video bereit",
    continueStep: "Weiter",
    back: "Zurück",
    step2of2: "Schritt 2 von 2",
    fewDetails: "Ein paar Details",
    fewDetailsDesc: "Dein Name, eine kurze Bio und deine Interessen.",
    nameLabel: "Name",
    namePlaceholder: "Dein Name",
    bioLabel: "Bio",
    bioPlaceholder: "Zwei Sätze über dich...",
    interestsStep: "Interessen",
    finishProfile: "Profil abschließen",
    saving: "Wird gespeichert...",
    allSet: "Alles fertig!",
    allSetDesc: "Dein Profil ist live. Personen in deiner Nähe können dich jetzt finden.",
    goToRadar: "Zum Radar",

    // ── Radar / Swipe ──
    radarSubtitle: "Echte Profile aus dem Feed — swipe und erhalte sofortiges Match-Feedback",
    radarLoading: "Radar wird geladen...",
    deckEmpty: "Keine Profile mehr",
    deckEmptyDesc: "Dein Feed ist bereit. Mit mehr Profilen, Standort und Interessen wird dieser wachsen.",
    openCards: "{count} offen",
    demoFeed: "Demo-Feed",
    liveFeed: "Live-Feed",
    fallbackActive: "Fallback aktiv",
    apiActive: "API aktiv",
    fallbackBanner: "Diese Session läuft mit lokalen Demo-Daten. Für echte Swipes und Matches muss die Produktiv-API erreichbar sein.",
    matchFeedback: "Match mit {name}! Jetzt in den Chat wechseln.",
    skippedFeedback: "{name} übersprungen.",
    likedFeedback: "{name} geliked.",
    skip: "Weiter",
    super: "Super",
    like: "Like",
    qualityLabel: "Qualität {score}",
    activityLabel: "Aktiv {score}",
    responseLabel: "Antwort {score}",
    feedLabel: "Feed {score}",
    couldNotLoadNearby: "Konnte Nearby nicht laden.",
    couldNotSaveSwipe: "Konnte Swipe nicht speichern.",

    // ── Circle ──
    yourEncounters: "Deine Begegnungen",
    circleSubtitle: "Deine Begegnungen auf Karte oder Liste — aus Datenschutzgründen verschwommen",
    noEncounters: "Keine Begegnungen gefunden",
    noEncountersDesc: "Erkunde weiter. Nutzer aus deiner Nähe erscheinen hier als verschwommene Begegnungszonen.",
    detectingLocation: "Standort wird ermittelt...",
    locationBlocked: "Standort nicht geteilt",
    locationDetected: "Standort: {city}",
    noEncountersPeriod: "Keine Begegnungen im gewählten Zeitraum",
    noEncountersPeriodDesc: "Wähle einen längeren Zeitraum oder erkunde weiter mit aktiviertem Nearby.",
    seenIn: "Gesehen in: {area}",
    timeWindow: "Zeitfenster: {time}",
    blurredEncounter: "Verschwommene Begegnung in der gleichen Gegend. Genaue Orte und Zeiten werden zum Datenschutz verborgen.",

    // ── Settings subtitle ──
    radarPrivacySubtitle: "Echte Radar- und Datenschutz-Einstellungen",

    // ── Profile Builder ──
    createProfileEyebrow: "Profil bearbeiten",
    createProfileTitle: "Zeig deine beste Seite",
    createProfileDesc: "Ein starkes Profil wird leichter gefunden und schafft Vertrauen.",
    keyDetails: "Wichtige Details",
    profileConnected: "Dein Profil ist verbunden.",
    saveProfile: "Profil speichern",
    savingProfile: "Wird gespeichert...",
    displayNamePlaceholder: "Anzeigename",
    occupationPlaceholder: "Beruf",
    cityPlaceholder: "Stadt",
    bioLongPlaceholder: "Kurze Bio",

    // ── Push notifications ──
    pushTitle: "Push-Benachrichtigungen",
    pushDesc: "Aktiviere Benachrichtigungen für neue Matches, Nachrichten und Updates.",
    pushStatus: "Status: {status}",
    pushEnable: "Aktivieren",

    // ── Common ──
    save: "Speichern",
    cancel: "Abbrechen",
    loading: "Wird geladen...",
    error: "Ein Fehler ist aufgetreten",
  },
} satisfies Record<Locale, Record<string, string>>;

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (typeof translations)["en"];
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function resolveInitialLocale(): Locale {
  if (typeof window === "undefined") return "en";

  const cookieLocale = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("puqme.lang="))
    ?.split("=")[1]
    ?.trim() as Locale | undefined;

  if (cookieLocale === "de" || cookieLocale === "en") {
    localStorage.setItem(STORAGE_KEY, cookieLocale);
    return cookieLocale;
  }

  const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
  if (stored === "de" || stored === "en") return stored;

  const browserLang = navigator.language?.split("-")[0];
  if (browserLang === "de") return "de";

  return "en";
}

export function LanguageProvider({ children }: PropsWithChildren) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    setLocaleState(resolveInitialLocale());
  }, []);

  function setLocale(next: Locale) {
    setLocaleState(next);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, next);
      document.cookie = `puqme.lang=${next};path=/;max-age=31536000;SameSite=Lax`;
    }
  }

  const value: LanguageContextValue = {
    locale,
    setLocale,
    t: translations[locale],
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
