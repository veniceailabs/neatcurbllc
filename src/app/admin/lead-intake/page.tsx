"use client";

import LeadIntakeForm from "@/components/LeadIntakeForm";
import SectionHeader from "@/components/SectionHeader";
import { useLanguage } from "@/components/language-context";
import { getCopy } from "@/lib/i18n";

export default function LeadIntakePage() {
  const { language } = useLanguage();
  const copy = getCopy(language);

  return (
    <div>
      <SectionHeader
        title={copy.admin.leadIntake.title}
        subtitle={copy.admin.leadIntake.subtitle}
        action={<span className="pill">{copy.admin.leadIntake.badge}</span>}
      />
      <div style={{ marginTop: "18px" }}>
        <LeadIntakeForm />
      </div>
    </div>
  );
}
