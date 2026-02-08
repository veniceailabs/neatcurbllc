"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const services = [
  "Snow Removal",
  "Lawn Care",
  "Property Maintenance",
  "Commercial Services"
];

type QuoteFormData = {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
};

export default function QuoteForm() {
  const { register, handleSubmit, reset } = useForm<QuoteFormData>();
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">(
    "idle"
  );

  const onSubmit = async (data: QuoteFormData) => {
    setStatus("sending");
    const { error } = await supabase.from("leads").insert({
      name: data.name,
      email: data.email,
      phone: data.phone,
      service: data.service,
      message: data.message
    });

    if (error) {
      setStatus("error");
      return;
    }

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
          <select {...register("service", { required: true })}>
            {services.map((service) => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
          </select>
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
