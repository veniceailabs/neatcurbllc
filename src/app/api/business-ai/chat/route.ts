import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { chatSchema } from "@/lib/validators";
import { fail, ok, safeRequestId } from "@/lib/api";

export const runtime = "nodejs";

const ENGINE_URL =
  process.env.BUSINESS_AI_ENGINE_URL ||
  process.env.NEXUS_ENGINE_URL ||
  "http://localhost:7331/api/chat";

const BUSINESS_CONTEXT =
  "Context: You are Business AI for Neat Curb LLC. Use the 2-3 inch snowfall trigger standard, apply heavy snow surcharges (3-6 in +50%, 6-12 in +75%, 12+ in +100%), and reference the published residential/commercial pricing. Provide concise, action-ready responses.";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const getBearer = (request: Request) => {
  const auth = request.headers.get("authorization");
  if (!auth) return null;
  const [type, token] = auth.split(" ");
  if (type?.toLowerCase() !== "bearer") return null;
  return token || null;
};

const fetchWithTimeout = async (url: string, init: RequestInit, ms: number) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
};

export async function POST(request: Request) {
  const requestId = safeRequestId();
  try {
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
      .select("role")
      .eq("id", userData.user.id)
      .maybeSingle();

    if (profile?.role !== "admin") {
      return NextResponse.json(fail("FORBIDDEN", "Forbidden.", { requestId }), {
        status: 403
      });
    }

    const payload = await request.json().catch(() => null);
    const parsed = chatSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json(
        fail("VALIDATION_FAILED", "Invalid chat payload.", {
          requestId,
          issues: parsed.error.issues
        }),
        { status: 400 }
      );
    }

    const enginePayload = {
      messages: [{ role: "user", content: BUSINESS_CONTEXT }, ...parsed.data.messages],
      stream: false,
      max_tokens: parsed.data.settings?.maxTokens ?? 512,
      temperature: parsed.data.settings?.temperature ?? 0.25,
      top_p: parsed.data.settings?.topP ?? 0.92
    };

    let response: Response | null = null;
    let lastError: string | null = null;

    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        response = await fetchWithTimeout(
          ENGINE_URL,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(enginePayload)
          },
          10000
        );
        if (response.ok) break;
        lastError = await response.text();
      } catch (error) {
        lastError = error instanceof Error ? error.message : "AI engine request failed.";
      }
    }

    if (!response || !response.ok) {
      return NextResponse.json(
        fail("AI_UNAVAILABLE", "Business AI engine unavailable.", {
          requestId,
          details: lastError
        }),
        { status: 503 }
      );
    }

    const data = await response.json().catch(() => ({}));
    const message = data?.message || data?.response || null;

    return NextResponse.json(ok({ requestId, message }, "Business AI response ready."));
  } catch (error) {
    return NextResponse.json(
      fail("UNEXPECTED_ERROR", "Business AI request failed.", {
        requestId,
        details: error instanceof Error ? error.message : null
      }),
      { status: 500 }
    );
  }
}
