import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

const stripeSecret = process.env.STRIPE_SECRET_KEY || "";
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://neatcurbllc.com";

const stripe = stripeSecret
  ? new Stripe(stripeSecret, { apiVersion: "2024-06-20" })
  : null;

export async function POST(request: Request) {
  if (!stripe) {
    return NextResponse.json(
      { ok: false, error: "Stripe or Supabase admin key missing." },
      { status: 500 }
    );
  }

  const payload = await request.json();
  const leadId = payload?.lead_id;

  if (!leadId) {
    return NextResponse.json(
      { ok: false, error: "lead_id is required." },
      { status: 400 }
    );
  }

  const supabaseAdmin = getSupabaseAdmin();
  const { data: lead, error } = await supabaseAdmin
    .from("leads")
    .select("id,name,email,service")
    .eq("id", leadId)
    .maybeSingle();

  if (error || !lead) {
    return NextResponse.json(
      { ok: false, error: "Lead not found." },
      { status: 404 }
    );
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Neat Curb Route Deposit",
            description: "Secures your spot on the route."
          },
          unit_amount: 10000
        },
        quantity: 1
      }
    ],
    customer_email: lead.email || undefined,
    metadata: {
      lead_id: lead.id
    },
    success_url: `${baseUrl}/request-quote?deposit=success`,
    cancel_url: `${baseUrl}/request-quote?deposit=cancel`
  });

  return NextResponse.json({ ok: true, url: session.url });
}
