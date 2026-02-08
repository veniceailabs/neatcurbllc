import SectionHeader from "@/components/SectionHeader";

const schedule = [
  { time: "6:00 AM", job: "Route A - Driveways", crew: "Crew 1" },
  { time: "8:30 AM", job: "Plaza 7 - Parking + walks", crew: "Crew 2" },
  { time: "11:00 AM", job: "Storm cleanup - Maple Ridge", crew: "Crew 3" }
];

export default function SchedulePage() {
  return (
    <div className="panel">
      <SectionHeader
        title="Schedule"
        subtitle="Drag-and-drop calendar view for crews and jobs."
        action={<span className="pill">Today</span>}
      />
      <div style={{ marginTop: "18px", display: "grid", gap: "12px" }}>
        {schedule.map((item) => (
          <div key={item.time} className="kpi-card">
            <div style={{ fontWeight: 700 }}>{item.time}</div>
            <div className="note">{item.job}</div>
            <div className="note">{item.crew}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
