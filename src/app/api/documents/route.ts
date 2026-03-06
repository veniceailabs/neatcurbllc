import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { fail, ok, safeRequestId } from "@/lib/api";
import { getTemplate } from "@/lib/document-templates";

const supabaseUrl   = process.env.NEXT_PUBLIC_SUPABASE_URL        || "";
const serviceKey    = process.env.SUPABASE_SERVICE_ROLE_KEY        || "";
const supabaseAnon  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY   || "";

const getBearer = (req: Request) => {
  const auth = req.headers.get("authorization") ?? "";
  const [type, token] = auth.split(" ");
  return type?.toLowerCase() === "bearer" ? (token ?? null) : null;
};

async function getAdminClient(req: Request) {
  const token = getBearer(req);
  if (!token) return { error: "UNAUTHORIZED", client: null, user: null };
  const userClient = createClient(supabaseUrl, supabaseAnon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: userData, error } = await userClient.auth.getUser(token);
  if (error || !userData?.user) return { error: "INVALID_SESSION", client: null, user: null };
  const { data: profile } = await userClient.from("profiles").select("role").eq("id", userData.user.id).maybeSingle();
  if (profile?.role !== "admin") return { error: "FORBIDDEN", client: null, user: null };
  return {
    error: null,
    client: createClient(supabaseUrl, serviceKey),
    user: userData.user,
  };
}

// GET /api/documents — list all documents
export async function GET(req: Request) {
  const requestId = safeRequestId();
  const { error, client } = await getAdminClient(req);
  if (error || !client) {
    return NextResponse.json(fail(error!, error!, { requestId }), { status: error === "FORBIDDEN" ? 403 : 401 });
  }

  const { data, error: dbErr } = await client
    .from("nc_documents")
    .select(`
      id, title, template_type, status, body_html, created_at, created_by,
      nc_document_signatures ( id, signer_name, signer_email, signing_token, status, signed_at )
    `)
    .order("created_at", { ascending: false });

  if (dbErr) {
    return NextResponse.json(fail("DB_ERROR", dbErr.message, { requestId }), { status: 500 });
  }

  return NextResponse.json(ok(data, "Documents loaded."));
}

// POST /api/documents — create a new document
export async function POST(req: Request) {
  const requestId = safeRequestId();
  const { error, client, user } = await getAdminClient(req);
  if (error || !client || !user) {
    return NextResponse.json(fail(error!, error!, { requestId }), { status: error === "FORBIDDEN" ? 403 : 401 });
  }

  const body = await req.json().catch(() => null);
  const { template_id, title, fields, signers } = body ?? {};

  if (!template_id || !title || !fields) {
    return NextResponse.json(fail("VALIDATION_FAILED", "template_id, title, and fields are required.", { requestId }), { status: 400 });
  }

  const template = getTemplate(template_id);
  if (!template) {
    return NextResponse.json(fail("INVALID_TEMPLATE", "Unknown template.", { requestId }), { status: 400 });
  }

  const body_html = template.render(fields);

  // Insert document
  const { data: doc, error: insertErr } = await client
    .from("nc_documents")
    .insert({ title, template_type: template_id, body_html, fields, status: "draft", created_by: user.email })
    .select("id")
    .single();

  if (insertErr || !doc) {
    return NextResponse.json(fail("CREATE_FAILED", insertErr?.message ?? "Insert failed.", { requestId }), { status: 500 });
  }

  // Insert signers if provided
  if (Array.isArray(signers) && signers.length > 0) {
    const signerRows = signers.map((s: { name: string; email: string }) => ({
      document_id: doc.id,
      signer_name: s.name,
      signer_email: s.email.toLowerCase().trim(),
      signing_token: crypto.randomUUID(),
      status: "pending",
    }));
    await client.from("nc_document_signatures").insert(signerRows);
  }

  await client.from("audit_logs").insert({
    action: "document_created",
    entity: "nc_documents",
    entity_id: doc.id,
    actor: user.email,
    metadata: { template_id, title, request_id: requestId },
  });

  return NextResponse.json(ok({ id: doc.id }, "Document created."), { status: 201 });
}
