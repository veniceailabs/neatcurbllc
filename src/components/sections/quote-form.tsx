"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { useLanguage } from "@/components/language-context";
import { getCopy } from "@/lib/i18n";
import {
  getPublicEstimate,
  type Accumulation,
  type CommercialSize,
  type CommercialServiceDetail,
  type LawnCareDetail,
  type PropertyMaintenanceDetail,
  type PublicService,
  type ResidentialSize
} from "@/lib/pricing";

type QuoteFormData = {
  name: string;
  email: string;
  phone: string;
  address?: string;
  zip?: string;
  service: PublicService;
  serviceDetail?: LawnCareDetail | PropertyMaintenanceDetail | CommercialServiceDetail;
  message: string;
  propertyClass?: "residential" | "commercial";
  size?: ResidentialSize | CommercialSize;
  accumulation?: Accumulation;
  honeypot?: string;
};

const ZIP_HINTS: Array<{ pattern: RegExp; zip: string }> = [
  { pattern: /\bbuffalo\b/i, zip: "14202" },
  { pattern: /\bamherst\b/i, zip: "14221" },
  { pattern: /\bcheektowaga\b/i, zip: "14225" },
  { pattern: /\btonawanda\b/i, zip: "14150" },
  { pattern: /\bwest\s+seneca\b/i, zip: "14224" },
  { pattern: /\bniagara\s+falls\b/i, zip: "14301" }
];

export default function QuoteForm() {
  const { language } = useLanguage();
  const copy = getCopy(language);
  const { register, handleSubmit, reset, setValue } = useForm<QuoteFormData>({
    defaultValues: { service: "Snow Removal", zip: "" }
  });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">(
    "idle"
  );
  const [service, setService] = useState<PublicService>("Snow Removal");
  const [serviceDetail, setServiceDetail] = useState<
    LawnCareDetail | PropertyMaintenanceDetail | CommercialServiceDetail | ""
  >("");
  const [propertyClass, setPropertyClass] = useState<
    "residential" | "commercial"
  >("residential");
  const [size, setSize] = useState<ResidentialSize | CommercialSize>("medium");
  const [accumulation, setAccumulation] = useState<Accumulation>("2-3");

  const onSubmit = async (data: QuoteFormData) => {
    setStatus("sending");
    const estimate = getPublicEstimate({
      service,
      serviceDetail: serviceDetail || undefined,
      propertyClass,
      size,
      accumulation
    });
    const response = await fetch("/api/public/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address || null,
        zip: data.zip || null,
        service: data.service,
        message: data.message || null,
        estimated_low: estimate.low,
        estimated_high: estimate.high,
        honeypot: data.honeypot || "",
        pricing_meta: {
          propertyClass,
          size,
          accumulation,
          serviceDetail: serviceDetail || null
        }
      })
    });

    if (!response.ok) {
      setStatus("error");
      return;
    }

    setStatus("success");
    reset();
  };

  const services: { value: PublicService; label: string }[] = [
    { value: "Snow Removal", label: copy.quote.services[0] },
    { value: "Lawn Care", label: copy.quote.services[1] },
    { value: "Property Maintenance", label: copy.quote.services[2] },
    { value: "Commercial Services", label: copy.quote.services[3] }
  ];

  const accumulationOptions: { value: Accumulation; label: string }[] = [
    { value: "2-3", label: copy.quote.accumulationOptions[0] },
    { value: "3-6", label: copy.quote.accumulationOptions[1] },
    { value: "6-12", label: copy.quote.accumulationOptions[2] },
    { value: "12+", label: copy.quote.accumulationOptions[3] }
  ];

  return (
    <section className="section" id="quote">
      <div className="section-header">
        <h2>{copy.quote.title}</h2>
      </div>
      <form className="quote-form" onSubmit={handleSubmit(onSubmit)}>
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, width: 0 }}
          {...register("honeypot")}
        />
        <label>
          {copy.quote.name}
          <input {...register("name", { required: true })} />
        </label>
        <label>
          {copy.quote.email}
          <input type="email" {...register("email", { required: true })} />
        </label>
        <label>
          {copy.quote.phone}
          <input type="tel" {...register("phone", { required: true })} />
        </label>
        <label>
          {copy.quote.serviceNeeded}
          <select
            {...register("service", { required: true })}
            value={service}
            onChange={(event) => {
              const next = event.target.value as PublicService;
              setService(next);
              setValue("service", next, { shouldValidate: true });
              setServiceDetail("");
              setValue("serviceDetail", undefined);
              if (next === "Commercial Services") {
                setPropertyClass("commercial");
                setSize("small");
              }
            }}
          >
            {services.map((serviceOption) => (
              <option key={serviceOption.value} value={serviceOption.value}>
                {serviceOption.label}
              </option>
            ))}
          </select>
        </label>
        {service === "Snow Removal" ? (
          <>
            <label>
              {copy.quote.propertyClass}
              <select
                value={propertyClass}
                onChange={(event) =>
                  setPropertyClass(event.target.value as "residential" | "commercial")
                }
              >
                <option value="residential">
                  {copy.quote.propertyClassOptions.residential}
                </option>
                <option value="commercial">
                  {copy.quote.propertyClassOptions.commercial}
                </option>
              </select>
            </label>
            <label>
              {copy.quote.propertySize}
              <select
                value={size}
                onChange={(event) =>
                  setSize(event.target.value as ResidentialSize | CommercialSize)
                }
              >
                {propertyClass === "residential" ? (
                  <>
                    <option value="small">{copy.quote.residentialSizes[0]}</option>
                    <option value="medium">{copy.quote.residentialSizes[1]}</option>
                    <option value="large">{copy.quote.residentialSizes[2]}</option>
                  </>
                ) : (
                  <>
                    <option value="small">{copy.quote.commercialSizes[0]}</option>
                    <option value="plaza">{copy.quote.commercialSizes[1]}</option>
                  </>
                )}
              </select>
            </label>
            <label>
              {copy.quote.snowfall}
              <select
                value={accumulation}
                onChange={(event) =>
                  setAccumulation(event.target.value as Accumulation)
                }
              >
                {accumulationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </>
        ) : null}
        {service === "Lawn Care" ? (
          <label>
            {copy.quote.serviceDetail}
            <select
              value={serviceDetail}
              onChange={(event) => {
                const next = event.target.value as LawnCareDetail;
                setServiceDetail(next);
                setValue("serviceDetail", next, { shouldValidate: true });
              }}
            >
              <option value="">{copy.quote.selectService}</option>
              <option value="Lawn Mowing">{copy.quote.lawnOptions[0]}</option>
              <option value="Fall Leaf Cleanup">{copy.quote.lawnOptions[1]}</option>
              <option value="Mulch Install">{copy.quote.lawnOptions[2]}</option>
              <option value="Hedge Trimming">{copy.quote.lawnOptions[3]}</option>
              <option value="Gutter Cleaning">{copy.quote.lawnOptions[4]}</option>
              <option value="Aeration & Overseeding">
                {copy.quote.lawnOptions[5]}
              </option>
              <option value="Storm Cleanup">{copy.quote.lawnOptions[6]}</option>
            </select>
          </label>
        ) : null}
        {service === "Property Maintenance" ? (
          <label>
            {copy.quote.serviceDetail}
            <select
              value={serviceDetail}
              onChange={(event) => {
                const next = event.target.value as PropertyMaintenanceDetail;
                setServiceDetail(next);
                setValue("serviceDetail", next, { shouldValidate: true });
              }}
            >
              <option value="">{copy.quote.selectService}</option>
              <option value="Gutter Cleaning">{copy.quote.maintenanceOptions[0]}</option>
              <option value="Storm Cleanup">{copy.quote.maintenanceOptions[1]}</option>
              <option value="Branch & Debris Removal">
                {copy.quote.maintenanceOptions[2]}
              </option>
              <option value="Lot Sweeping">{copy.quote.maintenanceOptions[3]}</option>
            </select>
          </label>
        ) : null}
        {service === "Commercial Services" ? (
          <label>
            {copy.quote.serviceDetail}
            <select
              value={serviceDetail}
              onChange={(event) => {
                const next = event.target.value as CommercialServiceDetail;
                setServiceDetail(next);
                setValue("serviceDetail", next, { shouldValidate: true });
              }}
            >
              <option value="">{copy.quote.selectService}</option>
              <option value="Monthly Lawn Maintenance">
                {copy.quote.commercialOptions[0]}
              </option>
              <option value="Lot Sweeping">{copy.quote.commercialOptions[1]}</option>
              <option value="Fall Leaf Cleanup">
                {copy.quote.commercialOptions[2]}
              </option>
              <option value="Commercial Mulching">
                {copy.quote.commercialOptions[3]}
              </option>
              <option value="Debris / Storm Removal">
                {copy.quote.commercialOptions[4]}
              </option>
            </select>
          </label>
        ) : null}
        <label>
          {copy.quote.address}
          <input
            {...register("address", {
              onChange: (event) => {
                const value = event.target.value as string;
                const match = value.match(/\b\d{5}(?:-\d{4})?\b/);
                if (match) {
                  setValue("zip", match[0], { shouldDirty: true });
                }
              },
              onBlur: (event) => {
                const value = (event.target.value as string).trim();
                if (!value) return;
                const hasZip = /\b\d{5}(?:-\d{4})?\b/.test(value);
                if (hasZip) return;
                const hint = ZIP_HINTS.find((entry) => entry.pattern.test(value));
                if (hint) {
                  setValue("zip", hint.zip, { shouldDirty: true });
                }
              }
            })}
            placeholder={copy.quote.addressPlaceholder}
          />
        </label>
        <label>
          {copy.quote.zip}
          <input {...register("zip")} placeholder={copy.quote.zipPlaceholder} />
        </label>
        <label className="full">
          {copy.quote.message}
          <textarea rows={4} {...register("message")} />
        </label>
        <button className="btn-primary" type="submit" disabled={status === "sending"}>
          {status === "sending" ? copy.quote.sending : copy.quote.submit}
        </button>
        {status === "success" ? (
          <p className="form-success">{copy.quote.success}</p>
        ) : null}
        {status === "error" ? (
          <p className="form-error">{copy.quote.error}</p>
        ) : null}
      </form>
    </section>
  );
}
