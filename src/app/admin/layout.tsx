import Sidebar from "@/components/Sidebar";
import AdminGate from "@/components/AdminGate";
import AdminTools from "@/components/AdminTools";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-bg admin-shell">
      <AdminGate>
        <div className="app-shell">
          <Sidebar />
          <main className="main-panel">{children}</main>
        </div>
        <AdminTools />
      </AdminGate>
    </div>
  );
}
