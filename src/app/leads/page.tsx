import PipelineBoard from "@/components/PipelineBoard";
import SectionHeader from "@/components/SectionHeader";

export default function LeadsPage() {
  return (
    <div className="panel">
      <SectionHeader
        title="Leads & Sales"
        subtitle="Auto-captured leads with follow-up automation and conversions."
        action={<span className="pill">Conversion 42%</span>}
      />
      <div style={{ marginTop: "18px" }}>
        <PipelineBoard />
      </div>
    </div>
  );
}
