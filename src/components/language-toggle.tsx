"use client";

import { useEffect, useState } from "react";

type Language = "en" | "es";

export default function LanguageToggle() {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    const stored = localStorage.getItem("neatcurb-language") as Language | null;
    if (stored) setLanguage(stored);
  }, []);

  const handleChange = (next: Language) => {
    setLanguage(next);
    localStorage.setItem("neatcurb-language", next);
  };

  return (
    <div className="language-toggle">
      <button
        type="button"
        className={`lang-pill ${language === "en" ? "active" : ""}`}
        onClick={() => handleChange("en")}
      >
        🇺🇸 EN
      </button>
      <button
        type="button"
        className={`lang-pill ${language === "es" ? "active" : ""}`}
        onClick={() => handleChange("es")}
      >
        🇪🇸 ES
      </button>
    </div>
  );
}
