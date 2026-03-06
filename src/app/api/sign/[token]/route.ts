import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { fail, ok } from "@/lib/api";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL    || "";
const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY   || "";

function admin() {
  return createClient(supabaseUrl, serviceKey);
}

// GET /api/sign/[token] — public: fetch document for signing
export async function GET(_req: Request, { params }: { params: { token: string } }) {
  const db = admin();
  const { data: sig, error } = await db
    .from("nc_document_signatures")
    .select(`
      id, signer_name, signer_email, status, signing_token,
      nc_documents ( id, title, body_html, status )
    `)
    .eq("signing_token", params.token)
    .maybeSingle();

  if (error || !sig) return NextResponse.json(fail("NOT_FOUND", "Invalid or expired signing link.", {}), { status: 404 });
  if (sig.status === "signed") return NextResponse.json(ok({ already_signed: true, signer_name: sig.signer_name }));

  return NextResponse.json(ok({
    signature_id:  sig.id,
    signer_name:   sig.signer_name,
    signer_email:  sig.signer_email,
    document:      sig.nc_documents,
  }));
}

// POST /api/sign/[token] — public: submit signature
export async function POST(req: Request, { params }: { params: { token: string } }) {
  const db = admin();

  const { data: sig, error } = await db
    .from("nc_document_signatures")
    .select("id, status, document_id, signer_name, signer_email")
    .eq("signing_token", params.token)
    .maybeSingle();

  if (error || !sig) return NextResponse.json(fail("NOT_FOUND", "Invalid signing link.", {}), { status: 404 });
  if (sig.status === "signed") return NextResponse.json(fail("ALREADY_SIGNED", "Already signed.", {}), { status: 409 });

  const body = await req.json().catch(() => null);
  const { signature_data, typed_name } = body ?? {};

  if (!signature_data && !typed_name) {
    return NextResponse.json(fail("VALIDATION_FAILED", "signature_data or typed_name required.", {}), { status: 400 });
  }

  // Update signature record
  await db.from("nc_document_signatures").update({
    status:         "signed",
    signature_data: signature_data || null,
    typed_name:     typed_name || null,
    signed_at:      new Date().toISOString(),
  }).eq("id", sig.id);

  // Check if all signers have signed → update document status
  const { data: allSigs } = await db
    .from("nc_document_signatures")
    .select("status")
    .eq("document_id", sig.document_id);

  const allSigned = allSigs?.every((s) => s.status === "signed");
  const newDocStatus = allSigned ? "signed" : "partially_signed";
  await db.from("nc_documents").update({ status: newDocStatus }).eq("id", sig.document_id);

  await db.from("audit_logs").insert({
    action: "document_signed",
    entity: "nc_document_signatures",
    entity_id: sig.id,
    actor: sig.signer_email,
    metadata: { document_id: sig.document_id, all_signed: allSigned },
  });

  return NextResponse.json(ok({ all_signed: allSigned }, "Document signed successfully."));
}
