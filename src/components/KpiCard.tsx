export default function KpiCard({
  label,
  value,
  trend,
  accent
}: {
  label: string;
  value: string;
  trend?: string;
  accent?: string;
}) {
  return (
    <div className="kpi-card" style={accent ? { borderColor: accent } : undefined}>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {trend ? <div className="kpi-trend">{trend}</div> : null}
    </div>
  );
}
