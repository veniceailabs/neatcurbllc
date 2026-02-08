"use client";

import { useLanguage } from "@/components/language-context";
import { getCopy } from "@/lib/i18n";

export default function ServiceAreas() {
  const { language } = useLanguage();
  const copy = getCopy(language);

  return (
    <section className="section" id="areas">
      <div className="section-header">
        <h2>{copy.areas.title}</h2>
      </div>
      <div className="areas-grid">
        {copy.areas.list.map((area) => (
          <div key={area} className="area-chip">
            {area}
          </div>
        ))}
      </div>
    </section>
  );
}
