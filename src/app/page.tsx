"use client";

import LandingHeader from "@/components/LandingHeader";
import { useLanguage } from "@/contexts/LanguageContext";

export default function LandingPage() {
  const { t } = useLanguage();

  return (
    <div className="landing">
      <LandingHeader />

      <section className="hero">
        <div className="hero-content">
          <span className="pill">{t("trustBadge")}</span>
          <h1>{t("heroTitle")}</h1>
          <p>{t("heroSubtitle")}</p>
          <div className="hero-actions">
            <a className="button-primary" href="/admin/lead-intake">
              {t("ctaPrimary")}
            </a>
            <a className="button-secondary" href="#services">
              {t("ctaSecondary")}
            </a>
          </div>
          <div className="hero-metrics">
            <div>
              <div className="metric-value">24/7</div>
              <div className="metric-label">Storm Coverage</div>
            </div>
            <div>
              <div className="metric-value">2-3 in</div>
              <div className="metric-label">Snow Trigger</div>
            </div>
            <div>
              <div className="metric-value">Net-15</div>
              <div className="metric-label">Commercial Billing</div>
            </div>
          </div>
        </div>
        <div className="hero-card">
          <img
            src="/brand/neat-curb-logo-full.svg"
            alt="Neat Curb LLC logo"
            className="hero-logo"
          />
          <div className="hero-card-title">2-3 Inch Standard</div>
          <p>
            Every push is priced from the official 2-3 inch trigger with transparent
            surcharges for heavy snow.
          </p>
          <div className="hero-card-grid">
            <div>
              <span>3-6 in</span>
              <strong>+50%</strong>
            </div>
            <div>
              <span>6-12 in</span>
              <strong>+75%</strong>
            </div>
            <div>
              <span>12+ in</span>
              <strong>+100%</strong>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="section">
        <div className="section-header">
          <h2>{t("servicesTitle")}</h2>
          <p>{t("servicesSubtitle")}</p>
        </div>
        <div className="service-grid">
          <div className="service-card">
            <h3>{t("snowTitle")}</h3>
            <p>{t("snowBody")}</p>
          </div>
          <div className="service-card">
            <h3>{t("lawnTitle")}</h3>
            <p>{t("lawnBody")}</p>
          </div>
          <div className="service-card">
            <h3>{t("commercialTitle")}</h3>
            <p>{t("commercialBody")}</p>
          </div>
        </div>
      </section>

      <section className="section highlight">
        <div className="section-header">
          <h2>{t("pricingTitle")}</h2>
          <p>{t("pricingSubtitle")}</p>
        </div>
        <div className="pricing-grid">
          <div className="pricing-card">
            <h4>Residential Per Push</h4>
            <ul>
              <li>Small driveway: $70</li>
              <li>Medium driveway: $85</li>
              <li>Large driveway: $100 - $120</li>
              <li>Sidewalk add-on: $40</li>
              <li>Ice management: $75</li>
            </ul>
          </div>
          <div className="pricing-card">
            <h4>Commercial Per Push</h4>
            <ul>
              <li>Small commercial: $150 - $275</li>
              <li>Plazas / multi-suite: $275 - $750</li>
              <li>Seasonal contracts available</li>
              <li>Net-15 invoicing</li>
              <li>Priority scheduling</li>
            </ul>
          </div>
          <div className="pricing-card">
            <h4>Warm Season</h4>
            <ul>
              <li>Minimum visit: $70</li>
              <li>Weekly mowing: $70 - $85</li>
              <li>Mulch refresh: $300 - $700</li>
              <li>Leaf cleanup: $250 - $450</li>
              <li>Storm cleanup: $150 - $400</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <h2>{t("proofTitle")}</h2>
          <p>{t("proofSubtitle")}</p>
        </div>
        <div className="proof-grid">
          <div className="proof-card">
            <h4>{t("proofOneTitle")}</h4>
            <p>{t("proofOneBody")}</p>
          </div>
          <div className="proof-card">
            <h4>{t("proofTwoTitle")}</h4>
            <p>{t("proofTwoBody")}</p>
          </div>
          <div className="proof-card">
            <h4>{t("proofThreeTitle")}</h4>
            <p>{t("proofThreeBody")}</p>
          </div>
        </div>
      </section>

      <section className="section contact">
        <div>
          <h2>{t("coverageTitle")}</h2>
          <p>{t("coverageBody")}</p>
        </div>
        <div className="contact-card">
          <h3>{t("contactTitle")}</h3>
          <p>{t("contactBody")}</p>
          <div className="contact-actions">
            <a className="button-primary" href="/admin/lead-intake">
              {t("ctaPrimary")}
            </a>
            <a className="button-secondary" href="mailto:contact@neatcurbllc.com">
              Email Us
            </a>
          </div>
        </div>
      </section>

      <section className="cta-strip">
        <div>
          <h2>{t("footerCTA")}</h2>
          <p>
            Lock in your contract and move to the top of our storm priority list.
          </p>
        </div>
        <a className="button-primary" href="/admin/lead-intake">
          {t("footerButton")}
        </a>
      </section>

      <footer className="landing-footer">
        <div>
          <strong>Neat Curb LLC</strong>
          <span>229 West Genesee St, Box 106, Buffalo NY 14202</span>
        </div>
        <div>
          <a href="tel:7162411499">716-241-1499</a>
          <a href="/admin/login">Admin Login</a>
        </div>
      </footer>
    </div>
  );
}
