const items = [
  {
    title: "Reliable Service",
    body: "We monitor storms and respond quickly to keep properties safe and accessible."
  },
  {
    title: "Commercial Ready",
    body: "Trusted by offices, plazas, apartments, and businesses across Western NY."
  },
  {
    title: "Year-Round Care",
    body: "Snow removal in winter. Lawn and property care the rest of the year."
  },
  {
    title: "Local & Responsive",
    body: "Western New York based and ready when you need us."
  }
];

export default function WhyUs() {
  return (
    <section className="section">
      <div className="section-header">
        <h2>Why Property Owners Choose Neat Curb</h2>
      </div>
      <div className="grid-4">
        {items.map((item) => (
          <div key={item.title} className="info-card">
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
