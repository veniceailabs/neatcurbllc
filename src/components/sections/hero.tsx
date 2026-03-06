"use client";

import Image from "next/image";
import { useLanguage } from "@/components/language-context";
import { getCopy } from "@/lib/i18n";

export default function Hero() {
  const { language } = useLanguage();
  const copy = getCopy(language);

  return (
    <section className="hero" id="top">
      <div className="hero-content">
        <div className="hero-badges">
          <div className="hero-badge" aria-label={copy.hero.badge.title}>
            <Image
              src="/brand/ny-mwbe-official-certified.svg"
              alt={copy.hero.badge.alt}
              className="hero-badge-icon"
              width={64}
              height={64}
              priority
            />
            <div>
              <strong>{copy.hero.badge.title}</strong>
              <span>{copy.hero.badge.subtitle}</span>
            </div>
          </div>
          <a
            className="hero-badge hero-badge-link"
            href={copy.bbb.profileUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={copy.hero.bbbBadge.title}
          >
            <Image
              src="/brand/bbb-accredited-badge.png"
              alt={copy.hero.bbbBadge.alt}
              className="hero-badge-icon hero-badge-icon-bbb"
              width={64}
              height={64}
              priority
            />
            <div>
              <strong>{copy.hero.bbbBadge.title}</strong>
              <span>{copy.hero.bbbBadge.subtitle}</span>
            </div>
          </a>
        </div>
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
      </div>
      <div className="hero-card">
        <div className="hero-card-title">{copy.hero.cardTitle}</div>
        <p>{copy.hero.cardBody}</p>
        <div className="hero-phone">{copy.hero.phone}</div>
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
