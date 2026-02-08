"use client";

import { useLanguage } from "@/components/language-context";
import { getCopy } from "@/lib/i18n";

export default function Services() {
  const { language } = useLanguage();
  const copy = getCopy(language);

  return (
    <section className="section" id="services">
      <div className="section-header">
        <div className="section-eyebrow">{copy.services.eyebrow}</div>
        <h2>{copy.services.title}</h2>
        <p className="section-sub">{copy.services.subtitle}</p>
      </div>
      <div className="grid-3 services-grid">
        {copy.services.cards.map((card) => (
          <div key={card.title} className="info-card service-card">
            <h3>{card.title}</h3>
            <p className="service-desc">{card.desc}</p>
            <ul className="service-list">
              {card.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
