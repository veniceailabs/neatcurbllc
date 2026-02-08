"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getSnowQuote,
  type Accumulation,
  type PropertyClass,
  type ServiceType
} from "@/lib/pricing";
import { supabase } from "@/lib/supabaseClient";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

const accumulationOptions: { value: Accumulation; label: string }[] = [
  { value: "2-3", label: "2-3 inches (Standard)" },
  { value: "3-6", label: "3-6 inches (+50%)" },
  { value: "6-12", label: "6-12 inches (+75%)" },
  { value: "12+", label: "12+ inches (+100%)" }
];

export default function LeadIntakeForm() {
  const [propertyClass, setPropertyClass] = useState<PropertyClass>(
    "residential"
  );
  const [serviceType, setServiceType] = useState<ServiceType>("per_push");
  const [size, setSize] = useState("small");
  const [accumulation, setAccumulation] = useState<Accumulation>("2-3");
  const [addOns, setAddOns] = useState({
    sidewalk: true,
    ice: false,
    driftReturn: false
  });
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadAddress, setLeadAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const sizeOptions = useMemo(() => {
    if (propertyClass === "residential") {
      return [
        { value: "small", label: "Small driveway" },
        { value: "medium", label: "Medium driveway" },
        { value: "large", label: "Large driveway" }
      ];
    }
    return [
      { value: "small", label: "Small commercial" },
      { value: "plaza", label: "Plaza / multi-suite" }
    ];
  }, [propertyClass]);

  useEffect(() => {
    if (!sizeOptions.find((option) => option.value === size)) {
      setSize(sizeOptions[0].value);
    }
  }, [size, sizeOptions]);

  const quote = getSnowQuote({
    propertyClass,
    serviceType,
    size: size as "small" | "medium" | "large" | "plaza",
    accumulation,
    addOns
  });

  const totalNote =
    serviceType === "seasonal"
      ? "Estimated total for the full season."
      : "Estimated total for this push.";

  const handleSave = async (status: "new" | "draft") => {
    setSaveMessage(null);
    if (!leadName) {
      setSaveMessage("Lead name is required.");
      return;
    }
    setSaving(true);

    const message = [
      `Property class: ${propertyClass}`,
      `Service type: ${serviceType}`,
      `Size: ${size}`,
      `Accumulation: ${accumulation}`,
      `Add-ons: sidewalk=${addOns.sidewalk}, ice=${addOns.ice}, drift=${addOns.driftReturn}`,
      `Quote: ${currency.format(quote.total.low)}${
        quote.total.high !== quote.total.low
          ? ` - ${currency.format(quote.total.high)}`
          : ""
      }`,
      `Status: ${status}`
    ].join(" | ");

    const { error } = await supabase.from("leads").insert({
      name: leadName,
      email: leadEmail || null,
      phone: leadPhone || null,
      address: leadAddress || null,
      service: "Snow Removal",
      message,
      estimated_low: quote.total.low,
      estimated_high: quote.total.high,
      pricing_meta: {
        propertyClass,
        serviceType,
        size,
        accumulation,
        addOns
      }
    });

    if (error) {
      setSaveMessage(error.message);
    } else {
      const { data: user } = await supabase.auth.getUser();
      await supabase.from("audit_logs").insert({
        actor_id: user.user?.id ?? null,
        actor: user.user?.email ?? "admin",
        action: status === "draft" ? "lead_draft_saved" : "lead_created",
        entity: "lead",
        metadata: {
          name: leadName,
          address: leadAddress,
          quote_low: quote.total.low,
          quote_high: quote.total.high
        }
      });

      setSaveMessage(status === "draft" ? "Draft saved." : "Lead saved.");
      setLeadName("");
      setLeadEmail("");
      setLeadPhone("");
      setLeadAddress("");
    }
    setSaving(false);
  };

  return (
    <div className="grid-2">
      <div className="panel">
        <div className="section-title">Instant Snow Quote</div>
        <div className="section-sub">
          Capture a lead and generate pricing automatically within seconds.
        </div>

        <div className="grid-2" style={{ marginTop: "20px" }}>
          <label className="form-field">
            Property class
            <select
              value={propertyClass}
              onChange={(event) =>
                setPropertyClass(event.target.value as PropertyClass)
              }
            >
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
            </select>
          </label>

          <label className="form-field">
            Service type
            <select
              value={serviceType}
              onChange={(event) =>
                setServiceType(event.target.value as ServiceType)
              }
            >
              <option value="per_push">Per push</option>
              <option value="seasonal">Seasonal contract</option>
            </select>
          </label>
        </div>

        <div className="grid-2" style={{ marginTop: "16px" }}>
          <label className="form-field">
            Property size
            <select value={size} onChange={(event) => setSize(event.target.value)}>
              {sizeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            Forecasted accumulation
            <select
              value={accumulation}
              onChange={(event) =>
                setAccumulation(event.target.value as Accumulation)
              }
              disabled={serviceType === "seasonal"}
            >
              {accumulationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid-3" style={{ marginTop: "16px" }}>
          <label className="form-field">
            <span>Sidewalks</span>
            <select
              value={addOns.sidewalk ? "yes" : "no"}
              onChange={(event) =>
                setAddOns((prev) => ({
                  ...prev,
                  sidewalk: event.target.value === "yes"
                }))
              }
              disabled={propertyClass === "commercial" || serviceType !== "per_push"}
            >
              <option value="yes">Include</option>
              <option value="no">No</option>
            </select>
          </label>

          <label className="form-field">
            <span>Ice management</span>
            <select
              value={addOns.ice ? "yes" : "no"}
              onChange={(event) =>
                setAddOns((prev) => ({
                  ...prev,
                  ice: event.target.value === "yes"
                }))
              }
              disabled={serviceType !== "per_push"}
            >
              <option value="no">No</option>
              <option value="yes">Add</option>
            </select>
          </label>

          <label className="form-field">
            <span>Drift return</span>
            <select
              value={addOns.driftReturn ? "yes" : "no"}
              onChange={(event) =>
                setAddOns((prev) => ({
                  ...prev,
                  driftReturn: event.target.value === "yes"
                }))
              }
              disabled={serviceType !== "per_push"}
            >
              <option value="no">No</option>
              <option value="yes">If needed</option>
            </select>
          </label>
        </div>

        <div className="grid-2" style={{ marginTop: "16px" }}>
          <label className="form-field">
            Lead name
            <input
              placeholder="Client name"
              value={leadName}
              onChange={(event) => setLeadName(event.target.value)}
            />
          </label>
          <label className="form-field">
            Property address
            <input
              placeholder="Street address"
              value={leadAddress}
              onChange={(event) => setLeadAddress(event.target.value)}
            />
          </label>
        </div>
        <div className="grid-2" style={{ marginTop: "16px" }}>
          <label className="form-field">
            Email
            <input
              type="email"
              placeholder="email@example.com"
              value={leadEmail}
              onChange={(event) => setLeadEmail(event.target.value)}
            />
          </label>
          <label className="form-field">
            Phone
            <input
              type="tel"
              placeholder="(716) 241-1499"
              value={leadPhone}
              onChange={(event) => setLeadPhone(event.target.value)}
            />
          </label>
        </div>

        <div style={{ marginTop: "18px", display: "flex", gap: "12px" }}>
          <button
            className="button-primary"
            type="button"
            onClick={() => handleSave("new")}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Lead + Send Quote"}
          </button>
          <button
            className="button-primary"
            type="button"
            style={{ background: "#016B37" }}
            onClick={() => handleSave("draft")}
            disabled={saving}
          >
            Save Draft
          </button>
        </div>
        {saveMessage ? <div className="note">{saveMessage}</div> : null}
      </div>

      <div className="quote-card">
        <div className="section-title">Estimated Quote</div>
        <div className="section-sub">Instant calculation using the 2-3 inch standard.</div>
        <div style={{ marginTop: "16px", display: "grid", gap: "10px" }}>
          {quote.lines.map((line) => (
            <div key={line.label} style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontWeight: 600 }}>{line.label}</div>
                {line.note ? <div className="note">{line.note}</div> : null}
              </div>
              <div>
                {currency.format(line.range.low)}
                {line.range.high !== line.range.low
                  ? ` - ${currency.format(line.range.high)}`
                  : ""}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "16px", borderTop: "1px solid var(--stroke)", paddingTop: "16px" }}>
          <div className="quote-total">
            {currency.format(quote.total.low)}
            {quote.total.high !== quote.total.low
              ? ` - ${currency.format(quote.total.high)}`
              : ""}
          </div>
          <div className="note">{totalNote}</div>
        </div>

        {quote.notes.length > 0 ? (
          <div style={{ marginTop: "12px", display: "grid", gap: "6px" }}>
            {quote.notes.map((note) => (
              <div key={note} className="note">
                {note}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
