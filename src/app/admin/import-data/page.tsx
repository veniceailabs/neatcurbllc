"use client";

import { useState } from "react";
import SectionHeader from "@/components/SectionHeader";
import CSVImportDialog from "@/components/CSVImportDialog";
import { supabase } from "@/lib/supabaseClient";
import { useLanguage } from "@/components/language-context";
import { getCopy } from "@/lib/i18n";
import {
  mapYardbookCustomersToClients,
  mapYardbookInvoicesToInvoices,
  mapYardbookPaymentsToPayments,
  mapYardbookExpensesToExpenses,
  batchInsert
} from "@/lib/csvImport";

interface ImportStats {
  type: string;
  successful: number;
  failed: number;
  timestamp: string;
}

export default function ImportDataPage() {
  const { language } = useLanguage();
  const copy = getCopy(language);

  const [isImporting, setIsImporting] = useState(false);
  const [isBulkImporting, setIsBulkImporting] = useState(false);
  const [importType, setImportType] = useState<string | null>(null);
  const [importStats, setImportStats] = useState<ImportStats[]>([]);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleBulkImport = async () => {
    setIsBulkImporting(true);
    try {
      const response = await fetch("/api/admin/import-yardbook", { method: "POST" });
      const data = await response.json();

      if (data.success) {
        const { stats } = data;
        const messages = [];
        if (stats.customers.imported > 0) messages.push(`${stats.customers.imported} customers`);
        if (stats.invoices.imported > 0) messages.push(`${stats.invoices.imported} invoices`);
        if (stats.payments.imported > 0) messages.push(`${stats.payments.imported} payments`);
        if (stats.expenses.imported > 0) messages.push(`${stats.expenses.imported} expenses`);

        const text = messages.length > 0
          ? `✅ Imported: ${messages.join(", ")}`
          : "ℹ️ No data to import";

        setMessage({ type: "success", text });
      } else {
        setMessage({ type: "error", text: data.error || "Import failed" });
      }
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Import failed" });
    } finally {
      setIsBulkImporting(false);
    }
  };

  const handleImportClients = async (data: { headers: string[]; rows: Record<string, string>[] }) => {
    setIsImporting(true);
    try {
      const mappedClients = mapYardbookCustomersToClients(data.rows);
      const seen = new Set<string>();
      const uniqueClients = mappedClients.filter((client) => {
        if (client.email && seen.has(client.email)) return false;
        if (client.email) seen.add(client.email);
        return true;
      });

      const result = await batchInsert(supabase, "clients", uniqueClients);
      setImportStats([...importStats, { type: "Clients", ...result, timestamp: new Date().toLocaleString() }]);
      setMessage({ type: "success", text: `Imported ${result.successful} clients` });
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Import failed" });
    } finally {
      setIsImporting(false);
    }
  };

  const handleImportInvoices = async (data: { headers: string[]; rows: Record<string, string>[] }) => {
    setIsImporting(true);
    try {
      const mappedInvoices = mapYardbookInvoicesToInvoices(data.rows);
      const result = await batchInsert(supabase, "invoices", mappedInvoices);
      setImportStats([...importStats, { type: "Invoices", ...result, timestamp: new Date().toLocaleString() }]);
      setMessage({ type: "success", text: `Imported ${result.successful} invoices` });
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Import failed" });
    } finally {
      setIsImporting(false);
    }
  };

  const handleImportPayments = async (data: { headers: string[]; rows: Record<string, string>[] }) => {
    setIsImporting(true);
    try {
      const mappedPayments = mapYardbookPaymentsToPayments(data.rows);
      const result = await batchInsert(supabase, "payments", mappedPayments);
      setImportStats([...importStats, { type: "Payments", ...result, timestamp: new Date().toLocaleString() }]);
      setMessage({ type: "success", text: `Imported ${result.successful} payments` });
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Import failed" });
    } finally {
      setIsImporting(false);
    }
  };

  const handleImportExpenses = async (data: { headers: string[]; rows: Record<string, string>[] }) => {
    setIsImporting(true);
    try {
      const mappedExpenses = mapYardbookExpensesToExpenses(data.rows);
      const result = await batchInsert(supabase, "expenses", mappedExpenses);
      setImportStats([...importStats, { type: "Expenses", ...result, timestamp: new Date().toLocaleString() }]);
      setMessage({ type: "success", text: `Imported ${result.successful} expenses` });
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Import failed" });
    } finally {
      setIsImporting(false);
    }
  };

  const importOptions = [
    {
      id: "clients",
      label: "Customers",
      description: "Import customer/client contacts from Yardbook",
      handler: handleImportClients
    },
    {
      id: "invoices",
      label: "Invoices",
      description: "Import invoice records from Yardbook",
      handler: handleImportInvoices
    },
    {
      id: "payments",
      label: "Payments",
      description: "Import payment records from Yardbook",
      handler: handleImportPayments
    },
    {
      id: "expenses",
      label: "Expenses",
      description: "Import expense records from Yardbook",
      handler: handleImportExpenses
    }
  ];

  return (
    <div className="panel">
      <SectionHeader
        title="Import Yardbook Data"
        subtitle="Seamlessly migrate all your data from Yardbook to NeatCurbOS. Upload each CSV file from your Yardbook export."
        action={<span className="pill">{importStats.length} imports</span>}
      />

      {message && (
        <div style={{
          marginTop: "16px",
          backgroundColor: message.type === "success" ? "#efe" : "#fee",
          color: message.type === "success" ? "#3c3" : "#c33",
          padding: "12px",
          borderRadius: "4px",
          fontSize: "14px"
        }}>
          {message.text}
        </div>
      )}

      <div style={{
        marginTop: "16px",
        padding: "16px",
        backgroundColor: "#f5f5f5",
        borderRadius: "8px",
        border: "2px solid #0a7ea4"
      }}>
        <div style={{ fontWeight: 700, marginBottom: "8px" }}>⚡ Quick Import All Yardbook Data</div>
        <div style={{ fontSize: "14px", color: "#666", marginBottom: "12px" }}>
          If you have your Yardbook CSV files saved in the system, click here to import everything at once.
        </div>
        <button
          onClick={handleBulkImport}
          disabled={isBulkImporting}
          className="button-primary"
          style={{ width: "auto" }}
        >
          {isBulkImporting ? "⏳ Importing..." : "🚀 Import All Yardbook Data"}
        </button>
      </div>

      <div style={{
        marginTop: "16px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "12px"
      }}>
        {importOptions.map((option) => (
          <div key={option.id} className="kpi-card">
            <div style={{ fontWeight: 700, marginBottom: "6px" }}>{option.label}</div>
            <div style={{ fontSize: "14px", color: "#666", marginBottom: "16px" }}>
              {option.description}
            </div>
            <button
              onClick={() => {
                setImportType(option.id);
              }}
              className="button-primary"
              disabled={isImporting}
              style={{ width: "100%" }}
            >
              Import {option.label}
            </button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "24px" }}>
        <div style={{ fontWeight: 700, marginBottom: "12px" }}>Import History</div>
        {importStats.length === 0 ? (
          <div className="kpi-card">
            <div style={{ color: "#999", fontSize: "14px" }}>
              No imports yet. Start by uploading your first CSV file.
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "8px" }}>
            {importStats.map((stat, idx) => (
              <div key={idx} className="kpi-card" style={{
                padding: "12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{stat.type}</div>
                  <div style={{ fontSize: "12px", color: "#999" }}>{stat.timestamp}</div>
                </div>
                <div style={{ textAlign: "right", fontSize: "14px" }}>
                  <div style={{ color: "#3c3", fontWeight: 600 }}>✓ {stat.successful}</div>
                  {stat.failed > 0 && (
                    <div style={{ color: "#c33", fontSize: "12px" }}>✗ {stat.failed}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Import Dialogs */}
      {importType === "clients" && (
        <CSVImportDialog
          isOpen={true}
          onClose={() => setImportType(null)}
          onImport={handleImportClients}
          title="Import Customers"
          description="Upload your Yardbook customers CSV export. This file is typically called 'Customers' or 'Clients' in Yardbook."
        />
      )}

      {importType === "invoices" && (
        <CSVImportDialog
          isOpen={true}
          onClose={() => setImportType(null)}
          onImport={handleImportInvoices}
          title="Import Invoices"
          description="Upload your Yardbook invoices CSV export. This file contains all invoice records."
        />
      )}

      {importType === "payments" && (
        <CSVImportDialog
          isOpen={true}
          onClose={() => setImportType(null)}
          onImport={handleImportPayments}
          title="Import Payments"
          description="Upload your Yardbook payments CSV export. This file contains payment records."
        />
      )}

      {importType === "expenses" && (
        <CSVImportDialog
          isOpen={true}
          onClose={() => setImportType(null)}
          onImport={handleImportExpenses}
          title="Import Expenses"
          description="Upload your Yardbook expenses CSV export. This file contains all business expense records."
        />
      )}
    </div>
  );
}
