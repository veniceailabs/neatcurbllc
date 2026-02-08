"use client";

import { useEffect, useState } from "react";
import SectionHeader from "@/components/SectionHeader";
import { supabase } from "@/lib/supabaseClient";
import { useLanguage } from "@/components/language-context";
import { getCopy } from "@/lib/i18n";

type Lead = {
  id: string;
  name: string;
  service: string | null;
  created_at: string;
  message: string | null;
  address: string | null;
  estimated_low: number | null;
  estimated_high: number | null;
  pricing_meta: {
    serviceDetail?: string | null;
  } | null;
};

export default function LeadsPage() {
  const { language } = useLanguage();
  const copy = getCopy(language);
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("leads")
        .select(
          "id,name,service,created_at,message,address,estimated_low,estimated_high,pricing_meta"
        )
        .order("created_at", { ascending: false });
      if (data) setLeads(data);
    };
    load();
  }, []);

  return (
    <div className="panel">
      <SectionHeader
        title={copy.admin.leads.title}
        subtitle={copy.admin.leads.subtitle}
        action={<span className="pill">{leads.length} {copy.admin.leads.active}</span>}
      />
      <div style={{ marginTop: "18px", display: "grid", gap: "12px" }}>
        {leads.length === 0 ? (
          <div className="kpi-card">
            <div style={{ fontWeight: 700 }}>{copy.admin.leads.emptyTitle}</div>
            <div className="note">{copy.admin.leads.emptyBody}</div>
          </div>
        ) : (
          leads.map((lead) => (
            <div key={lead.id} className="kpi-card">
              <div style={{ fontWeight: 700 }}>{lead.name}</div>
              <div className="note">
                {copy.admin.leads.service}: {lead.service || "--"}
              </div>
              {lead.pricing_meta?.serviceDetail ? (
                <div className="note">
                  {copy.admin.leads.detail}: {lead.pricing_meta.serviceDetail}
                </div>
              ) : null}
              <div className="note">
                {copy.admin.leads.address}: {lead.address || "--"}
              </div>
              {lead.estimated_low !== null ? (
                <div className="note">
                  {copy.admin.leads.estimate}: ${lead.estimated_low}
                  {lead.estimated_high && lead.estimated_high !== lead.estimated_low
                    ? ` - $${lead.estimated_high}`
                    : ""}
                </div>
              ) : null}
              <div className="note">
                {copy.admin.leads.message}: {lead.message || "--"}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
