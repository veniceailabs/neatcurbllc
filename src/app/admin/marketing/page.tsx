"use client";

import { useEffect, useState } from "react";
import SectionHeader from "@/components/SectionHeader";
import { supabase } from "@/lib/supabaseClient";

type Campaign = {
  id: string;
  name: string;
  status: string;
  reach: number | null;
};

export default function MarketingPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("campaigns")
        .select("id,name,status,reach")
        .order("created_at", { ascending: false });
      if (data) setCampaigns(data);
    };
    load();
  }, []);

  return (
    <div className="panel">
      <SectionHeader
        title="Marketing Command"
        subtitle="Automated SMS, email, and review generation."
        action={<span className="pill">{campaigns.length} campaigns</span>}
      />
      <div style={{ marginTop: "18px", display: "grid", gap: "12px" }}>
        {campaigns.length === 0 ? (
          <div className="kpi-card">
            <div style={{ fontWeight: 700 }}>No campaigns yet</div>
            <div className="note">Create a campaign to start outbound messaging.</div>
          </div>
        ) : (
          campaigns.map((campaign) => (
            <div key={campaign.id} className="kpi-card">
              <div style={{ fontWeight: 700 }}>{campaign.name}</div>
              <div className="note">Status: {campaign.status}</div>
              <div className="note">
                Reach: {campaign.reach ? campaign.reach.toLocaleString() : "--"}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
