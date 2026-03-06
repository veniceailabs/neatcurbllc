export type FieldDef = {
  key: string;
  label: string;
  type: "text" | "textarea" | "date" | "number" | "select" | "checkbox";
  options?: string[]; // for select
  placeholder?: string;
  required?: boolean;
};

export type Template = {
  id: string;
  label: string;
  description: string;
  icon: string;
  category: "service" | "employment" | "equipment" | "legal";
  fields: FieldDef[];
  render: (f: Record<string, string>) => string;
};

const today = () => new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

// ─── SNOW REMOVAL CONTRACT ───────────────────────────────────────────────────
const snowContract: Template = {
  id: "snow_removal_contract",
  label: "Snow Removal Contract",
  description: "Seasonal or per-push snow plowing, salting, and shoveling agreement.",
  icon: "❄️",
  category: "service",
  fields: [
    { key: "client_name",      label: "Client / Company Name",    type: "text",     required: true },
    { key: "client_address",   label: "Client Billing Address",   type: "text",     required: true },
    { key: "property_address", label: "Service Property Address", type: "text",     required: true },
    { key: "services",         label: "Services Included",        type: "select",   options: ["Plowing only", "Salting only", "Plowing & Salting", "Plowing, Salting & Shoveling"], required: true },
    { key: "trigger_depth",    label: "Snow Trigger Depth (inches)", type: "number", placeholder: "2", required: true },
    { key: "pricing_type",     label: "Pricing Structure",        type: "select",   options: ["Per Push", "Seasonal Flat Rate"], required: true },
    { key: "price",            label: "Price Amount ($)",          type: "number",   required: true },
    { key: "payment_terms",    label: "Payment Terms",            type: "select",   options: ["Net-15", "Net-30", "Due on Receipt"], required: true },
    { key: "season_start",     label: "Season Start Date",        type: "date",     required: true },
    { key: "season_end",       label: "Season End Date",          type: "date",     required: true },
    { key: "notes",            label: "Additional Terms / Notes", type: "textarea", placeholder: "Any specific access instructions, gate codes, etc." },
  ],
  render: (f) => `
<div class="nc-doc">
  <div class="nc-doc-header">
    <div class="nc-doc-logo-block">
      <strong>Neat Curb LLC</strong><br>
      229 West Genesee St, Box 106<br>
      Buffalo, NY 14202<br>
      (716) 241-1499 · neatcurbllc.com
    </div>
    <div class="nc-doc-title-block">
      <h1>Snow Removal Service Contract</h1>
      <p>Contract Date: ${today()}</p>
    </div>
  </div>

  <section>
    <h2>1. Parties</h2>
    <p><strong>Service Provider:</strong> Neat Curb LLC, a New York limited liability company ("Neat Curb"), located at 229 West Genesee St, Box 106, Buffalo, NY 14202.</p>
    <p><strong>Client:</strong> ${f.client_name || "[CLIENT NAME]"}, located at ${f.client_address || "[CLIENT ADDRESS]"} ("Client").</p>
  </section>

  <section>
    <h2>2. Service Property</h2>
    <p>Snow removal services will be performed at the following property:</p>
    <p class="nc-doc-field-value">${f.property_address || "[PROPERTY ADDRESS]"}</p>
  </section>

  <section>
    <h2>3. Scope of Services</h2>
    <p>Neat Curb shall provide the following services: <strong>${f.services || "[SERVICES]"}</strong>.</p>
    <p>Services will be performed when snowfall accumulation reaches or exceeds <strong>${f.trigger_depth || "2"} inches</strong> at the service property, as measured by Neat Curb personnel or local weather data.</p>
    <p>Neat Curb will make reasonable efforts to complete service within 24 hours of trigger conditions being met, subject to weather severity, equipment availability, and route priority.</p>
  </section>

  <section>
    <h2>4. Contract Term</h2>
    <p>This Agreement is effective from <strong>${f.season_start || "[START DATE]"}</strong> through <strong>${f.season_end || "[END DATE]"}</strong> (the "Season").</p>
    <p>Either party may terminate this Agreement with 14 days written notice. In the event of termination, the Client shall owe payment for all services rendered through the termination date.</p>
  </section>

  <section>
    <h2>5. Pricing &amp; Payment</h2>
    <p><strong>Pricing Structure:</strong> ${f.pricing_type || "[PRICING TYPE]"}</p>
    <p><strong>Amount:</strong> $${f.price || "[PRICE]"}${f.pricing_type === "Per Push" ? " per service visit" : " for the season"}</p>
    <p><strong>Payment Terms:</strong> ${f.payment_terms || "Net-30"}. Invoices are issued following each service visit (per push) or at the start of the season (seasonal). Overdue balances accrue a 1.5% monthly late fee.</p>
    <p>Client authorizes Neat Curb to invoice the billing address on file. Payment may be made by check, ACH, or card via invoice link.</p>
  </section>

  <section>
    <h2>6. Client Responsibilities</h2>
    <ul>
      <li>Ensure vehicles, equipment, and personal property are removed from service areas prior to plowing.</li>
      <li>Mark driveway edges, curbs, and obstacles (e.g., low walls, garden borders) with visible stakes or markers before the first snowfall.</li>
      <li>Provide clear access to the property. Locked gates must have a code or key on file with Neat Curb.</li>
      <li>Notify Neat Curb of any property changes, hazards, or access issues promptly.</li>
    </ul>
  </section>

  <section>
    <h2>7. Limitation of Liability</h2>
    <p>Neat Curb shall not be liable for damage to unmarked or hidden property features, including but not limited to underground utilities, irrigation lines, lawn edging, decorative stone, or unmarked curbing. Neat Curb's total liability under this Agreement shall not exceed the total fees paid by Client during the Season. Neat Curb carries general liability insurance; a certificate is available upon request.</p>
  </section>

  <section>
    <h2>8. Force Majeure</h2>
    <p>Neat Curb shall not be in breach of this Agreement for delays or failures caused by extreme weather events, equipment failure, labor shortage, government order, or other circumstances beyond its reasonable control.</p>
  </section>

  ${f.notes ? `<section><h2>9. Additional Terms</h2><p>${f.notes}</p></section>` : ""}

  <section>
    <h2>${f.notes ? "10" : "9"}. Entire Agreement</h2>
    <p>This Agreement constitutes the entire understanding between the parties with respect to snow removal services and supersedes all prior discussions. Amendments must be in writing and signed by both parties.</p>
  </section>

  <div class="nc-doc-sig-block">
    <div class="nc-doc-sig-party">
      <p><strong>Neat Curb LLC</strong></p>
      <div class="nc-doc-sig-line"></div>
      <p>Authorized Representative</p>
      <div class="nc-doc-sig-line"></div>
      <p>Date</p>
    </div>
    <div class="nc-doc-sig-party">
      <p><strong>${f.client_name || "Client"}</strong></p>
      <div class="nc-doc-sig-line"></div>
      <p>Authorized Signature</p>
      <div class="nc-doc-sig-line"></div>
      <p>Date</p>
    </div>
  </div>
</div>
`,
};

// ─── LAWN MAINTENANCE AGREEMENT ─────────────────────────────────────────────
const lawnAgreement: Template = {
  id: "lawn_maintenance_agreement",
  label: "Lawn Maintenance Agreement",
  description: "Recurring mowing, edging, fertilization, and property upkeep contract.",
  icon: "🌿",
  category: "service",
  fields: [
    { key: "client_name",      label: "Client / Company Name",    type: "text",   required: true },
    { key: "client_address",   label: "Client Billing Address",   type: "text",   required: true },
    { key: "property_address", label: "Service Property Address", type: "text",   required: true },
    { key: "services",         label: "Services",                 type: "select", options: ["Mowing & Edging", "Mowing, Edging & Blowing", "Full Lawn Maintenance", "Spring/Fall Cleanup Only"], required: true },
    { key: "frequency",        label: "Service Frequency",        type: "select", options: ["Weekly", "Bi-Weekly", "Monthly", "As Needed"], required: true },
    { key: "price",            label: "Price Per Visit ($)",       type: "number", required: true },
    { key: "payment_terms",    label: "Payment Terms",            type: "select", options: ["Net-15", "Net-30", "Due on Receipt"], required: true },
    { key: "start_date",       label: "Service Start Date",       type: "date",   required: true },
    { key: "contract_term",    label: "Contract Term",            type: "select", options: ["Month-to-Month", "April – October", "Full Calendar Year", "One-Time Service"] },
    { key: "notes",            label: "Additional Terms / Notes", type: "textarea" },
  ],
  render: (f) => `
<div class="nc-doc">
  <div class="nc-doc-header">
    <div class="nc-doc-logo-block">
      <strong>Neat Curb LLC</strong><br>
      229 West Genesee St, Box 106<br>
      Buffalo, NY 14202<br>
      (716) 241-1499 · neatcurbllc.com
    </div>
    <div class="nc-doc-title-block">
      <h1>Lawn Maintenance Agreement</h1>
      <p>Agreement Date: ${today()}</p>
    </div>
  </div>

  <section>
    <h2>1. Parties</h2>
    <p><strong>Service Provider:</strong> Neat Curb LLC ("Neat Curb"), Buffalo, NY.</p>
    <p><strong>Client:</strong> ${f.client_name || "[CLIENT NAME]"}, ${f.client_address || "[ADDRESS]"} ("Client").</p>
  </section>

  <section>
    <h2>2. Service Property</h2>
    <p class="nc-doc-field-value">${f.property_address || "[PROPERTY ADDRESS]"}</p>
  </section>

  <section>
    <h2>3. Scope of Services</h2>
    <p>Neat Curb shall provide: <strong>${f.services || "[SERVICES]"}</strong>.</p>
    <p>Services will be performed on a <strong>${f.frequency || "[FREQUENCY]"}</strong> basis, beginning <strong>${f.start_date || "[START DATE]"}</strong>, for the term of <strong>${f.contract_term || "Month-to-Month"}</strong>.</p>
    <p>Neat Curb reserves the right to skip a scheduled visit due to unsafe weather conditions (heavy rain, lightning, extreme heat) without penalty. A makeup visit will be offered at no additional charge when conditions permit.</p>
  </section>

  <section>
    <h2>4. Pricing &amp; Payment</h2>
    <p><strong>Per Visit Rate:</strong> $${f.price || "[PRICE]"}</p>
    <p><strong>Payment Terms:</strong> ${f.payment_terms || "Net-30"}. Invoices are issued following each service visit. Overdue balances accrue a 1.5% monthly late fee.</p>
  </section>

  <section>
    <h2>5. Client Responsibilities</h2>
    <ul>
      <li>Keep lawn areas clear of debris, toys, pet waste, and obstacles prior to scheduled service.</li>
      <li>Ensure access to property on service days. If locked, provide a gate code or key in advance.</li>
      <li>Notify Neat Curb of any irrigation lines, invisible fences, or buried utilities.</li>
      <li>Pets must be secured during service visits.</li>
    </ul>
  </section>

  <section>
    <h2>6. Cancellation</h2>
    <p>Either party may cancel this Agreement with 14 days written notice. No cancellation fee applies. Client is responsible for payment of all services rendered prior to the cancellation date.</p>
  </section>

  <section>
    <h2>7. Limitation of Liability</h2>
    <p>Neat Curb shall not be liable for damage to unmarked or hidden features including underground utilities, invisible fence wiring, or decorative edging. Neat Curb carries general liability insurance; a certificate is available upon request.</p>
  </section>

  ${f.notes ? `<section><h2>8. Additional Terms</h2><p>${f.notes}</p></section>` : ""}

  <div class="nc-doc-sig-block">
    <div class="nc-doc-sig-party">
      <p><strong>Neat Curb LLC</strong></p>
      <div class="nc-doc-sig-line"></div>
      <p>Authorized Representative</p>
      <div class="nc-doc-sig-line"></div>
      <p>Date</p>
    </div>
    <div class="nc-doc-sig-party">
      <p><strong>${f.client_name || "Client"}</strong></p>
      <div class="nc-doc-sig-line"></div>
      <p>Authorized Signature</p>
      <div class="nc-doc-sig-line"></div>
      <p>Date</p>
    </div>
  </div>
</div>
`,
};

// ─── SUBCONTRACTOR / WORKER AGREEMENT ────────────────────────────────────────
const workerAgreement: Template = {
  id: "subcontractor_agreement",
  label: "Subcontractor Agreement",
  description: "Independent contractor agreement for seasonal crew members and workers.",
  icon: "🧑‍🔧",
  category: "employment",
  fields: [
    { key: "worker_name",    label: "Worker / Contractor Name",  type: "text",   required: true },
    { key: "worker_address", label: "Worker Address",            type: "text",   required: true },
    { key: "role",           label: "Role / Position",           type: "select", options: ["Snow Plow Operator", "Salting Technician", "Lawn Crew Member", "General Laborer", "Equipment Operator"], required: true },
    { key: "pay_rate",       label: "Pay Rate ($)",              type: "number", required: true },
    { key: "pay_type",       label: "Pay Structure",             type: "select", options: ["Per Hour", "Per Job", "Per Route", "Flat Weekly Rate"], required: true },
    { key: "start_date",     label: "Start Date",               type: "date",   required: true },
    { key: "end_date",       label: "End Date (leave blank if ongoing)", type: "date" },
    { key: "notes",          label: "Additional Terms",         type: "textarea" },
  ],
  render: (f) => `
<div class="nc-doc">
  <div class="nc-doc-header">
    <div class="nc-doc-logo-block">
      <strong>Neat Curb LLC</strong><br>
      229 West Genesee St, Box 106<br>
      Buffalo, NY 14202<br>
      (716) 241-1499 · neatcurbllc.com
    </div>
    <div class="nc-doc-title-block">
      <h1>Independent Contractor Agreement</h1>
      <p>Agreement Date: ${today()}</p>
    </div>
  </div>

  <section>
    <h2>1. Parties</h2>
    <p><strong>Company:</strong> Neat Curb LLC ("Neat Curb"), 229 West Genesee St, Box 106, Buffalo, NY 14202.</p>
    <p><strong>Contractor:</strong> ${f.worker_name || "[CONTRACTOR NAME]"}, ${f.worker_address || "[ADDRESS]"} ("Contractor").</p>
  </section>

  <section>
    <h2>2. Engagement &amp; Role</h2>
    <p>Neat Curb engages Contractor as an independent contractor to perform services as: <strong>${f.role || "[ROLE]"}</strong>.</p>
    <p>Contractor is not an employee of Neat Curb. Contractor shall not be entitled to employee benefits, workers' compensation, unemployment insurance, or other employer-provided benefits. Contractor is solely responsible for all federal, state, and local taxes on compensation received under this Agreement.</p>
  </section>

  <section>
    <h2>3. Term</h2>
    <p>This Agreement begins <strong>${f.start_date || "[START DATE]"}</strong>${f.end_date ? ` and ends <strong>${f.end_date}</strong>` : " and continues on a month-to-month basis until terminated by either party with 7 days written notice"}.</p>
  </section>

  <section>
    <h2>4. Compensation</h2>
    <p><strong>Rate:</strong> $${f.pay_rate || "[RATE]"} ${f.pay_type || "per hour"}.</p>
    <p>Contractor invoices Neat Curb weekly (or as mutually agreed). Payment will be issued within 7 business days of invoice receipt via check or ACH. Contractor is responsible for providing accurate time/job records.</p>
  </section>

  <section>
    <h2>5. Equipment &amp; Tools</h2>
    <p>Neat Curb may provide equipment (vehicles, plows, salters, mowers, hand tools) for use during contracted work. Contractor agrees to:</p>
    <ul>
      <li>Use all equipment only for Neat Curb-authorized tasks.</li>
      <li>Report any damage, malfunction, or accident immediately.</li>
      <li>Return all equipment in the same condition as received, normal wear excepted.</li>
      <li>Be liable for damage caused by negligent or unauthorized use.</li>
    </ul>
  </section>

  <section>
    <h2>6. Conduct &amp; Standards</h2>
    <ul>
      <li>Contractor shall perform all work in a professional, safe, and timely manner.</li>
      <li>Contractor shall not operate Neat Curb equipment under the influence of alcohol or drugs.</li>
      <li>Contractor shall maintain a valid driver's license for any vehicle operation.</li>
      <li>Contractor shall carry proof of insurance (auto and/or liability) if using personal vehicles.</li>
    </ul>
  </section>

  <section>
    <h2>7. Confidentiality</h2>
    <p>Contractor agrees to keep confidential all client information, pricing, routes, and proprietary business information of Neat Curb during and after the term of this Agreement.</p>
  </section>

  <section>
    <h2>8. Termination</h2>
    <p>Either party may terminate this Agreement at any time with 7 days written notice. Neat Curb may terminate immediately for cause (misconduct, equipment damage, failure to perform). Contractor shall be paid for all work performed through the termination date.</p>
  </section>

  ${f.notes ? `<section><h2>9. Additional Terms</h2><p>${f.notes}</p></section>` : ""}

  <div class="nc-doc-sig-block">
    <div class="nc-doc-sig-party">
      <p><strong>Neat Curb LLC</strong></p>
      <div class="nc-doc-sig-line"></div>
      <p>Authorized Representative</p>
      <div class="nc-doc-sig-line"></div>
      <p>Date</p>
    </div>
    <div class="nc-doc-sig-party">
      <p><strong>${f.worker_name || "Contractor"}</strong></p>
      <div class="nc-doc-sig-line"></div>
      <p>Contractor Signature</p>
      <div class="nc-doc-sig-line"></div>
      <p>Date</p>
    </div>
  </div>
</div>
`,
};

// ─── EQUIPMENT USE AGREEMENT ─────────────────────────────────────────────────
const equipmentAgreement: Template = {
  id: "equipment_use_agreement",
  label: "Equipment Use Agreement",
  description: "Authorizes use of company equipment and outlines damage/return responsibilities.",
  icon: "🚜",
  category: "equipment",
  fields: [
    { key: "operator_name",    label: "Operator Name",         type: "text",     required: true },
    { key: "equipment_list",   label: "Equipment Being Issued", type: "textarea", placeholder: "e.g., 2024 RAM 2500 (Plate: ABC123), Hiniker Plow (S/N: 12345), Tailgate Spreader...", required: true },
    { key: "issue_date",       label: "Issue Date",            type: "date",     required: true },
    { key: "return_date",      label: "Expected Return Date (optional)", type: "date" },
    { key: "damage_deductible",label: "Operator Damage Deductible ($)", type: "number", placeholder: "500" },
    { key: "notes",            label: "Special Conditions",   type: "textarea" },
  ],
  render: (f) => `
<div class="nc-doc">
  <div class="nc-doc-header">
    <div class="nc-doc-logo-block">
      <strong>Neat Curb LLC</strong><br>
      229 West Genesee St, Box 106<br>
      Buffalo, NY 14202<br>
      (716) 241-1499 · neatcurbllc.com
    </div>
    <div class="nc-doc-title-block">
      <h1>Equipment Use Agreement</h1>
      <p>Issue Date: ${f.issue_date || today()}</p>
    </div>
  </div>

  <section>
    <h2>1. Operator</h2>
    <p><strong>${f.operator_name || "[OPERATOR NAME]"}</strong> ("Operator") is authorized to use the following Neat Curb LLC equipment:</p>
  </section>

  <section>
    <h2>2. Equipment Issued</h2>
    <div class="nc-doc-field-value nc-doc-equipment-list">${(f.equipment_list || "[EQUIPMENT LIST]").replace(/\n/g, "<br>")}</div>
    ${f.return_date ? `<p><strong>Expected Return:</strong> ${f.return_date}</p>` : ""}
  </section>

  <section>
    <h2>3. Operator Acknowledgments</h2>
    <p>By signing this Agreement, Operator acknowledges and agrees to the following:</p>
    <ul>
      <li>Operator has been trained on the safe and proper operation of each piece of equipment listed above.</li>
      <li>Operator will use the equipment only for Neat Curb LLC-authorized work and in compliance with all applicable laws and regulations.</li>
      <li>Operator will not operate any motorized equipment while impaired by alcohol, drugs, or medication.</li>
      <li>Operator will immediately report any accidents, damage, or mechanical issues to Neat Curb management.</li>
      <li>Operator will return all equipment clean, fueled, and in the same condition as received (normal wear excepted).</li>
      <li>Operator will not loan or transfer any equipment to a third party.</li>
    </ul>
  </section>

  <section>
    <h2>4. Damage Liability</h2>
    <p>Operator is responsible for damage caused by negligent, reckless, or unauthorized use of equipment. In such cases, Operator shall be liable for the lesser of actual repair cost or ${f.damage_deductible ? `$${f.damage_deductible}` : "the actual repair cost"}${f.damage_deductible ? " (Operator's deductible)" : ""}. Neat Curb carries commercial insurance; normal operational wear is covered. Operator may be required to provide written statements in connection with any insurance claim.</p>
  </section>

  ${f.notes ? `<section><h2>5. Special Conditions</h2><p>${f.notes}</p></section>` : ""}

  <div class="nc-doc-sig-block">
    <div class="nc-doc-sig-party">
      <p><strong>Neat Curb LLC</strong></p>
      <div class="nc-doc-sig-line"></div>
      <p>Issuing Manager</p>
      <div class="nc-doc-sig-line"></div>
      <p>Date</p>
    </div>
    <div class="nc-doc-sig-party">
      <p><strong>${f.operator_name || "Operator"}</strong></p>
      <div class="nc-doc-sig-line"></div>
      <p>Operator Signature</p>
      <div class="nc-doc-sig-line"></div>
      <p>Date</p>
    </div>
  </div>
</div>
`,
};

// ─── PROPERTY ACCESS & LIABILITY WAIVER ──────────────────────────────────────
const liabilityWaiver: Template = {
  id: "property_liability_waiver",
  label: "Property Access & Liability Waiver",
  description: "Client acknowledges pre-existing conditions and grants property access.",
  icon: "📋",
  category: "legal",
  fields: [
    { key: "client_name",      label: "Client Name",             type: "text", required: true },
    { key: "property_address", label: "Property Address",        type: "text", required: true },
    { key: "service_type",     label: "Service Type",            type: "select", options: ["Snow Removal", "Lawn Maintenance", "Property Cleanup", "Multiple Services"], required: true },
    { key: "known_hazards",    label: "Known Property Hazards / Pre-Existing Damage", type: "textarea", placeholder: "e.g., cracked driveway section near garage, underground sprinkler heads in east lawn, low retaining wall along left side..." },
    { key: "notes",            label: "Additional Conditions",   type: "textarea" },
  ],
  render: (f) => `
<div class="nc-doc">
  <div class="nc-doc-header">
    <div class="nc-doc-logo-block">
      <strong>Neat Curb LLC</strong><br>
      229 West Genesee St, Box 106<br>
      Buffalo, NY 14202<br>
      (716) 241-1499 · neatcurbllc.com
    </div>
    <div class="nc-doc-title-block">
      <h1>Property Access &amp; Liability Waiver</h1>
      <p>Date: ${today()}</p>
    </div>
  </div>

  <section>
    <h2>1. Property &amp; Client</h2>
    <p><strong>Client:</strong> ${f.client_name || "[CLIENT NAME]"}</p>
    <p><strong>Property Address:</strong> ${f.property_address || "[PROPERTY ADDRESS]"}</p>
    <p><strong>Service(s):</strong> ${f.service_type || "[SERVICE]"}</p>
  </section>

  <section>
    <h2>2. Grant of Access</h2>
    <p>Client hereby grants Neat Curb LLC, its employees, subcontractors, and agents permission to access the above-referenced property for the purpose of performing ${f.service_type || "contracted"} services. This access is granted during normal service hours and during storm events as applicable.</p>
  </section>

  <section>
    <h2>3. Pre-Existing Conditions</h2>
    <p>Client acknowledges the following pre-existing property conditions, hazards, or areas of concern:</p>
    <div class="nc-doc-field-value">${f.known_hazards ? f.known_hazards.replace(/\n/g, "<br>") : "None noted."}</div>
    <p>Neat Curb LLC shall not be liable for damage to or deterioration of pre-existing conditions noted above, or for damage caused by unmarked, hidden, or undisclosed hazards. Client is responsible for marking and disclosing all property hazards prior to service commencement.</p>
  </section>

  <section>
    <h2>4. Limitation of Liability</h2>
    <p>Client agrees that Neat Curb LLC's liability for any claim arising out of services performed under this Agreement shall not exceed the amount paid by Client for services in the 30 days preceding the claim. Neat Curb is not liable for acts of nature, normal wear, or pre-existing conditions. Neat Curb carries general liability insurance; a certificate is available upon request.</p>
  </section>

  <section>
    <h2>5. Acknowledgment</h2>
    <p>Client has read and understands this waiver. Client acknowledges that this is a binding legal document and has had opportunity to consult with an attorney prior to signing.</p>
  </section>

  ${f.notes ? `<section><h2>6. Additional Conditions</h2><p>${f.notes}</p></section>` : ""}

  <div class="nc-doc-sig-block">
    <div class="nc-doc-sig-party">
      <p><strong>Neat Curb LLC</strong></p>
      <div class="nc-doc-sig-line"></div>
      <p>Authorized Representative</p>
      <div class="nc-doc-sig-line"></div>
      <p>Date</p>
    </div>
    <div class="nc-doc-sig-party">
      <p><strong>${f.client_name || "Client"}</strong></p>
      <div class="nc-doc-sig-line"></div>
      <p>Client Signature</p>
      <div class="nc-doc-sig-line"></div>
      <p>Date</p>
    </div>
  </div>
</div>
`,
};

export const TEMPLATES: Template[] = [
  snowContract,
  lawnAgreement,
  workerAgreement,
  equipmentAgreement,
  liabilityWaiver,
];

export const getTemplate = (id: string) => TEMPLATES.find((t) => t.id === id);
