import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

export async function POST(request: Request) {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { ok: false, error: "Supabase env missing." },
        { status: 500 }
      );
    }

    const token = getBearer(request);
    if (!token) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized." },
        { status: 401 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });

    const { data: userData, error: userError } = await supabase.auth.getUser(
      token
    );
    if (userError || !userData?.user) {
      return NextResponse.json(
        { ok: false, error: "Invalid session." },
        { status: 401 }
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userData.user.id)
      .maybeSingle();

    if (profile?.role !== "admin") {
      return NextResponse.json(
        { ok: false, error: "Forbidden." },
        { status: 403 }
      );
    }

    const payload = await request.json();
    const messages = Array.isArray(payload?.messages) ? payload.messages : null;

    if (!messages) {
      return NextResponse.json(
        { ok: false, error: "Messages array is required." },
        { status: 400 }
      );
    }

    const enginePayload = {
      messages: [{ role: "user", content: BUSINESS_CONTEXT }, ...messages],
      stream: false,
      max_tokens: payload?.settings?.maxTokens ?? 512,
      temperature: payload?.settings?.temperature ?? 0.25,
      top_p: payload?.settings?.topP ?? 0.92
    };

    const response = await fetch(ENGINE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(enginePayload)
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        {
          ok: false,
          error: "Business AI engine error.",
          details: text
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const message = data?.message || data?.response;

    return NextResponse.json({ ok: true, message });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "Business AI request failed." },
      { status: 500 }
    );
  }
}
