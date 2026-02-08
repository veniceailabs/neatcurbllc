import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const createBrowserClient = (): SupabaseClient | null => {
  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window !== "undefined") {
      console.warn("Supabase env is missing. Set NEXT_PUBLIC_SUPABASE_URL/ANON.");
    }
    return null;
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
};

const fallback = new Proxy(
  {},
  {
    get() {
      return () => {
        throw new Error(
          "Supabase env is missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
        );
      };
    }
  }
) as SupabaseClient;

export const supabase = createBrowserClient() ?? fallback;
