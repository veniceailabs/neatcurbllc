import { NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

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
        <p>Your $100 deposit is confirmed. You’re officially secured on the Neat Curb route.</p>
        <p>We’ll follow up with scheduling details shortly.</p>
        <p>— Neat Curb LLC</p>`
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { ok: false, error: data?.message || "Resend error" };
  }
  return { ok: true, id: data?.id || null };
}

export async function POST(request: Request) {
  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { ok: false, error: "Webhook not configured." },
      { status: 500 }
    );
  }

  const body = await request.text();
  const signature = headers().get("stripe-signature") || "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "Invalid signature." },
      { status: 400 }
    );
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ ok: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const leadId = session.metadata?.lead_id;
  if (!leadId) {
    return NextResponse.json({ ok: true });
  }

  const supabaseAdmin = getSupabaseAdmin();
  const { data: lead } = await supabaseAdmin
    .from("leads")
    .select("id,name,email,phone,address,service,pricing_meta")
    .eq("id", leadId)
    .maybeSingle<LeadRecord>();

  if (!lead) {
    return NextResponse.json({ ok: true });
  }

  const propertyClass =
    (lead.pricing_meta?.["propertyClass"] as string | undefined) || null;

  const { data: client } = await supabaseAdmin
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

  const clientId = client?.id || null;

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

  await supabaseAdmin.from("audit_logs").insert({
    action: "deposit_received",
    entity: "lead",
    entity_id: lead.id,
    metadata: {
      amount: 100,
      currency: "usd",
      client_id: clientId
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
      body: "Your $100 deposit is confirmed. You’re secured on the route.",
      status: emailResult?.ok ? "sent" : "failed",
      provider_id: emailResult?.ok ? emailResult.id : null
    });
  }

  return NextResponse.json({ ok: true });
}
