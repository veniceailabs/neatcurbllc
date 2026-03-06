"use client";

import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
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

type AddressSuggestion = {
  label: string;
  zip?: string;
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
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<QuoteFormData>({
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
  const [addressQuery, setAddressQuery] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);

  useEffect(() => {
    const query = addressQuery.trim();
    if (query.length < 3) {
      setAddressSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/public/address-autocomplete?q=${encodeURIComponent(query)}`,
          { signal: controller.signal }
        );
        const payload = await response.json().catch(() => null);
        if (!response.ok || !payload?.ok) {
          setAddressSuggestions([]);
          return;
        }
        const suggestions = Array.isArray(payload?.data?.suggestions)
          ? payload.data.suggestions
          : [];
        setAddressSuggestions(
          suggestions
            .map((entry: { label?: string; zip?: string | null }) => ({
              label: String(entry?.label || "").trim(),
              zip: typeof entry?.zip === "string" ? entry.zip : undefined
            }))
            .filter((entry: AddressSuggestion) => entry.label.length > 0)
            .slice(0, 6)
        );
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setAddressSuggestions([]);
        }
      }
    }, 250);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [addressQuery]);

  const applyZipFromSuggestion = (value: string) => {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return;
    const matched = addressSuggestions.find(
      (entry) => entry.label.toLowerCase() === normalized
    );
    if (matched?.zip) {
      setValue("zip", matched.zip, { shouldDirty: true });
    }
  };

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
          <input
            autoComplete="name"
            {...register("name", { required: "Please enter your name." })}
          />
          {errors.name ? <span className="field-error">{errors.name.message}</span> : null}
        </label>
        <label>
          {copy.quote.email}
          <input
            type="email"
            autoComplete="email"
            {...register("email", { required: "Please enter a valid email." })}
          />
          {errors.email ? <span className="field-error">{errors.email.message}</span> : null}
        </label>
        <label>
          {copy.quote.phone}
          <input
            type="tel"
            autoComplete="tel"
            {...register("phone", {
              required: "Please enter a callback number.",
              pattern: {
                value: /^[0-9()+\-\s.]{7,22}$/,
                message: "Please enter a valid phone number."
              }
            })}
          />
          {errors.phone ? <span className="field-error">{errors.phone.message}</span> : null}
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
              <option value="Aeration & Overseeding">{copy.quote.lawnOptions[4]}</option>
              <option value="Storm Cleanup">{copy.quote.lawnOptions[5]}</option>
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
              <option value="Storm Cleanup">{copy.quote.maintenanceOptions[0]}</option>
              <option value="Branch & Debris Removal">
                {copy.quote.maintenanceOptions[1]}
              </option>
              <option value="Lot Sweeping">{copy.quote.maintenanceOptions[2]}</option>
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
            list="quote-address-suggestions"
            autoComplete="street-address"
            {...register("address", {
              onChange: (event) => {
                const value = event.target.value as string;
                setAddressQuery(value);
                applyZipFromSuggestion(value);
                const match = value.match(/\b\d{5}(?:-\d{4})?\b/);
                if (match) {
                  setValue("zip", match[0], { shouldDirty: true });
                }
              },
              onBlur: (event) => {
                const value = (event.target.value as string).trim();
                if (!value) return;
                applyZipFromSuggestion(value);
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
          <datalist id="quote-address-suggestions">
            {addressSuggestions.map((suggestion, suggestionIndex) => (
              <option
                key={`${suggestion.label}-${suggestionIndex}`}
                value={suggestion.label}
              />
            ))}
          </datalist>
        </label>
        <label>
          {copy.quote.zip}
          <input
            autoComplete="postal-code"
            inputMode="numeric"
            {...register("zip", {
              pattern: {
                value: /^\d{5}(?:-\d{4})?$/,
                message: "Use ZIP format 12345 or 12345-6789."
              }
            })}
            placeholder={copy.quote.zipPlaceholder}
          />
          {errors.zip ? <span className="field-error">{errors.zip.message}</span> : null}
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
