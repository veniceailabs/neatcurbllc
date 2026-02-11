"use client";

import { useEffect, useState } from "react";
import SectionHeader from "@/components/SectionHeader";
import { useTooltips } from "@/components/tooltip-context";
import { useLanguage } from "@/components/language-context";
import { getCopy } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { supabase } from "@/lib/supabaseClient";

type AccessSession = {
  id: string;
  email: string;
  last_sign_in_at: string | null;
  created_at: string | null;
  confirmed_at: string | null;
};

type AccessOverview = {
  ownerEmail: string;
  totalAccounts: number;
  adminAccounts: number;
  staffAccounts: number;
  activeLast30: number;
  recentSessions: AccessSession[];
};

export default function SettingsPage() {
  const { enabled, setEnabled } = useTooltips();
  const { language } = useLanguage();
  const copy = getCopy(language);
  const [instagramHandle, setInstagramHandle] = useState(SITE.instagram.handle);
  const [instagramSaved, setInstagramSaved] = useState(false);
  const [onboardingVisible, setOnboardingVisible] = useState(true);
  const [showAccess, setShowAccess] = useState(false);
  const [accessLoading, setAccessLoading] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [accessData, setAccessData] = useState<AccessOverview | null>(null);

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

  const toggleAccess = async () => {
    const next = !showAccess;
    setShowAccess(next);
    if (!next || accessData || accessLoading) return;
    setAccessLoading(true);
    setAccessError(null);

    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        setAccessError(copy.admin.settings.accessError);
        setAccessLoading(false);
        return;
      }

      const response = await fetch("/api/admin/access", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const payload = await response.json();
      if (!response.ok || !payload?.ok) {
        setAccessError(copy.admin.settings.accessError);
      } else {
        setAccessData(payload.data as AccessOverview);
      }
    } catch {
      setAccessError(copy.admin.settings.accessError);
    } finally {
      setAccessLoading(false);
    }
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
          <div style={{ fontWeight: 700 }}>{copy.admin.settings.accessControl}</div>
          <div className="note">{copy.admin.settings.ownerOnly}</div>
          <button
            className="btn-secondary"
            type="button"
            style={{ marginTop: "10px" }}
            onClick={toggleAccess}
          >
            {showAccess ? copy.admin.settings.hideAccess : copy.admin.settings.showAccess}
          </button>
          {showAccess ? (
            <div style={{ marginTop: "12px", display: "grid", gap: "10px" }}>
              {accessLoading ? <div className="note">Loading...</div> : null}
              {accessError ? <div className="note">{accessError}</div> : null}
              {accessData ? (
                <>
                  <div className="kpi-grid">
                    <div className="kpi-card">
                      <div className="kpi-label">{copy.admin.settings.totalAccounts}</div>
                      <div className="kpi-value">{accessData.totalAccounts}</div>
                    </div>
                    <div className="kpi-card">
                      <div className="kpi-label">{copy.admin.settings.adminAccounts}</div>
                      <div className="kpi-value">{accessData.adminAccounts}</div>
                    </div>
                    <div className="kpi-card">
                      <div className="kpi-label">{copy.admin.settings.staffAccounts}</div>
                      <div className="kpi-value">{accessData.staffAccounts}</div>
                    </div>
                    <div className="kpi-card">
                      <div className="kpi-label">{copy.admin.settings.activeLast30}</div>
                      <div className="kpi-value">{accessData.activeLast30}</div>
                    </div>
                  </div>
                  <div className="note">
                    {copy.admin.settings.ownerEmail}: {accessData.ownerEmail}
                  </div>
                  <div style={{ fontWeight: 700 }}>{copy.admin.settings.recentSessions}</div>
                  {accessData.recentSessions.length === 0 ? (
                    <div className="note">{copy.admin.settings.noSessions}</div>
                  ) : (
                    <div style={{ display: "grid", gap: "8px" }}>
                      {accessData.recentSessions.map((session) => (
                        <div key={session.id} className="kpi-card">
                          <div style={{ fontWeight: 700 }}>{session.email}</div>
                          <div className="note">
                            Last sign in: {session.last_sign_in_at || "Never"}
                          </div>
                          <div className="note">Created: {session.created_at || "--"}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : null}
            </div>
          ) : null}
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
