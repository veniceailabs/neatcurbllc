"use client";

import { useLanguage } from "@/components/language-context";
import { getCopy } from "@/lib/i18n";

export default function Hero() {
  const { language } = useLanguage();
  const copy = getCopy(language);

  return (
    <section className="hero" id="top">
      <div className="hero-content">
        <h1>{copy.hero.title}</h1>
        <p>{copy.hero.subtitle}</p>
        <div className="hero-actions">
          <a className="btn-primary" href="/request-quote">
            {copy.hero.primaryCta}
          </a>
          <a className="btn-secondary" href="tel:7162411499">
            {copy.hero.secondaryCta}
          </a>
        </div>
        <div className="hero-phone">{copy.hero.phone}</div>
      </div>
      <div className="hero-card">
        <div className="hero-card-title">{copy.hero.cardTitle}</div>
        <p>{copy.hero.cardBody}</p>
        <div className="hero-card-metrics">
          {copy.hero.metrics.map((metric) => (
            <div key={metric.label}>
              <strong>{metric.value}</strong>
              <span>{metric.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
