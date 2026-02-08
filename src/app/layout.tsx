import "./globals.css";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata = {
  title: "Neat Curb Admin Command Center",
  description: "Unified operations dashboard for Neat Curb LLC."
};

export default function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
