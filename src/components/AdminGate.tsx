"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { AdminProvider, type AdminRole } from "@/components/admin-context";
import { TooltipProvider } from "@/components/tooltip-context";

export default function AdminGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isPublicAdminRoute =
    pathname?.startsWith("/admin/login") ||
    pathname?.startsWith("/admin/change-password");
  const [ready, setReady] = useState(Boolean(isPublicAdminRoute));
  const [role, setRole] = useState<AdminRole | null>(null);

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      setReady(false);
      // These routes must be reachable without an existing session:
      // - login: obvious
      // - change-password: recovery links hydrate a session from the URL after load
      if (isPublicAdminRoute) {
        setReady(true);
        return;
      }
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      if (!data.session) {
        router.replace("/admin/login");
      } else {
        const userId = data.session.user.id;
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role,must_change_password")
          .eq("id", userId)
          .maybeSingle();
        if (profileError || !profile) {
          await supabase.auth.signOut();
          router.replace("/admin/login?reason=profile_missing");
          return;
        }
        if (
          profile.must_change_password &&
          pathname !== "/admin/change-password" &&
          pathname !== "/admin/logout"
        ) {
          router.replace("/admin/change-password");
          return;
        }
        const nextRole = (profile?.role || "user") as AdminRole;
        setRole(nextRole);
        if (nextRole === "staff") {
          if (pathname !== "/admin/work-orders" && pathname !== "/admin/logout") {
            router.replace("/admin/work-orders");
            return;
          }
        } else if (nextRole !== "admin") {
          await supabase.auth.signOut();
          router.replace("/admin/login?reason=forbidden");
          return;
        }
        setReady(true);
      }
    };
    check().catch(() => {
      if (isPublicAdminRoute) {
        setReady(true);
        return;
      }
      router.replace("/admin/login");
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      // Don't bounce users off password recovery/change-password while the session
      // is hydrating from the recovery URL.
      if (
        !session &&
        pathname !== "/admin/login" &&
        pathname !== "/admin/change-password"
      ) {
        router.replace("/admin/login");
      }
    });
    return () => {
      mounted = false;
      sub?.subscription.unsubscribe();
    };
  }, [router, pathname, isPublicAdminRoute]);

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
