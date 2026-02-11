import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { fail, ok, safeRequestId } from "@/lib/api";
import { sendEmailSchema } from "@/lib/validators";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const resendKey = process.env.RESEND_API_KEY || "";
const fromEmail = process.env.RESEND_FROM_EMAIL || "";

const getBearer = (request: Request) => {
  const auth = request.headers.get("authorization");
  if (!auth) return null;
  const [type, token] = auth.split(" ");
  if (type?.toLowerCase() !== "bearer") return null;
  return token || null;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export async function POST(request: Request) {
  const requestId = safeRequestId();

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      fail("ENV_MISSING", "Supabase env missing.", { requestId }),
      { status: 500 }
    );
  }
  if (!resendKey || !fromEmail) {
    return NextResponse.json(
      fail("EMAIL_NOT_CONFIGURED", "Email provider is not configured.", { requestId }),
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
    .select("role,email")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    return NextResponse.json(fail("FORBIDDEN", "Forbidden.", { requestId }), {
      status: 403
    });
  }

  const payload = await request.json().catch(() => null);
  const parsed = sendEmailSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      fail("VALIDATION_FAILED", "Invalid email payload.", {
        requestId,
        issues: parsed.error.issues
      }),
      { status: 400 }
    );
  }

  const safeBody = escapeHtml(parsed.data.body).replace(/\n/g, "<br />");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: fromEmail,
      to: parsed.data.to,
      subject: parsed.data.subject || "Neat Curb Update",
      html: `<p>${safeBody}</p>`
    })
  });

  const responseBody = await response.json().catch(() => ({}));
  if (!response.ok) {
    return NextResponse.json(
      fail("SEND_FAILED", responseBody?.message || "Email send failed.", {
        requestId
      }),
      { status: 400 }
    );
  }

  await supabase.from("messages").insert({
    client_id: parsed.data.client_id,
    channel: "email",
    to_address: parsed.data.to,
    from_address: fromEmail,
    subject: parsed.data.subject || "Neat Curb Update",
    body: parsed.data.body,
    status: "sent",
    provider_id: responseBody?.id || null,
    sent_by: userData.user.id
  });

  await supabase.from("audit_logs").insert({
    action: "message_sent",
    entity: "message",
    metadata: { channel: "email", to: parsed.data.to, request_id: requestId }
  });

  return NextResponse.json(ok({ requestId }, "Message sent."));
}
