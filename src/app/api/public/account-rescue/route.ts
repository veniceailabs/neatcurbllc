import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { fail, ok, safeRequestId } from "@/lib/api";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { simpleRateLimit } from "@/lib/rateLimit";

const OWNER_RECOVERY_ALLOWLIST = new Set(
  (
    process.env.OWNER_RECOVERY_ALLOWLIST ||
    "neatcurb@gmail.com,andrakennerjr@going-digital.org"
  )
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
);
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

type RescueBody = {
  email?: string;
};

const getIp = (request: Request) => {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
};

export async function POST(request: Request) {
  const requestId = safeRequestId();
  const ip = getIp(request);
  const rate = simpleRateLimit(`account-rescue:${ip}`, 8, 60 * 60 * 1000);
  if (!rate.allowed) {
    return NextResponse.json(
      fail("RATE_LIMITED", "Too many attempts. Try again later.", { requestId }),
      {
        status: 429,
        headers: { "Retry-After": String(rate.retryAfterSec) }
      }
    );
  }

  let body: RescueBody = {};
  try {
    body = (await request.json()) as RescueBody;
  } catch {
    // No-op; fall through to generic response.
  }

  const email = (body.email || "").trim().toLowerCase();
  if (!email) {
    return NextResponse.json(ok({ requestId }, "If eligible, account rescue was applied."));
  }

  if (!OWNER_RECOVERY_ALLOWLIST.has(email)) {
    // Generic success to avoid account enumeration.
    return NextResponse.json(ok({ requestId }, "If eligible, account rescue was applied."));
  }

  const sendFallbackLinks = async () => {
    if (!supabaseUrl || !supabaseAnonKey) return;
    const origin = new URL(request.url).origin;
    const client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    await client.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${origin}/admin/login` }
    });
    await client.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/admin/change-password`
    });
  };

  try {
    let admin: ReturnType<typeof getSupabaseAdmin> | null = null;
    try {
      admin = getSupabaseAdmin();
    } catch {
      admin = null;
    }

    if (!admin) {
      await sendFallbackLinks();
      return NextResponse.json(
        ok({ requestId }, "Recovery links sent. Open the newest email.")
      );
    }

    const perPage = 200;
    let page = 1;
    let userId: string | null = null;

    while (true) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
      if (error) throw error;
      const users = data?.users || [];
      const match = users.find((user) => (user.email || "").toLowerCase() === email);
      if (match) {
        userId = match.id;
        break;
      }
      if (users.length < perPage) break;
      page += 1;
    }

    if (!userId) {
      return NextResponse.json(ok({ requestId }, "If eligible, account rescue was applied."));
    }

    const { error: authUpdateError } = await admin.auth.admin.updateUserById(userId, {
      email_confirm: true,
      ban_duration: "none"
    });
    if (authUpdateError) {
      throw authUpdateError;
    }

    const { error: profileError } = await admin.from("profiles").upsert(
      {
        id: userId,
        email,
        role: "admin",
        must_change_password: false
      },
      { onConflict: "id" }
    );

    if (profileError) {
      throw profileError;
    }

    await sendFallbackLinks();
    return NextResponse.json(ok({ requestId }, "Account rescue applied."));
  } catch (error) {
    await sendFallbackLinks();
    return NextResponse.json(
      ok(
        {
          requestId,
          fallback: true,
          details: error instanceof Error ? error.message : null
        },
        "Recovery links sent. Open the newest email."
      )
    );
  }
}
