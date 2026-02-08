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
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Language | null;
    if (stored) {
      setLanguageState(stored);
      document.documentElement.lang = stored;
      document.documentElement.dataset.lang = stored;
    } else {
      document.documentElement.lang = "en";
      document.documentElement.dataset.lang = "en";
    }
  }, []);

  const setLanguage = (value: Language) => {
    setLanguageState(value);
    window.localStorage.setItem(STORAGE_KEY, value);
    document.documentElement.lang = value;
    document.documentElement.dataset.lang = value;
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
