export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-content">
        <h1>Western New York’s Reliable Snow & Property Maintenance</h1>
        <p>
          Residential and Commercial Snow Removal, Lawn Care, and Property Services you can
          count on year-round.
        </p>
        <div className="hero-actions">
          <a className="btn-primary" href="/request-quote">
            Request a Quote
          </a>
          <a className="btn-secondary" href="tel:7162411499">
            Call Now
          </a>
        </div>
        <div className="hero-phone">(716) XXX-XXXX</div>
      </div>
      <div className="hero-card">
        <div className="hero-card-title">Storm-Ready Operations</div>
        <p>
          Real-time dispatch, proactive monitoring, and reliable crews across Western NY.
        </p>
        <div className="hero-card-metrics">
          <div>
            <strong>24/7</strong>
            <span>Monitoring</span>
          </div>
          <div>
            <strong>2-3"</strong>
            <span>Snow Trigger</span>
          </div>
          <div>
            <strong>Net-15</strong>
            <span>Commercial</span>
          </div>
        </div>
      </div>
    </section>
  );
}
