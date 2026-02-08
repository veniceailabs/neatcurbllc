import SectionHeader from "@/components/SectionHeader";

const invoices = [
  { id: "INV-1049", client: "Belmont Retail", status: "Net-15", amount: "$2,420" },
  { id: "INV-1050", client: "Pine Rd 55", status: "Paid", amount: "$85" },
  { id: "INV-1051", client: "Oak Ct 14", status: "Net-15", amount: "$1,200" }
];

export default function InvoicesPage() {
  return (
    <div className="panel">
      <SectionHeader
        title="Invoices & Aging"
        subtitle="Stripe-connected billing and automatic reminders."
        action={<span className="pill">$12.4k due</span>}
      />
      <div style={{ marginTop: "18px", display: "grid", gap: "12px" }}>
        {invoices.map((invoice) => (
          <div key={invoice.id} className="kpi-card">
            <div style={{ fontWeight: 700 }}>{invoice.id}</div>
            <div className="note">Client: {invoice.client}</div>
            <div className="note">Status: {invoice.status}</div>
            <div style={{ fontWeight: 700 }}>{invoice.amount}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
