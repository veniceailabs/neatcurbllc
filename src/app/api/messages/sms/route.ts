import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { fail, ok, safeRequestId } from "@/lib/api";
import { sendSmsSchema } from "@/lib/validators";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const twilioSid = process.env.TWILIO_ACCOUNT_SID || "";
const twilioToken = process.env.TWILIO_AUTH_TOKEN || "";
const twilioFrom = process.env.TWILIO_FROM_NUMBER || "";

const getBearer = (request: Request) => {
  const auth = request.headers.get("authorization");
  if (!auth) return null;
  const [type, token] = auth.split(" ");
  if (type?.toLowerCase() !== "bearer") return null;
  return token || null;
};

export async function POST(request: Request) {
  const requestId = safeRequestId();

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      fail("ENV_MISSING", "Supabase env missing.", { requestId }),
      { status: 500 }
    );
  }
  if (!twilioSid || !twilioToken || !twilioFrom) {
    return NextResponse.json(
      fail("SMS_NOT_CONFIGURED", "Twilio is not configured.", { requestId }),
      { status: 500 }
    );
  }

  const token = getBearer(request);
  if (!token) {
    return NextResponse.json(fail("UNAUTHORIZED", "Unauthorized.", { requestId }), {
      status: 401
    });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData?.user) {
    return NextResponse.json(fail("INVALID_SESSION", "Invalid session.", { requestId }), {
      status: 401
    });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    return NextResponse.json(fail("FORBIDDEN", "Forbidden.", { requestId }), {
      status: 403
    });
  }

  const payload = await request.json().catch(() => null);
  const parsed = sendSmsSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      fail("VALIDATION_FAILED", "Invalid SMS payload.", {
        requestId,
        issues: parsed.error.issues
      }),
      { status: 400 }
    );
  }

  const twilioAuth = Buffer.from(`${twilioSid}:${twilioToken}`).toString("base64");
  const body = new URLSearchParams({
    To: parsed.data.to,
    From: twilioFrom,
    Body: parsed.data.body
  });

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${twilioAuth}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: body.toString()
    }
  );

  const responseBody = await response.json().catch(() => ({}));
  if (!response.ok) {
    return NextResponse.json(
      fail("SEND_FAILED", responseBody?.message || "SMS send failed.", { requestId }),
      { status: 400 }
    );
  }

  await supabase.from("messages").insert({
    client_id: parsed.data.client_id,
    channel: "sms",
    to_address: parsed.data.to,
    from_address: twilioFrom,
    body: parsed.data.body,
    status: "sent",
    provider_id: responseBody?.sid || null,
    sent_by: userData.user.id
  });

  await supabase.from("audit_logs").insert({
    action: "message_sent",
    entity: "message",
    metadata: { channel: "sms", to: parsed.data.to, request_id: requestId }
  });

  return NextResponse.json(ok({ requestId }, "Message sent."));
}
