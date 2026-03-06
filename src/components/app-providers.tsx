"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/components/language-context";
import WeatherEffects from "@/components/WeatherEffects";
import SiteInteractivity from "@/components/SiteInteractivity";
import VisitorAssistant from "@/components/VisitorAssistant";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        {children}
        <SiteInteractivity />
        <VisitorAssistant />
        <WeatherEffects />
      </LanguageProvider>
    </ThemeProvider>
  );
}
