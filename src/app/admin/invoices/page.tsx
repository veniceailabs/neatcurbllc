"use client";

import { useEffect, useMemo, useState } from "react";
import SectionHeader from "@/components/SectionHeader";
import { supabase } from "@/lib/supabaseClient";

type Invoice = {
  id: string;
  invoice_number: string;
  client_name: string;
  status: string;
  amount: number;
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("invoices")
        .select("id,invoice_number,client_name,status,amount")
        .order("created_at", { ascending: false });
      if (data) setInvoices(data);
    };
    load();
  }, []);

  const totalDue = useMemo(() => {
    return invoices
      .filter((inv) => inv.status !== "paid")
      .reduce((sum, inv) => sum + (inv.amount || 0), 0);
  }, [invoices]);

  return (
    <div className="panel">
      <SectionHeader
        title="Invoices & Aging"
        subtitle="Billing, reminders, and payment status in one view."
        action={<span className="pill">${totalDue.toLocaleString()} due</span>}
      />
      <div style={{ marginTop: "18px", display: "grid", gap: "12px" }}>
        {invoices.length === 0 ? (
          <div className="kpi-card">
            <div style={{ fontWeight: 700 }}>No invoices yet</div>
            <div className="note">Invoices will populate once billing is active.</div>
          </div>
        ) : (
          invoices.map((invoice) => (
            <div key={invoice.id} className="kpi-card">
              <div style={{ fontWeight: 700 }}>{invoice.invoice_number}</div>
              <div className="note">Client: {invoice.client_name}</div>
              <div className="note">Status: {invoice.status}</div>
              <div style={{ fontWeight: 700 }}>
                ${invoice.amount.toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
