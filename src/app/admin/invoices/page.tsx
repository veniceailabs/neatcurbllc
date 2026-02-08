"use client";

import SectionHeader from "@/components/SectionHeader";
import { useLanguage } from "@/components/language-context";
import { getCopy } from "@/lib/i18n";

export default function InvoicesPage() {
  const { language } = useLanguage();
  const copy = getCopy(language);

  return (
    <div className="panel">
      <SectionHeader
        title={copy.admin.invoices.title}
        subtitle={copy.admin.invoices.subtitle}
        action={<span className="pill">{copy.admin.invoices.admin}</span>}
      />

      <div style={{ marginTop: "16px", display: "grid", gap: "12px" }}>
        <div className="kpi-card">
          <div style={{ fontWeight: 700 }}>{copy.admin.invoices.deadlineTitle}</div>
          <div className="note">
            {copy.admin.invoices.deadlineBody}{" "}
            <strong>November 1</strong>.
          </div>
          <div className="note">2026 deadline: November 1, 2026.</div>
        </div>

        <div className="kpi-card">
          <div style={{ fontWeight: 700 }}>{copy.admin.invoices.termsTitle}</div>
          <div className="note">{copy.admin.invoices.termsBody}</div>
        </div>
      </div>
    </div>
  );
}
