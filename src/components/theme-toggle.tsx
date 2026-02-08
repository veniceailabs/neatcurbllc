"use client";

import { useTheme } from "next-themes";
import { Leaf, Moon, Snowflake, Sun } from "lucide-react";
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
  return (
    <div className="theme-toggle">
      <button
        type="button"
        className={`theme-pill ${current === "light" ? "active" : ""}`}
        onClick={() => setTheme("light")}
        aria-label="Light mode"
      >
        <Sun size={16} />
        <span>Light</span>
      </button>
      <button
        type="button"
        className={`theme-pill ${current === "dark" ? "active" : ""}`}
        onClick={() => setTheme("dark")}
        aria-label="Dark mode"
      >
        <Moon size={16} />
        <span>Dark</span>
      </button>
      <button
        type="button"
        className={`theme-pill ${current === "brand" ? "active" : ""}`}
        onClick={() => setTheme("brand")}
        aria-label="Brand mode"
      >
        <Snowflake size={16} />
        <Leaf size={16} />
        <span>Brand</span>
      </button>
    </div>
  );
}
