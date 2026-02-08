export default function WeatherCard() {
  return (
    <div className="panel">
      <div className="section-title">Weather Intelligence</div>
      <div className="section-sub">
        Connect a live forecast feed to trigger Snow Ready mode automatically.
      </div>
      <div className="grid-3" style={{ marginTop: "16px" }}>
        <div>
          <div className="kpi-label">Tonight</div>
          <div className="kpi-value">--</div>
          <div className="note">Forecast pending</div>
        </div>
        <div>
          <div className="kpi-label">Tomorrow</div>
          <div className="kpi-value">--</div>
          <div className="badge">Snow Ready standby</div>
        </div>
        <div>
          <div className="kpi-label">7-Day</div>
          <div className="kpi-value">--</div>
          <div className="note">Connect weather API</div>
        </div>
      </div>
    </div>
  );
}
