import { ShieldCheck, MapPinned, CloudSnow, Building2 } from "lucide-react";

const items = [
  { icon: Building2, label: "Commercial & Residential" },
  { icon: ShieldCheck, label: "Fully Insured" },
  { icon: CloudSnow, label: "Storm Monitoring" },
  { icon: MapPinned, label: "Western NY Local" }
];

export default function TrustBar() {
  return (
    <section className="trust-bar">
      {items.map(({ icon: Icon, label }) => (
        <div key={label} className="trust-item">
          <Icon size={20} />
          <span>{label}</span>
        </div>
      ))}
    </section>
  );
}
