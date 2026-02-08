"use client";

import { useEffect, useState } from "react";
import SectionHeader from "@/components/SectionHeader";
import { supabase } from "@/lib/supabaseClient";

type RouteRecord = {
  id: string;
  route_name: string;
  status: string;
  eta_minutes: number | null;
};

export default function RoutesPage() {
  const [routes, setRoutes] = useState<RouteRecord[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("routes")
        .select("id,route_name,status,eta_minutes")
        .order("created_at", { ascending: false });
      if (data) setRoutes(data);
    };
    load();
  }, []);

  return (
    <div className="panel">
      <SectionHeader
        title="Routes & Dispatch"
        subtitle="Live routes, crew status, and dispatch readiness."
        action={<span className="pill">{routes.length} routes</span>}
      />
      <div style={{ marginTop: "18px", display: "grid", gap: "12px" }}>
        {routes.length === 0 ? (
          <div className="kpi-card">
            <div style={{ fontWeight: 700 }}>No routes yet</div>
            <div className="note">Dispatch routes to track live progress.</div>
          </div>
        ) : (
          routes.map((route) => (
            <div key={route.id} className="kpi-card">
              <div style={{ fontWeight: 700 }}>{route.route_name}</div>
              <div className="note">Status: {route.status}</div>
              <div className="note">\n                ETA: {route.eta_minutes ? `${route.eta_minutes} min` : \"--\"}\n              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
