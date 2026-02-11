import { NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { fail, ok, safeRequestId } from "@/lib/api";

export const runtime = "nodejs";

const stripeSecret = process.env.STRIPE_SECRET_KEY || "";
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
const resendKey = process.env.RESEND_API_KEY || "";
const resendFrom = process.env.RESEND_FROM_EMAIL || "";

const stripe = stripeSecret
  ? new Stripe(stripeSecret, { apiVersion: "2024-06-20" })
  : null;

type LeadRecord = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  service: string | null;
  pricing_meta: Record<string, unknown> | null;
  lead_status: string | null;
};

async function sendWelcomeEmail(lead: LeadRecord) {
  if (!resendKey || !resendFrom || !lead.email) return null;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: resendFrom,
      to: lead.email,
      subject: "Welcome to the Neat Curb Route",
      html: `<p>Hi ${lead.name || "there"},</p>
        <p>Your $100 deposit is confirmed. You are officially secured on the Neat Curb route.</p>
        <p>We will follow up with scheduling details shortly.</p>
        <p>- Neat Curb LLC</p>`
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { ok: false, error: data?.message || "Resend error" };
  }
  return { ok: true, id: data?.id || null };
}

export async function POST(request: Request) {
  const requestId = safeRequestId();
  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      fail("WEBHOOK_NOT_CONFIGURED", "Webhook not configured.", { requestId }),
      { status: 500 }
    );
  }

  const body = await request.text();
  const signature = headers().get("stripe-signature") || "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json(fail("INVALID_SIGNATURE", "Invalid signature.", { requestId }), {
      status: 400
    });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json(ok({ requestId }, "Ignored event type."));
  }

  const supabaseAdmin = getSupabaseAdmin();
  const { data: existingEvent } = await supabaseAdmin
    .from("stripe_events")
    .select("event_id")
    .eq("event_id", event.id)
    .maybeSingle();

  if (existingEvent) {
    return NextResponse.json(ok({ requestId }, "Event already processed."));
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const leadId = session.metadata?.lead_id;
  if (!leadId) {
    await supabaseAdmin.from("stripe_events").insert({
      event_id: event.id,
      type: event.type,
      payload: event as unknown as Record<string, unknown>
    });
    return NextResponse.json(ok({ requestId }, "Missing lead id; stored event."));
  }

  const { data: lead } = await supabaseAdmin
    .from("leads")
    .select("id,name,email,phone,address,service,pricing_meta,lead_status")
    .eq("id", leadId)
    .maybeSingle<LeadRecord>();

  if (!lead) {
    await supabaseAdmin.from("stripe_events").insert({
      event_id: event.id,
      type: event.type,
      payload: event as unknown as Record<string, unknown>
    });
    return NextResponse.json(ok({ requestId }, "Lead missing; stored event."));
  }

  if (lead.lead_status === "converted") {
    await supabaseAdmin.from("stripe_events").insert({
      event_id: event.id,
      type: event.type,
      payload: event as unknown as Record<string, unknown>
    });
    return NextResponse.json(ok({ requestId }, "Lead already converted."));
  }

  const propertyClass = (lead.pricing_meta?.propertyClass as string | undefined) || null;

  const { data: existingClient } = await supabaseAdmin
    .from("clients")
    .select("id")
    .eq("email", lead.email)
    .eq("phone", lead.phone)
    .maybeSingle();

  let clientId = existingClient?.id || null;
  if (!clientId) {
    const { data: insertedClient } = await supabaseAdmin
      .from("clients")
      .insert({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        address: lead.address,
        type: propertyClass
      })
      .select("id")
      .maybeSingle();
    clientId = insertedClient?.id || null;
  }

  await supabaseAdmin
    .from("leads")
    .update({
      lead_status: "converted",
      converted_at: new Date().toISOString(),
      client_id: clientId
    })
    .eq("id", lead.id);

  if (clientId) {
    await supabaseAdmin.from("jobs").insert({
      client_id: clientId,
      service: "Onboarding/Property Setup",
      status: "queued",
      scheduled_date: new Date().toISOString().slice(0, 10)
    });
  }

  await supabaseAdmin.from("payments").insert({
    invoice_id: null,
    amount: 100,
    method: "card",
    status: "succeeded",
    provider: "stripe",
    provider_id: session.payment_intent?.toString() || session.id
  });

  await supabaseAdmin.from("audit_logs").insert({
    action: "deposit_received",
    entity: "lead",
    entity_id: lead.id,
    metadata: {
      amount: 100,
      currency: session.currency || "usd",
      client_id: clientId,
      request_id: requestId
    }
  });

  const emailResult = await sendWelcomeEmail(lead);

  if (lead.email) {
    await supabaseAdmin.from("messages").insert({
      client_id: clientId,
      lead_id: lead.id,
      channel: "email",
      to_address: lead.email,
      from_address: resendFrom || null,
      subject: "Welcome to the Neat Curb Route",
      body: "Your $100 deposit is confirmed. You are secured on the route.",
      status: emailResult?.ok ? "sent" : "failed",
      provider_id: emailResult?.ok ? emailResult.id : null
    });
  }

  await supabaseAdmin.from("stripe_events").insert({
    event_id: event.id,
    type: event.type,
    payload: event as unknown as Record<string, unknown>
  });

  return NextResponse.json(ok({ requestId }, "Webhook processed."));
}
