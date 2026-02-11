import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { fail, ok, safeRequestId } from "@/lib/api";
import { publicLeadSchema } from "@/lib/validators";
import { simpleRateLimit } from "@/lib/rateLimit";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const getClientIp = (request: Request) => {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
};

export async function POST(request: Request) {
  const requestId = safeRequestId();

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      fail("ENV_MISSING", "Supabase is not configured.", { requestId }),
      { status: 500 }
    );
  }

  const ip = getClientIp(request);
  const limited = simpleRateLimit(`lead:${ip}`, 8, 60_000);
  if (!limited.allowed) {
    return NextResponse.json(
      fail("RATE_LIMITED", "Too many requests. Please retry shortly.", {
        requestId,
        retryAfterSec: limited.retryAfterSec
      }),
      { status: 429 }
    );
  }

  const json = await request.json().catch(() => null);
  const parsed = publicLeadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      fail("VALIDATION_FAILED", "Invalid quote request payload.", {
        requestId,
        issues: parsed.error.issues
      }),
      { status: 400 }
    );
  }

  // Honeypot: bots typically fill hidden inputs humans never touch.
  if (parsed.data.honeypot && parsed.data.honeypot.trim().length > 0) {
    return NextResponse.json(ok({ requestId }, "Request received."));
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { honeypot, zip, ...lead } = parsed.data;
  const pricingMeta = {
    ...(lead.pricing_meta || {}),
    zip: zip || null
  };

  const { error } = await supabase.from("leads").insert({
    ...lead,
    pricing_meta: pricingMeta
  });

  if (error) {
    return NextResponse.json(
      fail("INSERT_FAILED", error.message, { requestId }),
      { status: 400 }
    );
  }

  return NextResponse.json(ok({ requestId }, "Quote request submitted."));
}
