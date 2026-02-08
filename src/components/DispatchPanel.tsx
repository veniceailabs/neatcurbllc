"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function DispatchPanel() {
  const [queued, setQueued] = useState(0);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("routes")
        .select("id,status");
      if (data) {
        setQueued(data.filter((route) => route.status === "queued").length);
      }
    };
    load();
  }, []);

  return (
    <div className="panel panel-dark">
      <div className="section-title">The Push Button</div>
      <div className="section-sub" style={{ color: "rgba(255,255,255,0.8)" }}>
        One-tap dispatch to every crew based on live snowfall.
      </div>
      <div style={{ marginTop: "18px" }}>
        <button className="button-primary">Dispatch All Crews</button>
      </div>
      <div style={{ marginTop: "16px", display: "flex", gap: "12px" }}>
        <span className="pill">Routes queued: {queued}</span>
        <span className="pill">ETA alerts: Live</span>
      </div>
    </div>
  );
}
