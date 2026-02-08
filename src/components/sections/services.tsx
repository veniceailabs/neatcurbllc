"use client";

import { useLanguage } from "@/components/language-context";
import { getCopy } from "@/lib/i18n";

export default function Services() {
  const { language } = useLanguage();
  const copy = getCopy(language);

  return (
    <section className="section" id="services">
      <div className="section-header">
        <h2>{copy.services.title}</h2>
        <p className="section-sub">{copy.services.subtitle}</p>
      </div>
      <div className="grid-3 services-grid">
        <div className="info-card service-card">
          <h3>{copy.services.snowTitle}</h3>
          <ul className="service-list">
            {copy.services.snowItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="info-card service-card">
          <h3>{copy.services.lawnTitle}</h3>
          <ul className="service-list">
            {copy.services.lawnItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="info-card service-card">
          <h3>{copy.services.maintenanceTitle}</h3>
          <ul className="service-list">
            {copy.services.maintenanceItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
