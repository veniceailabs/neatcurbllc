import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const FALLBACK_URL = "https://localhost.invalid";
const FALLBACK_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fallback.fallback";

const createBrowserClient = (): SupabaseClient | null => {
  const missingEnv = !supabaseUrl || !supabaseAnonKey;
  if (missingEnv) {
    if (typeof window !== "undefined") {
      console.warn("Supabase env is missing. Set NEXT_PUBLIC_SUPABASE_URL/ANON.");
    }
  }
  return createClient(supabaseUrl || FALLBACK_URL, supabaseAnonKey || FALLBACK_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
};

export const supabase = createBrowserClient() as SupabaseClient;
