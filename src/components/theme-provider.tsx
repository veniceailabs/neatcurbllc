"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="brand"
      themes={["light", "dark", "brand"]}
      enableSystem={false}
    >
      {children}
    </NextThemesProvider>
  );
}
