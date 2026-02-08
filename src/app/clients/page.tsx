import SectionHeader from "@/components/SectionHeader";

const clients = [
  { name: "Belmont Retail", status: "Active", lastService: "Jan 30" },
  { name: "Twin Oaks HOA", status: "Proposal", lastService: "Jan 27" },
  { name: "Harrison LLC", status: "Contract", lastService: "Jan 25" }
];

export default function ClientsPage() {
  return (
    <div className="panel">
      <SectionHeader
        title="Clients CRM"
        subtitle="Full relationship history, cards-on-file, and proof of work."
        action={<span className="pill">124 active</span>}
      />
      <div style={{ marginTop: "18px", display: "grid", gap: "12px" }}>
        {clients.map((client) => (
          <div key={client.name} className="kpi-card">
            <div style={{ fontWeight: 700 }}>{client.name}</div>
            <div className="note">Status: {client.status}</div>
            <div className="note">Last service: {client.lastService}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
