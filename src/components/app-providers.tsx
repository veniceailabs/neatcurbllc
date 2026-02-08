"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/components/language-context";
import WeatherEffects from "@/components/WeatherEffects";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        {children}
        <WeatherEffects />
      </LanguageProvider>
    </ThemeProvider>
  );
}
