"use client";

import { useTheme } from "next-themes";
import { Moon, Snowflake, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type ThemeMode = "light" | "dark" | "brand";

const nextTheme = (theme: ThemeMode) =>
  theme === "light" ? "dark" : theme === "dark" ? "brand" : "light";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const current = (theme as ThemeMode) || "brand";
  const label = current === "light" ? "Light" : current === "dark" ? "Dark" : "Brand";

  return (
    <button
      className="theme-toggle"
      type="button"
      onClick={() => setTheme(nextTheme(current))}
      aria-label="Toggle theme"
    >
      {current === "light" ? <Sun size={18} /> : null}
      {current === "dark" ? <Moon size={18} /> : null}
      {current === "brand" ? <Snowflake size={18} /> : null}
      <span>{label}</span>
    </button>
  );
}
