"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import AdminGate from "@/components/AdminGate";
import AdminTools from "@/components/AdminTools";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideSidebar =
    pathname === "/admin/login" || pathname === "/admin/change-password";

  return (
    <div className="app-bg admin-shell">
      <AdminGate>
        {hideSidebar ? (
          <main className="main-panel">{children}</main>
        ) : (
          <>
            <div className="app-shell">
              <Sidebar />
              <main className="main-panel">{children}</main>
            </div>
            <AdminTools />
          </>
        )}
      </AdminGate>
    </div>
  );
}
