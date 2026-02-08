import LeadIntakeForm from "@/components/LeadIntakeForm";
import SectionHeader from "@/components/SectionHeader";

export default function LeadIntakePage() {
  return (
    <div>
      <SectionHeader
        title="Lead Intake & Pricing Logic"
        subtitle="The quote engine that turns a lead into revenue immediately."
        action={<span className="pill">AI Quote Ready</span>}
      />
      <div style={{ marginTop: "18px" }}>
        <LeadIntakeForm />
      </div>
    </div>
  );
}
