import { createAuditBundle, type AuditRecord } from "@/lib/audit";
import SectionHeader from "@/components/SectionHeader";

const sampleRecords: AuditRecord[] = [
  {
    id: "evt-0001",
    timestamp: "2026-02-08T07:10:00Z",
    actor: "System",
    action: "Invoice generated",
    meta: { invoice: "INV-1051", amount: 1200 }
  },
  {
    id: "evt-0002",
    timestamp: "2026-02-08T08:05:00Z",
    actor: "Dispatcher",
    action: "Route dispatched",
    meta: { route: "Route A", crews: 6 }
  },
  {
    id: "evt-0003",
    timestamp: "2026-02-08T09:40:00Z",
    actor: "Business AI",
    action: "Follow-up sent",
    meta: { lead: "Harrison LLC", channel: "SMS" }
  }
];

export default function AuditPage() {
  const audit = createAuditBundle(sampleRecords);

  return (
    <div className="panel">
      <SectionHeader
        title="Merkle Audit Security"
        subtitle="Tamper-proof session and financial logs with cryptographic verification."
        action={<span className="pill">Root Locked</span>}
      />
      <div style={{ marginTop: "16px" }}>
        <div className="kpi-card" style={{ marginBottom: "16px" }}>
          <div className="kpi-label">Current Merkle Root</div>
          <div style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
            {audit.root}
          </div>
        </div>
        <div style={{ display: "grid", gap: "12px" }}>
          {sampleRecords.map((record, index) => (
            <div key={record.id} className="kpi-card">
              <div style={{ fontWeight: 700 }}>{record.action}</div>
              <div className="note">Actor: {record.actor}</div>
              <div className="note">Timestamp: {record.timestamp}</div>
              <div className="note">Leaf hash: {audit.leaves[index]}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
