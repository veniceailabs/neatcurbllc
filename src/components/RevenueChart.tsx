const chartData = [
  60, 72, 55, 80, 90, 68, 95, 110, 78, 130, 115, 140
];

export default function RevenueChart() {
  return (
    <div>
      <div className="section-title">Live Revenue Monitor</div>
      <div className="section-sub">Daily totals across the last 12 pushes</div>
      <div className="chart">
        {chartData.map((value, index) => (
          <div
            key={`bar-${value}-${index}`}
            className="chart-bar"
            style={{ height: `${value}px` }}
            title={`$${(value * 10).toLocaleString()}`}
          />
        ))}
      </div>
    </div>
  );
}
