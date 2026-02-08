"use client";

import { useEffect, useMemo, useState } from "react";
import KpiCard from "@/components/KpiCard";
import SectionHeader from "@/components/SectionHeader";
import OnboardingPanel from "@/components/OnboardingPanel";
import Tooltip from "@/components/Tooltip";
import { supabase } from "@/lib/supabaseClient";

type Lead = { id: string; created_at: string };
type Job = { id: string; status: string };

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [snowReadyLoading, setSnowReadyLoading] = useState(false);
  const [snowReadyMessage, setSnowReadyMessage] = useState<string | null>(null);

  const postAudit = async (payload: {
    action: string;
    entity?: string;
    entity_id?: string;
    metadata?: Record<string, unknown>;
  }) => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;
    await fetch("/api/audit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
  };

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

  const handleSnowReady = async () => {
    setSnowReadyLoading(true);
    setSnowReadyMessage(null);
    const today = new Date().toISOString().slice(0, 10);
    const { error } = await supabase.from("jobs").insert({
      service: "Snow Removal",
      status: "queued",
      scheduled_date: today
    });
    if (error) {
      setSnowReadyMessage(error.message);
    } else {
      await postAudit({
        action: "snow_ready_activated",
        entity: "job_batch",
        metadata: {
          scheduled_date: today
        }
      });
      setSnowReadyMessage("Snow Ready batch created.");
    }
    setSnowReadyLoading(false);
  };

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

      <div className="panel" style={{ marginTop: "16px" }}>
        <div className="section-title">Snow Ready Control</div>
        <div className="section-sub">
          Prepare dispatch batches and tie them to the jobs table.
        </div>
        <div style={{ marginTop: "16px", display: "flex", gap: "12px" }}>
          <Tooltip label="Create a queued snow batch for today's date">
            <button
              className="button-primary"
              type="button"
              onClick={handleSnowReady}
              disabled={snowReadyLoading}
            >
              {snowReadyLoading ? "Preparing..." : "Activate Snow Ready"}
            </button>
          </Tooltip>
          {snowReadyMessage ? <div className="note">{snowReadyMessage}</div> : null}
        </div>
      </div>

      <OnboardingPanel />
    </div>
  );
}
