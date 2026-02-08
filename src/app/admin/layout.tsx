import Sidebar from "@/components/Sidebar";
import BusinessAIChat from "@/components/BusinessAIChat";
import AdminGate from "@/components/AdminGate";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-bg admin-shell">
      <AdminGate>
        <div className="app-shell">
          <Sidebar />
          <main className="main-panel">{children}</main>
        </div>
        <BusinessAIChat />
      </AdminGate>
    </div>
  );
}
