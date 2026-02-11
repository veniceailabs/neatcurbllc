"use client";

import Tooltip from "@/components/Tooltip";
import { useLanguage } from "@/components/language-context";
import { getCopy } from "@/lib/i18n";

export default function OnboardingPanel() {
  const { language } = useLanguage();
  const copy = getCopy(language);

  return (
    <div className="panel" style={{ marginTop: "18px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px"
        }}
      >
        <div className="section-title">{copy.admin.onboarding.title}</div>
        <button
          className="btn-secondary"
          type="button"
          onClick={() => {
            window.localStorage.setItem("neatcurb:onboarding-visible", "off");
            window.dispatchEvent(new CustomEvent("neatcurb:onboarding-change"));
          }}
        >
          {copy.admin.settings.hideOnboarding}
        </button>
      </div>
      <div className="section-sub">{copy.admin.onboarding.subtitle}</div>
      <div className="onboarding-grid" style={{ marginTop: "16px" }}>
        {copy.admin.onboarding.steps.map((step) => (
          <div key={step.title} className="onboarding-card">
            <div className="onboarding-title">{step.title}</div>
            <div className="note">{step.detail}</div>
            <Tooltip label={step.action}>
              <a className="button-primary onboarding-action" href={step.href}>
                {step.action}
              </a>
            </Tooltip>
          </div>
        ))}
      </div>
    </div>
  );
}
