"use client";

import { useEffect, useMemo, useState } from "react";
import KpiCard from "@/components/KpiCard";
import SectionHeader from "@/components/SectionHeader";
import { supabase } from "@/lib/supabaseClient";

type Lead = { id: string; created_at: string };
type Job = { id: string; status: string };

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    const load = async () => {
      const [leadRes, jobRes] = await Promise.all([
        supabase.from("leads").select("id,created_at"),
        supabase.from("jobs").select("id,status")
      ]);
      if (leadRes.data) setLeads(leadRes.data);
      if (jobRes.data) setJobs(jobRes.data);
    };
    load();
  }, []);

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
          label="Leads"
          value={`${leads.length}`}
          trend="New requests"
        />
        <KpiCard label="Active Jobs" value={`${activeJobs}`} trend="In progress" />
        <KpiCard label="Total Jobs" value={`${jobs.length}`} trend="Scheduled + complete" />
        <KpiCard label="Admin Status" value="Live" trend="Secure access" />
      </div>
    </div>
  );
}
