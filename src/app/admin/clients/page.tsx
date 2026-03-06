"use client";

import { useEffect, useState } from "react";
import SectionHeader from "@/components/SectionHeader";
import CSVImportDialog from "@/components/CSVImportDialog";
import { supabase } from "@/lib/supabaseClient";
import { useLanguage } from "@/components/language-context";
import { getCopy } from "@/lib/i18n";
import { mapYardbookCustomersToClients, batchInsert } from "@/lib/csvImport";

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
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase
      .from("clients")
      .select("id,name,address,type")
      .order("created_at", { ascending: false });
    if (data) setClients(data);
  };

  useEffect(() => {
    load();
  }, []);

  const handleImportCSV = async (data: { headers: string[]; rows: Record<string, string>[] }) => {
    try {
      const mappedClients = mapYardbookCustomersToClients(data.rows);

      // Filter out duplicates by email
      const seen = new Set<string>();
      const uniqueClients = mappedClients.filter((client) => {
        if (client.email && seen.has(client.email)) return false;
        if (client.email) seen.add(client.email);
        return true;
      });

      const result = await batchInsert(supabase, "clients", uniqueClients);

      setImportSuccess(`Successfully imported ${result.successful} clients. ${result.failed > 0 ? `${result.failed} failed.` : ""}`);
      await load();

      if (result.failed > 0) {
        setImportError(`${result.failed} records failed to import`);
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Failed to import clients");
    }
  };

  return (
    <div className="panel">
      <SectionHeader
        title={copy.admin.clients.title}
        subtitle={copy.admin.clients.subtitle}
        action={<span className="pill">{clients.length} {copy.admin.clients.total}</span>}
      />

      <div style={{ marginTop: "16px", display: "flex", gap: "12px" }}>
        <button
          onClick={() => setIsImportOpen(true)}
          className="button-primary"
        >
          Import from Yardbook
        </button>
      </div>

      {importSuccess && (
        <div style={{
          marginTop: "12px",
          backgroundColor: "#efe",
          color: "#3c3",
          padding: "12px",
          borderRadius: "4px",
          fontSize: "14px"
        }}>
          {importSuccess}
        </div>
      )}

      {importError && (
        <div style={{
          marginTop: "12px",
          backgroundColor: "#fee",
          color: "#c33",
          padding: "12px",
          borderRadius: "4px",
          fontSize: "14px"
        }}>
          {importError}
        </div>
      )}

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

      <CSVImportDialog
        isOpen={isImportOpen}
        onClose={() => {
          setIsImportOpen(false);
          setImportSuccess(null);
          setImportError(null);
        }}
        onImport={handleImportCSV}
        title="Import Customers from Yardbook"
        description="Upload your Yardbook customers CSV export to import all client contacts."
      />
    </div>
  );
}
