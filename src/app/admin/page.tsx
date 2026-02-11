"use client";

import { useEffect, useMemo, useState } from "react";
import KpiCard from "@/components/KpiCard";
import SectionHeader from "@/components/SectionHeader";
import OnboardingPanel from "@/components/OnboardingPanel";
import Tooltip from "@/components/Tooltip";
import { supabase } from "@/lib/supabaseClient";
import { useLanguage } from "@/components/language-context";
import { getCopy } from "@/lib/i18n";

type Lead = { id: string; created_at: string };
type Job = { id: string; status: string };

export default function DashboardPage() {
  const { language } = useLanguage();
  const copy = getCopy(language);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [snowReadyLoading, setSnowReadyLoading] = useState(false);
  const [snowReadyMessage, setSnowReadyMessage] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(true);

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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const sync = () => {
      const stored = window.localStorage.getItem("neatcurb:onboarding-visible");
      setShowOnboarding(stored !== "off");
    };
    sync();
    window.addEventListener("neatcurb:onboarding-change", sync as EventListener);
    return () =>
      window.removeEventListener("neatcurb:onboarding-change", sync as EventListener);
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
      setSnowReadyMessage(copy.admin.dashboard.snowReady.success);
    }
    setSnowReadyLoading(false);
  };

  return (
    <div>
      <SectionHeader
        title={copy.admin.dashboard.title}
        subtitle={copy.admin.dashboard.subtitle}
        action={<span className="pill">{copy.admin.dashboard.pill}</span>}
      />

      <div className="kpi-grid">
        <KpiCard
          label={copy.admin.dashboard.kpis.leads}
          value={`${leads.length}`}
          trend={copy.admin.dashboard.kpis.newRequests}
        />
        <KpiCard
          label={copy.admin.dashboard.kpis.activeJobs}
          value={`${activeJobs}`}
          trend={copy.admin.dashboard.kpis.inProgress}
        />
        <KpiCard
          label={copy.admin.dashboard.kpis.totalJobs}
          value={`${jobs.length}`}
          trend={copy.admin.dashboard.kpis.scheduled}
        />
        <KpiCard
          label={copy.admin.dashboard.kpis.adminStatus}
          value="Live"
          trend={copy.admin.dashboard.kpis.secureAccess}
        />
      </div>

      <div className="panel" style={{ marginTop: "16px" }}>
        <div className="section-title">{copy.admin.dashboard.snowReady.title}</div>
        <div className="section-sub">{copy.admin.dashboard.snowReady.subtitle}</div>
        <div style={{ marginTop: "16px", display: "flex", gap: "12px" }}>
          <Tooltip label={copy.admin.dashboard.snowReady.tooltip}>
            <button
              className="button-primary"
              type="button"
              onClick={handleSnowReady}
              disabled={snowReadyLoading}
            >
              {snowReadyLoading
                ? copy.admin.dashboard.snowReady.preparing
                : copy.admin.dashboard.snowReady.activate}
            </button>
          </Tooltip>
          {snowReadyMessage ? <div className="note">{snowReadyMessage}</div> : null}
        </div>
      </div>

      {showOnboarding ? <OnboardingPanel /> : null}
    </div>
  );
}
