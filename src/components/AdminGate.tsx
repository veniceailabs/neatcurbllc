"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AdminGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      if (!data.session) {
        router.replace("/admin/login");
      } else {
        setReady(true);
      }
    };
    check();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("/admin/login");
      }
    });
    return () => {
      mounted = false;
      sub?.subscription.unsubscribe();
    };
  }, [router]);

  if (!ready) {
    return (
      <div className="panel" style={{ maxWidth: "640px", margin: "80px auto" }}>
        <div className="section-title">Loading secure dashboard...</div>
        <div className="section-sub">
          Authenticating session and verifying access.
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
