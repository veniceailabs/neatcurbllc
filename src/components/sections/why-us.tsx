"use client";

import { useLanguage } from "@/components/language-context";
import { getCopy } from "@/lib/i18n";

export default function WhyUs() {
  const { language } = useLanguage();
  const copy = getCopy(language);

  return (
    <section className="section">
      <div className="section-header">
        <h2>{copy.whyUs.title}</h2>
      </div>
      <div className="grid-4">
        {copy.whyUs.items.map((item) => (
          <div key={item.title} className="info-card">
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
