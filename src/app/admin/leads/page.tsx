"use client";

import { useEffect, useState } from "react";
import SectionHeader from "@/components/SectionHeader";
import { supabase } from "@/lib/supabaseClient";

type Lead = {
  id: string;
  name: string;
  status: string;
  service_type: string;
  created_at: string;
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("leads")
        .select("id,name,status,service_type,created_at")
        .order("created_at", { ascending: false });
      if (data) setLeads(data);
    };
    load();
  }, []);

  return (
    <div className="panel">
      <SectionHeader
        title="Leads & Sales"
        subtitle="Live lead intake with automated follow-ups and conversion tracking."
        action={<span className="pill">{leads.length} active</span>}
      />
      <div style={{ marginTop: "18px", display: "grid", gap: "12px" }}>
        {leads.length === 0 ? (
          <div className="kpi-card">
            <div style={{ fontWeight: 700 }}>No leads yet</div>
            <div className="note">New leads will appear here in real time.</div>
          </div>
        ) : (
          leads.map((lead) => (
            <div key={lead.id} className="kpi-card">
              <div style={{ fontWeight: 700 }}>{lead.name}</div>
              <div className="note">Service: {lead.service_type}</div>
              <div className="note">Status: {lead.status}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
