"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  getPublicEstimate,
  type Accumulation,
  type CommercialSize,
  type PublicService,
  type ResidentialSize
} from "@/lib/pricing";

const services: PublicService[] = [
  "Snow Removal",
  "Lawn Care",
  "Property Maintenance",
  "Commercial Services"
];

const accumulationOptions: { value: Accumulation; label: string }[] = [
  { value: "2-3", label: "2-3 inches (Standard)" },
  { value: "3-6", label: "3-6 inches (+50%)" },
  { value: "6-12", label: "6-12 inches (+75%)" },
  { value: "12+", label: "12+ inches (+100%)" }
];

type QuoteFormData = {
  name: string;
  email: string;
  phone: string;
  address?: string;
  service: PublicService;
  message: string;
  propertyClass?: "residential" | "commercial";
  size?: ResidentialSize | CommercialSize;
  accumulation?: Accumulation;
};

export default function QuoteForm() {
  const { register, handleSubmit, reset, setValue } = useForm<QuoteFormData>({
    defaultValues: { service: "Snow Removal" }
  });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">(
    "idle"
  );
  const [service, setService] = useState<PublicService>("Snow Removal");
  const [propertyClass, setPropertyClass] = useState<
    "residential" | "commercial"
  >("residential");
  const [size, setSize] = useState<ResidentialSize | CommercialSize>("medium");
  const [accumulation, setAccumulation] = useState<Accumulation>("2-3");

  const onSubmit = async (data: QuoteFormData) => {
    setStatus("sending");
    const estimate = getPublicEstimate({
      service,
      propertyClass,
      size,
      accumulation
    });
    const { error } = await supabase.from("leads").insert({
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address || null,
      service: data.service,
      message: data.message,
      estimated_low: estimate.low,
      estimated_high: estimate.high,
      pricing_meta: {
        propertyClass,
        size,
        accumulation
      }
    });

    if (error) {
      setStatus("error");
      return;
    }

    await supabase.from("audit_logs").insert({
      actor: "public",
      action: "lead_created",
      entity: "lead",
      metadata: {
        name: data.name,
        service: data.service,
        estimated_low: estimate.low,
        estimated_high: estimate.high
      }
    });

    setStatus("success");
    reset();
  };

  return (
    <section className="section" id="quote">
      <div className="section-header">
        <h2>Request a Quote</h2>
      </div>
      <form className="quote-form" onSubmit={handleSubmit(onSubmit)}>
        <label>
          Full Name
          <input {...register("name", { required: true })} />
        </label>
        <label>
          Email
          <input type="email" {...register("email", { required: true })} />
        </label>
        <label>
          Phone
          <input type="tel" {...register("phone", { required: true })} />
        </label>
        <label>
          Service Needed
          <select
            {...register("service", { required: true })}
            value={service}
            onChange={(event) => {
              const next = event.target.value as PublicService;
              setService(next);
              setValue("service", next, { shouldValidate: true });
              if (next === "Commercial Services") {
                setPropertyClass("commercial");
                setSize("small");
              }
            }}
          >
            {services.map((serviceOption) => (
              <option key={serviceOption} value={serviceOption}>
                {serviceOption}
              </option>
            ))}
          </select>
        </label>
        {service === "Snow Removal" ? (
          <>
            <label>
              Property Class
              <select
                value={propertyClass}
                onChange={(event) =>
                  setPropertyClass(event.target.value as "residential" | "commercial")
                }
              >
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
              </select>
            </label>
            <label>
              Property Size
              <select
                value={size}
                onChange={(event) =>
                  setSize(event.target.value as ResidentialSize | CommercialSize)
                }
              >
                {propertyClass === "residential" ? (
                  <>
                    <option value="small">Small driveway</option>
                    <option value="medium">Medium driveway</option>
                    <option value="large">Large driveway</option>
                  </>
                ) : (
                  <>
                    <option value="small">Small commercial</option>
                    <option value="plaza">Plaza / multi-suite</option>
                  </>
                )}
              </select>
            </label>
            <label>
              Snowfall Forecast
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
        <label>
          Address
          <input {...register("address")} placeholder="Service address" />
        </label>
        <label className="full">
          Message
          <textarea rows={4} {...register("message")} />
        </label>
        <button className="btn-primary" type="submit" disabled={status === "sending"}>
          {status === "sending" ? "Sending..." : "Submit"}
        </button>
        {status === "success" ? (
          <p className="form-success">Thank you! We’ll contact you shortly.</p>
        ) : null}
        {status === "error" ? (
          <p className="form-error">Something went wrong. Please try again.</p>
        ) : null}
      </form>
    </section>
  );
}
