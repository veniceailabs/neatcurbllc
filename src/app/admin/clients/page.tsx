"use client";

import { useEffect, useState } from "react";
import SectionHeader from "@/components/SectionHeader";
import { supabase } from "@/lib/supabaseClient";
import { useLanguage } from "@/components/language-context";
import { getCopy } from "@/lib/i18n";

type Client = {
  id: string;
  name: string;
  address: string;
  type: string;
};

export default function ClientsPage() {
  const { language } = useLanguage();
  const copy = getCopy(language);
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("clients")
        .select("id,name,address,type")
        .order("created_at", { ascending: false });
      if (data) setClients(data);
    };
    load();
  }, []);

  return (
    <div className="panel">
      <SectionHeader
        title={copy.admin.clients.title}
        subtitle={copy.admin.clients.subtitle}
        action={<span className="pill">{clients.length} {copy.admin.clients.total}</span>}
      />
      <div style={{ marginTop: "18px", display: "grid", gap: "12px" }}>
        {clients.length === 0 ? (
          <div className="kpi-card">
            <div style={{ fontWeight: 700 }}>{copy.admin.clients.emptyTitle}</div>
            <div className="note">{copy.admin.clients.emptyBody}</div>
          </div>
        ) : (
          clients.map((client) => (
            <div key={client.id} className="kpi-card">
              <div style={{ fontWeight: 700 }}>{client.name}</div>
              <div className="note">
                {copy.admin.clients.type}: {client.type || "--"}
              </div>
              <div className="note">{client.address}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
