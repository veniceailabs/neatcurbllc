"use client";

import { useEffect, useState } from "react";
import SectionHeader from "@/components/SectionHeader";
import { supabase } from "@/lib/supabaseClient";

type Client = {
  id: string;
  name: string;
  status: string;
  address: string;
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("clients")
        .select("id,name,status,address")
        .order("created_at", { ascending: false });
      if (data) setClients(data);
    };
    load();
  }, []);

  return (
    <div className="panel">
      <SectionHeader
        title="Clients CRM"
        subtitle="Full relationship history, cards-on-file, and proof of work."
        action={<span className="pill">{clients.length} total</span>}
      />
      <div style={{ marginTop: "18px", display: "grid", gap: "12px" }}>
        {clients.length === 0 ? (
          <div className="kpi-card">
            <div style={{ fontWeight: 700 }}>No clients yet</div>
            <div className="note">Add a client to begin tracking service history.</div>
          </div>
        ) : (
          clients.map((client) => (
            <div key={client.id} className="kpi-card">
              <div style={{ fontWeight: 700 }}>{client.name}</div>
              <div className="note">Status: {client.status}</div>
              <div className="note">{client.address}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
