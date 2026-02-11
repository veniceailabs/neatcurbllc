"use client";

import { ShieldCheck, MapPinned, CloudSnow, BadgeCheck } from "lucide-react";
import { useLanguage } from "@/components/language-context";
import { getCopy } from "@/lib/i18n";

const icons = [BadgeCheck, ShieldCheck, CloudSnow, MapPinned];

export default function TrustBar() {
  const { language } = useLanguage();
  const copy = getCopy(language);

  return (
    <section className="trust-bar">
      {copy.trustBar.map((label, index) => {
        const Icon = icons[index];
        return (
        <div key={label} className="trust-item">
          <Icon size={20} />
          <span>{label}</span>
        </div>
        );
      })}
    </section>
  );
}
