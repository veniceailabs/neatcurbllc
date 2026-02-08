"use client";

import { useLanguage } from "@/components/language-context";

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="language-toggle">
      <button
        type="button"
        className={`lang-pill ${language === "en" ? "active" : ""}`}
        onClick={() => setLanguage("en")}
      >
        🇺🇸 EN
      </button>
      <button
        type="button"
        className={`lang-pill ${language === "es" ? "active" : ""}`}
        onClick={() => setLanguage("es")}
      >
        🇪🇸 ES
      </button>
    </div>
  );
}
