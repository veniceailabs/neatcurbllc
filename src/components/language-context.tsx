"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Language = "en" | "es";

type LanguageContextValue = {
  language: Language;
  setLanguage: (value: Language) => void;
};

const LanguageContext = createContext<LanguageContextValue>({
  language: "en",
  setLanguage: () => {}
});

const STORAGE_KEY = "neatcurb-language";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === "undefined") return "en";
    const stored = window.localStorage.getItem(STORAGE_KEY) as Language | null;
    return stored === "en" || stored === "es" ? stored : "en";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
    document.documentElement.dataset.lang = language;
  }, [language]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && (event.newValue === "en" || event.newValue === "es")) {
        setLanguageState(event.newValue);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setLanguage = (value: Language) => {
    setLanguageState(value);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
