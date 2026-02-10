"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { AdminProvider, type AdminRole } from "@/components/admin-context";
import { TooltipProvider } from "@/components/tooltip-context";

export default function AdminGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [role, setRole] = useState<AdminRole | null>(null);

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      setReady(false);
      // These routes must be reachable without an existing session:
      // - login: obvious
      // - change-password: recovery links hydrate a session from the URL after load
      if (pathname === "/admin/login" || pathname === "/admin/change-password") {
        setReady(true);
        return;
      }
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      if (!data.session) {
        router.replace("/admin/login");
      } else {
        const userId = data.session.user.id;
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", userId)
          .maybeSingle();
        const nextRole = (profile?.role || "user") as AdminRole;
        setRole(nextRole);
        if (nextRole === "staff") {
          if (pathname !== "/admin/work-orders" && pathname !== "/admin/logout") {
            router.replace("/admin/work-orders");
            return;
          }
        } else if (nextRole !== "admin") {
          router.replace("/admin/login");
          return;
        }
        setReady(true);
      }
    };
    check();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && pathname !== "/admin/login") {
        router.replace("/admin/login");
      }
    });
    return () => {
      mounted = false;
      sub?.subscription.unsubscribe();
    };
  }, [router, pathname]);

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

  return (
    <AdminProvider role={role}>
      <TooltipProvider>{children}</TooltipProvider>
    </AdminProvider>
  );
}
