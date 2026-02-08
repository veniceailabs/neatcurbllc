const pipeline = [
  {
    title: "New Lead",
    items: [
      "Davis Dr 120 - Snow",
      "Pine Rd 55 - Lawn",
      "Main St Plaza"
    ]
  },
  {
    title: "Quote Sent",
    items: ["Oak Ct 14 - Seasonal", "Twin Oaks HOA"]
  },
  {
    title: "Negotiation",
    items: ["Harrison LLC", "Maple Ridge Estates"]
  },
  {
    title: "Contract Signed",
    items: ["Belmont Retail", "Jefferson Ave 44"]
  }
];

export default function PipelineBoard() {
  return (
    <div className="pipeline">
      {pipeline.map((column) => (
        <div key={column.title} className="pipeline-column">
          <div className="kpi-label">{column.title}</div>
          {column.items.map((item) => (
            <div key={item} className="pipeline-card">
              {item}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
