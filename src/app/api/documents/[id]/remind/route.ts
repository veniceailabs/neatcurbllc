import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { fail, ok, safeRequestId } from "@/lib/api";

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL      || "";
const serviceKey   = process.env.SUPABASE_SERVICE_ROLE_KEY      || "";
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const resendKey    = process.env.RESEND_API_KEY                 || "";
const fromEmail    = process.env.RESEND_FROM_EMAIL              || "";
const appUrl       = process.env.NEXT_PUBLIC_APP_URL            || "https://neatcurbllc.com";

const getBearer = (req: Request) => {
  const auth = req.headers.get("authorization") ?? "";
  const [type, token] = auth.split(" ");
  return type?.toLowerCase() === "bearer" ? (token ?? null) : null;
};

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const requestId = safeRequestId();

  const token = getBearer(req);
  if (!token) return NextResponse.json(fail("UNAUTHORIZED", "Unauthorized.", { requestId }), { status: 401 });

  const userClient = createClient(supabaseUrl, supabaseAnon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser(token);
  if (userErr || !userData?.user) return NextResponse.json(fail("INVALID_SESSION", "Invalid session.", { requestId }), { status: 401 });
  const { data: profile } = await userClient.from("profiles").select("role").eq("id", userData.user.id).maybeSingle();
  if (profile?.role !== "admin") return NextResponse.json(fail("FORBIDDEN", "Forbidden.", { requestId }), { status: 403 });

  const admin = createClient(supabaseUrl, serviceKey);
  const docId = params.id;

  const { data: doc } = await admin
    .from("nc_documents")
    .select("id, title, nc_document_signatures ( id, signer_name, signer_email, signing_token, status )")
    .eq("id", docId)
    .single();

  if (!doc) return NextResponse.json(fail("NOT_FOUND", "Document not found.", { requestId }), { status: 404 });

  const pending = (doc.nc_document_signatures as Array<{
    id: string; signer_name: string; signer_email: string; signing_token: string; status: string;
  }>).filter((s) => s.status === "pending");

  const sent: string[] = [];

  for (const signer of pending) {
    const signingUrl = `${appUrl}/sign/${signer.signing_token}`;
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: fromEmail,
        to: signer.signer_email,
        subject: `Reminder: Your signature is needed on "${doc.title}"`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
            <img src="${appUrl}/brand/neat-curb-logo-full.png" alt="Neat Curb LLC" style="height:80px;margin-bottom:20px;">
            <h2 style="color:#F5A31A;">Friendly Reminder — Signature Needed</h2>
            <p>Hi ${signer.signer_name},</p>
            <p>This is a reminder that your signature is still needed on: <strong>${doc.title}</strong></p>
            <div style="margin:24px 0;">
              <a href="${signingUrl}" style="background:#1C7C20;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block;">
                Sign Now
              </a>
            </div>
            <p style="color:#666;font-size:13px;">Questions? Call Neat Curb at (716) 241-1499.</p>
            <hr style="border:none;border-top:1px solid #eee;margin:20px 0;">
            <p style="color:#999;font-size:12px;">Neat Curb LLC · 229 West Genesee St · Buffalo, NY 14202</p>
          </div>
        `,
      }),
    });
    if (res.ok) {
      sent.push(signer.signer_email);
      await admin.from("nc_document_signatures").update({ last_notified_at: new Date().toISOString() }).eq("id", signer.id);
    }
  }

  return NextResponse.json(ok({ sent }, `Reminded ${sent.length} signer(s).`));
}
