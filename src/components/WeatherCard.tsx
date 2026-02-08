export default function WeatherCard() {
  return (
    <div className="panel">
      <div className="section-title">Weather Intelligence</div>
      <div className="section-sub">Local NY forecast + auto Snow Ready status</div>
      <div className="grid-3" style={{ marginTop: "16px" }}>
        <div>
          <div className="kpi-label">Tonight</div>
          <div className="kpi-value">1.4 in</div>
          <div className="note">Snow window: 10 PM - 4 AM</div>
        </div>
        <div>
          <div className="kpi-label">Tomorrow</div>
          <div className="kpi-value">2.6 in</div>
          <div className="badge">Snow Ready ON</div>
        </div>
        <div>
          <div className="kpi-label">7-Day</div>
          <div className="kpi-value">14.2 in</div>
          <div className="note">3 service days projected</div>
        </div>
      </div>
    </div>
  );
}
