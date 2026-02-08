import SectionHeader from "@/components/SectionHeader";

const routes = [
  { name: "Route A", eta: "2h 10m", status: "In progress" },
  { name: "Route B", eta: "1h 35m", status: "Queued" },
  { name: "Route C", eta: "3h 05m", status: "In progress" }
];

export default function RoutesPage() {
  return (
    <div className="panel">
      <SectionHeader
        title="Routes & Dispatch"
        subtitle="AI-optimized paths saving fuel and time."
        action={<span className="pill">GPS Live</span>}
      />
      <div style={{ marginTop: "18px", display: "grid", gap: "12px" }}>
        {routes.map((route) => (
          <div key={route.name} className="kpi-card">
            <div style={{ fontWeight: 700 }}>{route.name}</div>
            <div className="note">ETA: {route.eta}</div>
            <div className="note">Status: {route.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
