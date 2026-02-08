"use client";

import { useTheme } from "next-themes";
import { Leaf, Moon, Snowflake, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type ThemeMode = "light" | "dark" | "brand";
type ThemeVariant = "nav" | "sidebar";

const nextTheme = (theme: ThemeMode) =>
  theme === "light" ? "dark" : theme === "dark" ? "brand" : "light";

const labelFor = (theme: ThemeMode) =>
  theme === "light" ? "Light" : theme === "dark" ? "Dark" : "Brand";

export default function ThemeToggle({ variant = "nav" }: { variant?: ThemeVariant }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const current = (theme as ThemeMode) || "brand";

  if (variant === "sidebar") {
    const next = nextTheme(current);
    const label = `Switch to ${labelFor(next)} mode`;
    return (
      <button
        className="theme-switch"
        type="button"
        onClick={() => setTheme(next)}
        aria-label={label}
      >
        {next === "light" ? <Sun size={16} /> : null}
        {next === "dark" ? <Moon size={16} /> : null}
        {next === "brand" ? (
          <span className="theme-switch-icons">
            <Snowflake size={14} />
            <Leaf size={14} />
          </span>
        ) : null}
        <span>{label}</span>
      </button>
    );
  }

  return (
    <div className="theme-toggle">
      <button
        type="button"
        className={`theme-pill ${current === "light" ? "active" : ""}`}
        onClick={() => setTheme("light")}
        aria-label="Light mode"
      >
        <Sun size={14} />
        <span>Light</span>
      </button>
      <button
        type="button"
        className={`theme-pill ${current === "dark" ? "active" : ""}`}
        onClick={() => setTheme("dark")}
        aria-label="Dark mode"
      >
        <Moon size={14} />
        <span>Dark</span>
      </button>
      <button
        type="button"
        className={`theme-pill ${current === "brand" ? "active" : ""}`}
        onClick={() => setTheme("brand")}
        aria-label="Brand mode"
      >
        <Snowflake size={14} />
        <Leaf size={14} />
        <span>Brand</span>
      </button>
    </div>
  );
}
