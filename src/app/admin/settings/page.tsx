import SectionHeader from "@/components/SectionHeader";

export default function SettingsPage() {
  return (
    <div className="panel">
      <SectionHeader
        title="Settings"
        subtitle="Account, security, and integrations."
        action={<span className="pill">Admin</span>}
      />
      <div style={{ marginTop: "16px", display: "grid", gap: "12px" }}>
        <div className="kpi-card">
          <div style={{ fontWeight: 700 }}>Admin Account</div>
          <div className="note">Email: neatcurb@gmail.com</div>
          <div className="note">Password changes handled in Auth.</div>
        </div>
        <div className="kpi-card">
          <div style={{ fontWeight: 700 }}>Integrations</div>
          <div className="note">Supabase, Stripe, and Business AI engine.</div>
        </div>
      </div>
    </div>
  );
}
