"use client";

import { createContext, useContext, useEffect, useState, type PropsWithChildren } from "react";

export type Locale = "en" | "de";

const STORAGE_KEY = "puqme.lang";

export const translations = {
  en: {
    // Navigation
    nearby: "Nearby",
    circle: "Circle",
    matches: "Matches",
    chat: "Chat",
    profile: "Profile",
    settings: "Settings",
    // Auth
    login: "Login",
    register: "Create account",
    logout: "Sign out",
    welcomeBack: "Welcome back",
    signIn: "Sign in",
    logoutDesc: "Log out of your account",
    // Settings
    settingsTitle: "Settings",
    language: "Language",
    languageDesc: "Choose your preferred language",
    visibility: "Profile visibility",
    visibilityDesc: "Controls whether you appear in the Radar.",
    onlyVerified: "Only verified profiles",
    onlyVerifiedDesc: "Higher trust quality in feed.",
    showGlobally: "Show me globally",
    showGloballyDesc: "Allow global Radar, not just local.",
    distance: "Distance radius",
    agePrefs: "Age preferences",
    // Common
    save: "Save",
    cancel: "Cancel",
    loading: "Loading...",
    error: "An error occurred",
    english: "English",
    german: "German",
  },
  de: {
    // Navigation
    nearby: "In der Nähe",
    circle: "Mein Kreis",
    matches: "Matches",
    chat: "Chat",
    profile: "Profil",
    settings: "Einstellungen",
    // Auth
    login: "Anmelden",
    register: "Konto erstellen",
    logout: "Abmelden",
    welcomeBack: "Willkommen zurück",
    signIn: "Anmelden",
    logoutDesc: "Von deinem Konto abmelden",
    // Settings
    settingsTitle: "Einstellungen",
    language: "Sprache",
    languageDesc: "Wähle deine bevorzugte Sprache",
    visibility: "Profil-Sichtbarkeit",
    visibilityDesc: "Steuert, ob du im Radar sichtbar bist.",
    onlyVerified: "Nur verifizierte Profile",
    onlyVerifiedDesc: "Höhere Vertrauensqualität im Feed.",
    showGlobally: "Global anzeigen",
    showGloballyDesc: "Globales Radar zulassen, nicht nur lokales.",
    distance: "Entfernungsradius",
    agePrefs: "Alterseinstellungen",
    // Common
    save: "Speichern",
    cancel: "Abbrechen",
    loading: "Wird geladen...",
    error: "Ein Fehler ist aufgetreten",
    english: "Englisch",
    german: "Deutsch",
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

  // Cookie takes priority (set when visiting /de or /en URL)
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

  // Then check localStorage
  const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
  if (stored === "de" || stored === "en") return stored;

  // Fall back to browser language
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
      // Also set cookie so server-side middleware can read it
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
