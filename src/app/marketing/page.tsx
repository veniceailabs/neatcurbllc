import SectionHeader from "@/components/SectionHeader";

const campaigns = [
  { name: "Snow Prep SMS", status: "Active", reach: "1,240" },
  { name: "Review Request", status: "Scheduled", reach: "380" },
  { name: "Spring Lawn Relaunch", status: "Draft", reach: "--" }
];

export default function MarketingPage() {
  return (
    <div className="panel">
      <SectionHeader
        title="Marketing Command"
        subtitle="Automated SMS, email, and review generation."
        action={<span className="pill">SMS Live</span>}
      />
      <div style={{ marginTop: "18px", display: "grid", gap: "12px" }}>
        {campaigns.map((campaign) => (
          <div key={campaign.name} className="kpi-card">
            <div style={{ fontWeight: 700 }}>{campaign.name}</div>
            <div className="note">Status: {campaign.status}</div>
            <div className="note">Reach: {campaign.reach}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
