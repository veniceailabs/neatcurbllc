"use client";

import { useEffect, useMemo, useState } from "react";
import DispatchPanel from "@/components/DispatchPanel";
import KpiCard from "@/components/KpiCard";
import SectionHeader from "@/components/SectionHeader";
import WeatherCard from "@/components/WeatherCard";
import { supabase } from "@/lib/supabaseClient";

type Lead = { id: string; created_at: string };

type Invoice = { id: string; amount: number; status: string };

type Job = { id: string; status: string };

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    const load = async () => {
      const [leadRes, invoiceRes, jobRes] = await Promise.all([
        supabase.from("leads").select("id,created_at"),
        supabase.from("invoices").select("id,amount,status"),
        supabase.from("jobs").select("id,status")
      ]);
      if (leadRes.data) setLeads(leadRes.data);
      if (invoiceRes.data) setInvoices(invoiceRes.data);
      if (jobRes.data) setJobs(jobRes.data);
    };
    load();
  }, []);

  const totalRevenue = useMemo(() => {
    return invoices.reduce((sum, invoice) => sum + (invoice.amount || 0), 0);
  }, [invoices]);

  const activeJobs = useMemo(() => {
    return jobs.filter((job) => job.status === "in_progress").length;
  }, [jobs]);

  return (
    <div>
      <SectionHeader
        title="Master Admin Dashboard"
        subtitle="Unified operations, revenue, and lead intelligence."
        action={<span className="pill">2-3 in trigger standard</span>}
      />

      <div className="kpi-grid">
        <KpiCard
          label="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          trend="All invoices"
        />
        <KpiCard label="Active Jobs" value={`${activeJobs}`} trend="Live routes" />
        <KpiCard label="Leads" value={`${leads.length}`} trend="Total intake" />
        <KpiCard label="Snow Ready" value="ON" trend="Weather synced" />
      </div>

      <div className="grid-2">
        <WeatherCard />
        <DispatchPanel />
      </div>
    </div>
  );
}
