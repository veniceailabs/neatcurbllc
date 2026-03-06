import { NextResponse } from "next/server";
import { fail, ok, safeRequestId } from "@/lib/api";
import { simpleRateLimit } from "@/lib/rateLimit";
import { publicChatSchema } from "@/lib/validators";

type ChatReply = {
  reply: string;
  suggestions: string[];
};

const BASE_SUGGESTIONS = [
  "What services do you offer?",
  "What areas do you service?",
  "How fast can I get a quote?",
  "How do I contact Corey?"
];

const getClientIp = (request: Request) => {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
};

const withDefaults = (reply: string, suggestions?: string[]): ChatReply => ({
  reply,
  suggestions: suggestions && suggestions.length > 0 ? suggestions : BASE_SUGGESTIONS
});

const pickReply = (rawMessage: string): ChatReply => {
  const message = rawMessage.trim().toLowerCase();

  if (/(quote|estimate|pricing|price|cost|proposal)/.test(message)) {
    return withDefaults(
      "You can get a fast estimate through our Request Quote form. We handle snow, lawn, and full property maintenance for residential and commercial properties. Use /request-quote and we will follow up quickly.",
      ["Open request quote", "Snow removal pricing", "Commercial service questions"]
    );
  }

  if (/(service|offer|do you do|landscape|lawn|snow|ice|cleanup|maintenance)/.test(message)) {
    return withDefaults(
      "Neat Curb LLC provides year-round exterior maintenance: lawn maintenance, landscape design/install, seasonal leaf and debris cleanup, and winter snow plow + ice management. We manage work in-house for consistency.",
      ["Residential services", "Commercial services", "Seasonal cleanup details"]
    );
  }

  if (/(where|area|location|service area|zip|buffalo|amherst|cheektowaga|niagara|tonawanda|west seneca)/.test(message)) {
    return withDefaults(
      "We serve Western New York, including Buffalo, Amherst, Cheektowaga, Tonawanda, West Seneca, and Niagara Falls.",
      ["Do you service my ZIP?", "Request quote in my area", "Commercial coverage"]
    );
  }

  if (/(mbe|certified|nys|minority|bbb|accredited)/.test(message)) {
    return withDefaults(
      "Yes. Neat Curb LLC highlights NYS MBE certification (Minority Business Enterprise) and BBB accreditation on-site.",
      ["Show certifications", "Commercial credentials", "Request business profile"]
    );
  }

  if (/(naics|561730|code)/.test(message)) {
    return withDefaults(
      "Our core classification is NAICS 561730 (Landscaping Services), supporting residential and commercial groundskeeping and exterior maintenance.",
      ["What work is included?", "Commercial services", "Request quote"]
    );
  }

  if (/(phone|call|email|contact|corey|dot|card)/.test(message)) {
    return withDefaults(
      "You can reach us at (716) 241-1499, email neatcurb@gmail.com, or use the DOT card at dot.cards/neatcurb.",
      ["Call now", "Request quote", "Open DOT card"]
    );
  }

  if (/(power wash|pressure wash|gutter)/.test(message)) {
    return withDefaults(
      "We are currently focused on landscaping, snow removal, and property maintenance services. If you need related exterior work, submit a quote request and we can confirm fit.",
      ["Primary services", "Request quote", "Commercial support"]
    );
  }

  if (/(hour|open|availability|emergency|storm|24\/7)/.test(message)) {
    return withDefaults(
      "We operate with proactive storm monitoring and dispatch readiness. For urgent weather response, call (716) 241-1499 for the fastest response.",
      ["Call now", "Snow response details", "Request quote"]
    );
  }

  return withDefaults(
    "I can help with services, service areas, certifications, and quote requests. If you prefer, call (716) 241-1499 and we can assist directly."
  );
};

export async function POST(request: Request) {
  const requestId = safeRequestId();

  const ip = getClientIp(request);
  const limited = simpleRateLimit(`chat:${ip}`, 30, 60_000);
  if (!limited.allowed) {
    return NextResponse.json(
      fail("RATE_LIMITED", "Too many chat requests. Please retry shortly.", {
        requestId,
        retryAfterSec: limited.retryAfterSec
      }),
      { status: 429 }
    );
  }

  const json = await request.json().catch(() => null);
  const parsed = publicChatSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      fail("VALIDATION_FAILED", "Invalid chat payload.", {
        requestId,
        issues: parsed.error.issues
      }),
      { status: 400 }
    );
  }

  const data = pickReply(parsed.data.message);
  return NextResponse.json(ok({ requestId, ...data }));
}
