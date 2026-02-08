"use client";

import SectionHeader from "@/components/SectionHeader";
import { useTooltips } from "@/components/tooltip-context";

export default function SettingsPage() {
  const { enabled, setEnabled } = useTooltips();

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
          <div style={{ fontWeight: 700 }}>Interface Preferences</div>
          <div className="note">Tooltips are on by default for quick guidance.</div>
          <button
            className="button-primary"
            type="button"
            style={{ marginTop: "10px" }}
            onClick={() => setEnabled(!enabled)}
          >
            {enabled ? "Turn Tooltips Off" : "Turn Tooltips On"}
          </button>
        </div>
        <div className="kpi-card">
          <div style={{ fontWeight: 700 }}>Integrations</div>
          <div className="note">Supabase, Stripe, and Business AI engine.</div>
        </div>
      </div>
    </div>
  );
}
