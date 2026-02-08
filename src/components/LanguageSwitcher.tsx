"use client";

import { useLanguage } from "@/contexts/LanguageContext";

const labels = {
  en: "EN",
  es: "ES",
  pl: "PL"
};

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="language-switcher">
      {Object.keys(labels).map((code) => (
        <button
          key={code}
          type="button"
          className={`lang-btn ${language === code ? "active" : ""}`}
          onClick={() => setLanguage(code as "en" | "es" | "pl")}
        >
          {labels[code as keyof typeof labels]}
        </button>
      ))}
    </div>
  );
}
