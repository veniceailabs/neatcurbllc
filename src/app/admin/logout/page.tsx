"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LogoutPage() {
  const router = useRouter();
  useEffect(() => {
    const run = async () => {
      await supabase.auth.signOut();
      router.replace("/");
    };
    run();
  }, [router]);

  return (
    <div className="panel" style={{ maxWidth: "640px", margin: "80px auto" }}>
      <div className="section-title">Signing out...</div>
      <div className="section-sub">Clearing admin session.</div>
    </div>
  );
}
