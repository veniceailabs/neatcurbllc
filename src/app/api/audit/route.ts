import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auditWriteSchema } from "@/lib/validators";
import { fail, ok, safeRequestId } from "@/lib/api";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

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
  const parsed = auditWriteSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      fail("VALIDATION_FAILED", "Invalid audit payload.", {
        requestId,
        issues: parsed.error.issues
      }),
      { status: 400 }
    );
  }

  const { error } = await supabase.from("audit_logs").insert({
    actor_id: userData.user.id,
    actor: profile?.email || userData.user.email || "admin",
    action: parsed.data.action,
    entity: parsed.data.entity || null,
    entity_id: parsed.data.entity_id || null,
    metadata: {
      ...(parsed.data.metadata || {}),
      request_id: requestId
    }
  });

  if (error) {
    return NextResponse.json(fail("INSERT_FAILED", error.message, { requestId }), {
      status: 400
    });
  }

  return NextResponse.json(ok({ requestId }, "Audit entry stored."));
}
