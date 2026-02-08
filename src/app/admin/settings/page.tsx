"use client";

import SectionHeader from "@/components/SectionHeader";
import { useTooltips } from "@/components/tooltip-context";
import { useLanguage } from "@/components/language-context";
import { getCopy } from "@/lib/i18n";

export default function SettingsPage() {
  const { enabled, setEnabled } = useTooltips();
  const { language } = useLanguage();
  const copy = getCopy(language);

  return (
    <div className="panel">
      <SectionHeader
        title={copy.admin.settings.title}
        subtitle={copy.admin.settings.subtitle}
        action={<span className="pill">{copy.admin.settings.admin}</span>}
      />
      <div style={{ marginTop: "16px", display: "grid", gap: "12px" }}>
        <div className="kpi-card">
          <div style={{ fontWeight: 700 }}>{copy.admin.settings.adminAccount}</div>
          <div className="note">Email: neatcurb@gmail.com</div>
          <div className="note">Password changes handled in Auth.</div>
        </div>
        <div className="kpi-card">
          <div style={{ fontWeight: 700 }}>{copy.admin.settings.interfacePrefs}</div>
          <div className="note">{copy.admin.settings.tooltipsOn}</div>
          <button
            className="button-primary"
            type="button"
            style={{ marginTop: "10px" }}
            onClick={() => setEnabled(!enabled)}
          >
            {enabled ? copy.admin.settings.turnOff : copy.admin.settings.turnOn}
          </button>
        </div>
        <div className="kpi-card">
          <div style={{ fontWeight: 700 }}>{copy.admin.settings.integrations}</div>
          <div className="note">{copy.admin.settings.integrationsNote}</div>
        </div>
      </div>
    </div>
  );
}
