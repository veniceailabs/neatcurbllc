"use client";

import Tooltip from "@/components/Tooltip";

const steps = [
  {
    title: "Set your admin password",
    detail: "Complete the forced password change to lock in ownership access.",
    action: "Change Password",
    href: "/admin/change-password"
  },
  {
    title: "Add your first client",
    detail: "Start with your top seasonal accounts to build momentum.",
    action: "Add Client",
    href: "/admin/clients"
  },
  {
    title: "Send a test message",
    detail: "Use the Messages tab to send a branded update to yourself.",
    action: "Open Messages",
    href: "/admin/messages"
  },
  {
    title: "Upload proof of work",
    detail: "Use Work Orders to upload a photo and timestamp the service.",
    action: "Work Orders",
    href: "/admin/work-orders"
  },
  {
    title: "Confirm DNS for Resend",
    detail: "Add SPF/DKIM/DMARC in Namecheap so mail lands in inbox.",
    action: "DNS Checklist",
    href: "/admin/settings"
  }
];

export default function OnboardingPanel() {
  return (
    <div className="panel" style={{ marginTop: "18px" }}>
      <div className="section-title">First Flight Checklist</div>
      <div className="section-sub">
        A tailored launch path for Corey — built for snow ops, crew comms, and
        proof-of-work.
      </div>
      <div className="onboarding-grid" style={{ marginTop: "16px" }}>
        {steps.map((step) => (
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
