"use client";

import { useEffect, useState } from "react";
import SectionHeader from "@/components/SectionHeader";
import { useTooltips } from "@/components/tooltip-context";
import { useLanguage } from "@/components/language-context";
import { getCopy } from "@/lib/i18n";
import { SITE } from "@/lib/site";

export default function SettingsPage() {
  const { enabled, setEnabled } = useTooltips();
  const { language } = useLanguage();
  const copy = getCopy(language);
  const [instagramHandle, setInstagramHandle] = useState(SITE.instagram.handle);
  const [instagramSaved, setInstagramSaved] = useState(false);
  const [onboardingVisible, setOnboardingVisible] = useState(true);

  useEffect(() => {
    const saved = window.localStorage.getItem("neatcurb-instagram-handle");
    if (saved) {
      setInstagramHandle(saved);
    }
    const onboarding = window.localStorage.getItem("neatcurb:onboarding-visible");
    setOnboardingVisible(onboarding !== "off");
  }, []);

  const saveInstagram = () => {
    const normalized = instagramHandle.replace(/^@/, "").trim();
    window.localStorage.setItem("neatcurb-instagram-handle", normalized);
    setInstagramHandle(normalized);
    setInstagramSaved(true);
    window.setTimeout(() => setInstagramSaved(false), 1800);
  };

  const toggleOnboarding = () => {
    const next = !onboardingVisible;
    setOnboardingVisible(next);
    window.localStorage.setItem("neatcurb:onboarding-visible", next ? "on" : "off");
    window.dispatchEvent(new CustomEvent("neatcurb:onboarding-change"));
  };

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
          <div className="note" style={{ marginTop: "10px" }}>
            {copy.admin.settings.onboardingOn}
          </div>
          <button
            className="btn-secondary"
            type="button"
            style={{ marginTop: "10px" }}
            onClick={toggleOnboarding}
          >
            {onboardingVisible
              ? copy.admin.settings.hideOnboarding
              : copy.admin.settings.showOnboarding}
          </button>
        </div>
        <div className="kpi-card">
          <div style={{ fontWeight: 700 }}>{copy.admin.settings.integrations}</div>
          <div className="note">{copy.admin.settings.integrationsNote}</div>
          <div style={{ marginTop: "10px", display: "grid", gap: "8px" }}>
            <label className="form-field">
              Instagram Handle
              <input
                value={instagramHandle}
                onChange={(event) => setInstagramHandle(event.target.value)}
                placeholder="@neat_curb"
              />
            </label>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button className="button-primary" type="button" onClick={saveInstagram}>
                Save Instagram Handle
              </button>
              <a
                className="btn-secondary"
                href={`https://instagram.com/${instagramHandle.replace(/^@/, "")}`}
                target="_blank"
                rel="noreferrer"
              >
                Open Instagram
              </a>
            </div>
            {instagramSaved ? <div className="note">Instagram handle saved.</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
