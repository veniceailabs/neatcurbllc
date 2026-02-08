export default function DispatchPanel() {
  return (
    <div className="panel panel-dark">
      <div className="section-title">The Push Button</div>
      <div className="section-sub" style={{ color: "rgba(255,255,255,0.8)" }}>
        One-tap dispatch to every crew based on live snowfall.
      </div>
      <div style={{ marginTop: "18px" }}>
        <button className="button-primary">Dispatch All Crews</button>
      </div>
      <div style={{ marginTop: "16px", display: "flex", gap: "12px" }}>
        <span className="pill">Routes queued: 18</span>
        <span className="pill">ETA alerts: Live</span>
      </div>
    </div>
  );
}
