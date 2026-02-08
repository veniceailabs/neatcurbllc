export const metadata = {
  title: "Neat Curb LLC | Snow & Lawn Services",
  description:
    "Official pricing and service standard for residential and commercial snow management and lawn care."
};

const schema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Neat Curb LLC",
  url: "https://www.neatcurbllc.com",
  description:
    "Snow removal and lawn care services with 2-3 inch trigger pricing, seasonal contracts, and commercial service plans.",
  areaServed: ["Buffalo, NY", "Western New York"],
  serviceType: [
    "Snow removal",
    "Ice management",
    "Lawn maintenance",
    "Leaf cleanup",
    "Mulching"
  ],
  address: {
    "@type": "PostalAddress",
    streetAddress: "229 West Genesee St",
    postOfficeBoxNumber: "Box 106",
    addressLocality: "Buffalo",
    addressRegion: "NY",
    postalCode: "14202",
    addressCountry: "US"
  },
  telephone: "716-241-1499",
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      opens: "07:30",
      closes: "17:30"
    }
  ],
  sameAs: [],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    email: "contact@neatcurbllc.com",
    telephone: "716-241-1499"
  }
};

export default function SitePage() {
  return (
    <div className="panel">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <h1 className="section-title">Neat Curb LLC | Snow & Lawn Services</h1>
      <p className="section-sub">
        The official pricing and service standard for residential and commercial snow
        management in Western New York.
      </p>

      <div style={{ marginTop: "20px", display: "grid", gap: "16px" }}>
        <section>
          <h2 className="section-title">2-3 Inch Snow Trigger Standard</h2>
          <p className="section-sub">
            Every push is priced from a 2-3 inch snowfall trigger, with transparent
            heavy snow surcharges and drift return options.
          </p>
        </section>

        <section>
          <h2 className="section-title">Residential Snow Pricing</h2>
          <div className="kpi-grid" style={{ marginTop: "12px" }}>
            <div className="kpi-card">
              <div className="kpi-label">Small driveway</div>
              <div className="kpi-value">$70</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Medium driveway</div>
              <div className="kpi-value">$85</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Large driveway</div>
              <div className="kpi-value">$100 - $120</div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="section-title">Commercial Snow Pricing</h2>
          <div className="grid-2" style={{ marginTop: "12px" }}>
            <div className="kpi-card">
              <div className="kpi-label">Small commercial</div>
              <div className="kpi-value">$150 - $275 per push</div>
              <div className="note">Seasonal: $4,500 - $7,500</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Plazas / multi-suite</div>
              <div className="kpi-value">$275 - $750 per push</div>
              <div className="note">Seasonal: $10,000 - $22,000</div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="section-title">Heavy Snow Surcharges</h2>
          <div className="grid-3" style={{ marginTop: "12px" }}>
            <div className="kpi-card">
              <div className="kpi-label">3-6 inches</div>
              <div className="kpi-value">+50%</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">6-12 inches</div>
              <div className="kpi-value">+75%</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">12+ inches</div>
              <div className="kpi-value">+100%</div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="section-title">Warm Season Services</h2>
          <p className="section-sub">
            Lawn mowing, mulching, cleanups, and debris removal with a $70 minimum visit.
          </p>
        </section>

        <section>
          <h2 className="section-title">Need a Quote?</h2>
          <p className="section-sub">
            Use the Lead Intake page to generate an instant quote and lock in service.
          </p>
        </section>
      </div>
    </div>
  );
}
