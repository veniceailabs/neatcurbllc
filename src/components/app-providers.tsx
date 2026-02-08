"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/components/language-context";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>{children}</LanguageProvider>
    </ThemeProvider>
  );
}
