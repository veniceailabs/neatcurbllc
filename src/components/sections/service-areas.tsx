const areas = [
  "Buffalo",
  "Amherst",
  "Cheektowaga",
  "Tonawanda",
  "West Seneca",
  "Niagara Falls",
  "Surrounding Areas"
];

export default function ServiceAreas() {
  return (
    <section className="section" id="areas">
      <div className="section-header">
        <h2>Proudly Serving Western New York</h2>
      </div>
      <div className="areas-grid">
        {areas.map((area) => (
          <div key={area} className="area-chip">
            {area}
          </div>
        ))}
      </div>
    </section>
  );
}
