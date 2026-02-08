import "./globals.css";
import type { ReactNode } from "react";
import Sidebar from "@/components/Sidebar";
import BusinessAIChat from "@/components/BusinessAIChat";

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
        <div className="app-bg">
          <div className="app-shell">
            <Sidebar />
            <main className="main-panel">{children}</main>
          </div>
          <BusinessAIChat />
        </div>
      </body>
    </html>
  );
}
