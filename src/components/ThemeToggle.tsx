"use client";

import { useTheme } from "@/contexts/ThemeContext";

const themeIcons = {
  light: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 3v18M6 6l12 12M18 6L6 18M4 12h16M7.5 4.5l9 15M16.5 4.5l-9 15"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  ),
  dark: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M20 15.4A8 8 0 1 1 8.6 4a7 7 0 0 0 11.4 11.4z"
        fill="currentColor"
      />
    </svg>
  ),
  brand: (
    <img
      src="/brand/neat-curb-logo.svg"
      alt=""
      style={{ width: "18px", height: "18px" }}
    />
  )
};

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const nextLabel =
    theme === "light" ? "Dark" : theme === "dark" ? "Brand" : "Light";

  return (
    <button className="theme-toggle" onClick={toggleTheme} type="button">
      <span className="theme-icon">{themeIcons[theme]}</span>
      <span>{nextLabel} Mode</span>
    </button>
  );
}
