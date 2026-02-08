import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const resendKey = process.env.RESEND_API_KEY || "";
const fromEmail = process.env.RESEND_FROM_EMAIL || "";

type EmailPayload = {
  client_id: string;
  to: string;
  subject?: string;
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
  if (!resendKey || !fromEmail) {
    return NextResponse.json(
      { ok: false, error: "Email provider is not configured." },
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

  const payload = (await request.json()) as EmailPayload;
  if (!payload?.to || !payload?.body) {
    return NextResponse.json(
      { ok: false, error: "Recipient and body are required." },
      { status: 400 }
    );
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: fromEmail,
      to: payload.to,
      subject: payload.subject || "Neat Curb Update",
      html: `<p>${payload.body.replace(/\n/g, "<br />")}</p>`
    })
  });

  const responseBody = await response.json().catch(() => ({}));
  if (!response.ok) {
    return NextResponse.json(
      { ok: false, error: responseBody?.message || "Email send failed." },
      { status: 400 }
    );
  }

  await supabase.from("messages").insert({
    client_id: payload.client_id,
    channel: "email",
    to_address: payload.to,
    from_address: fromEmail,
    subject: payload.subject || "Neat Curb Update",
    body: payload.body,
    status: "sent",
    provider_id: responseBody?.id || null,
    sent_by: userData.user.id
  });

  await supabase.from("audit_logs").insert({
    action: "message_sent",
    entity: "message",
    metadata: { channel: "email", to: payload.to }
  });

  return NextResponse.json({ ok: true });
}
