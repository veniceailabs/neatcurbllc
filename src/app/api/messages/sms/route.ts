import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const twilioSid = process.env.TWILIO_ACCOUNT_SID || "";
const twilioToken = process.env.TWILIO_AUTH_TOKEN || "";
const twilioFrom = process.env.TWILIO_FROM_NUMBER || "";

type SmsPayload = {
  client_id: string;
  to: string;
  body: string;
};

const getBearer = (request: Request) => {
  const auth = request.headers.get("authorization");
  if (!auth) return null;
  const [type, token] = auth.split(" ");
  if (type?.toLowerCase() !== "bearer") return null;
  return token || null;
};

export async function POST(request: Request) {
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { ok: false, error: "Supabase env missing." },
      { status: 500 }
    );
  }
  if (!twilioSid || !twilioToken || !twilioFrom) {
    return NextResponse.json(
      { ok: false, error: "Twilio is not configured." },
      { status: 500 }
    );
  }

  const token = getBearer(request);
  if (!token) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData?.user) {
    return NextResponse.json({ ok: false, error: "Invalid session." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role,email")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Forbidden." }, { status: 403 });
  }

  const payload = (await request.json()) as SmsPayload;
  if (!payload?.to || !payload?.body) {
    return NextResponse.json(
      { ok: false, error: "Recipient and body are required." },
      { status: 400 }
    );
  }

  const twilioAuth = Buffer.from(`${twilioSid}:${twilioToken}`).toString("base64");
  const body = new URLSearchParams({
    To: payload.to,
    From: twilioFrom,
    Body: payload.body
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
      { ok: false, error: responseBody?.message || "SMS send failed." },
      { status: 400 }
    );
  }

  await supabase.from("messages").insert({
    client_id: payload.client_id,
    channel: "sms",
    to_address: payload.to,
    from_address: twilioFrom,
    body: payload.body,
    status: "sent",
    provider_id: responseBody?.sid || null,
    sent_by: userData.user.id
  });

  await supabase.from("audit_logs").insert({
    action: "message_sent",
    entity: "message",
    metadata: { channel: "sms", to: payload.to }
  });

  return NextResponse.json({ ok: true });
}
