"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

export default function WeatherEffects() {
  const { theme } = useTheme();

  useEffect(() => {
    if (theme !== "brand") return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const interactive = target.closest(
        ".btn-primary, .btn-secondary, .theme-pill, .nav-link"
      );
      if (!interactive) return;

      const rect = interactive.getBoundingClientRect();
      const element = document.createElement("span");
      element.className = Math.random() > 0.75 ? "weather-leaf" : "weather-snow";
      element.style.left = `${rect.left + rect.width * Math.random()}px`;
      element.style.top = `${rect.top + rect.height * 0.3}px`;
      document.body.appendChild(element);
      element.addEventListener("animationend", () => element.remove());
    };

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [theme]);

  return null;
}
