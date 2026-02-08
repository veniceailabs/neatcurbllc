import DispatchPanel from "@/components/DispatchPanel";
import KpiCard from "@/components/KpiCard";
import PipelineBoard from "@/components/PipelineBoard";
import RevenueChart from "@/components/RevenueChart";
import SectionHeader from "@/components/SectionHeader";
import WeatherCard from "@/components/WeatherCard";

export default function DashboardPage() {
  return (
    <div>
      <SectionHeader
        title="Master Admin Dashboard"
        subtitle="Unified operations, revenue, and lead intelligence."
        action={<span className="pill">2-3 in trigger standard</span>}
      />

      <div className="kpi-grid">
        <KpiCard label="Today Revenue" value="$4,860" trend="+18% vs last push" />
        <KpiCard label="Active Crews" value="6" trend="2 completing now" />
        <KpiCard label="Leads This Week" value="38" trend="14 in last 24 hrs" />
        <KpiCard label="Snow Ready Score" value="92%" trend="Forecast aligns" />
      </div>

      <div className="panel">
        <RevenueChart />
      </div>

      <div className="grid-2">
        <WeatherCard />
        <DispatchPanel />
      </div>

      <div className="panel">
        <SectionHeader
          title="Sales Pipeline"
          subtitle="Trello-style flow from lead to contract."
        />
        <div style={{ marginTop: "16px" }}>
          <PipelineBoard />
        </div>
      </div>
    </div>
  );
}
