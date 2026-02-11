import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { fail, ok, safeRequestId } from "@/lib/api";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const OWNER_EMAIL = (process.env.OWNER_ADMIN_EMAIL || "neatcurbllc@gmail.com").toLowerCase();

const getBearer = (request: Request) => {
  const auth = request.headers.get("authorization");
  if (!auth) return null;
  const [type, token] = auth.split(" ");
  if (type?.toLowerCase() !== "bearer") return null;
  return token || null;
};

export async function GET(request: Request) {
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
    .select("email,role")
    .eq("id", userData.user.id)
    .maybeSingle();

  const profileEmail = profile?.email?.toLowerCase() || userData.user.email?.toLowerCase();
  if (profile?.role !== "admin" || profileEmail !== OWNER_EMAIL) {
    return NextResponse.json(fail("FORBIDDEN", "Owner-only visibility.", { requestId }), {
      status: 403
    });
  }

  try {
    const admin = getSupabaseAdmin();
    const users: Array<{
      id: string;
      email?: string;
      created_at?: string;
      last_sign_in_at?: string;
      confirmed_at?: string | null;
    }> = [];
    let page = 1;
    const perPage = 200;

    // Pull all auth users for access accounting.
    // Supabase returns paginated responses; loop until the page is short.
    while (true) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
      if (error) {
        throw error;
      }
      const batch = data?.users || [];
      users.push(...batch);
      if (batch.length < perPage) break;
      page += 1;
    }

    const { data: profiles } = await admin.from("profiles").select("id,role,email");
    const profileRows = profiles || [];
    const adminAccounts = profileRows.filter((row) => row.role === "admin").length;
    const staffAccounts = profileRows.filter((row) => row.role === "staff").length;

    const now = Date.now();
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
    const activeLast30 = users.filter((user) => {
      if (!user.last_sign_in_at) return false;
      return now - new Date(user.last_sign_in_at).getTime() <= THIRTY_DAYS_MS;
    }).length;

    const recentSessions = users
      .filter((user) => user.email)
      .sort((a, b) => {
        const aTs = a.last_sign_in_at ? new Date(a.last_sign_in_at).getTime() : 0;
        const bTs = b.last_sign_in_at ? new Date(b.last_sign_in_at).getTime() : 0;
        return bTs - aTs;
      })
      .slice(0, 20)
      .map((user) => ({
        id: user.id,
        email: user.email || "",
        last_sign_in_at: user.last_sign_in_at || null,
        created_at: user.created_at || null,
        confirmed_at: user.confirmed_at || null
      }));

    return NextResponse.json(
      ok(
        {
          requestId,
          ownerEmail: OWNER_EMAIL,
          totalAccounts: users.length,
          adminAccounts,
          staffAccounts,
          activeLast30,
          recentSessions
        },
        "Access overview ready."
      )
    );
  } catch (error) {
    return NextResponse.json(
      fail("ACCESS_OVERVIEW_FAILED", "Could not load access overview.", {
        requestId,
        details: error instanceof Error ? error.message : null
      }),
      { status: 500 }
    );
  }
}

