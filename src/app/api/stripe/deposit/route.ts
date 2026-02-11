import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { fail, ok, safeRequestId } from "@/lib/api";
import { stripeDepositSchema } from "@/lib/validators";

export const runtime = "nodejs";

const stripeSecret = process.env.STRIPE_SECRET_KEY || "";
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://neatcurbllc.com";

const stripe = stripeSecret
  ? new Stripe(stripeSecret, { apiVersion: "2024-06-20" })
  : null;

export async function POST(request: Request) {
  const requestId = safeRequestId();
  if (!stripe) {
    return NextResponse.json(
      fail("STRIPE_NOT_CONFIGURED", "Stripe is not configured.", { requestId }),
      { status: 500 }
    );
  }

  const payload = await request.json().catch(() => null);
  const parsed = stripeDepositSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      fail("VALIDATION_FAILED", "lead_id is required.", {
        requestId,
        issues: parsed.error.issues
      }),
      { status: 400 }
    );
  }

  const supabaseAdmin = getSupabaseAdmin();
  const { data: lead, error } = await supabaseAdmin
    .from("leads")
    .select("id,name,email,service")
    .eq("id", parsed.data.lead_id)
    .maybeSingle();

  if (error || !lead) {
    return NextResponse.json(fail("LEAD_NOT_FOUND", "Lead not found.", { requestId }), {
      status: 404
    });
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

  return NextResponse.json(ok({ url: session.url, requestId }, "Checkout session created."));
}
