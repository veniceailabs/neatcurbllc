"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import KpiCard from "@/components/KpiCard";
import SectionHeader from "@/components/SectionHeader";
import OnboardingPanel from "@/components/OnboardingPanel";
import Tooltip from "@/components/Tooltip";
import { supabase } from "@/lib/supabaseClient";
import { useLanguage } from "@/components/language-context";
import { getCopy } from "@/lib/i18n";

type Lead = { id: string; created_at: string; lead_status: string | null };
type Job = { id: string; status: string };
type Client = { id: string };
type Invoice = { id: string; status: string | null; total: number | null };

export default function DashboardPage() {
  const { language } = useLanguage();
  const copy = getCopy(language);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
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
      const [leadRes, jobRes, clientRes, invoiceRes] = await Promise.all([
        supabase.from("leads").select("id,created_at,lead_status"),
        supabase.from("jobs").select("id,status"),
        supabase.from("clients").select("id"),
        supabase.from("invoices").select("id,status,total")
      ]);
      if (leadRes.data) setLeads(leadRes.data);
      if (jobRes.data) setJobs(jobRes.data);
      if (clientRes.data) setClients(clientRes.data);
      if (invoiceRes.data) setInvoices(invoiceRes.data);
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

  const queuedJobs = useMemo(() => {
    return jobs.filter((job) => job.status === "queued").length;
  }, [jobs]);

  const convertedLeads = useMemo(() => {
    return leads.filter((lead) => lead.lead_status === "converted").length;
  }, [leads]);

  const openInvoices = useMemo(() => {
    const activeStatuses = new Set(["draft", "sent", "overdue"]);
    return invoices.filter((invoice) => activeStatuses.has(invoice.status ?? "")).length;
  }, [invoices]);

  const paidRevenue = useMemo(() => {
    return invoices.reduce((total, invoice) => {
      if (invoice.status !== "paid") return total;
      return total + Number(invoice.total ?? 0);
    }, 0);
  }, [invoices]);

  const formatCurrency = useMemo(() => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    });
  }, []);

  const openBusinessAi = () => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("neatcurb_business_ai_open_v1", "1");
    window.dispatchEvent(new Event("neatcurb:business-ai-open"));
  };

  const bizInABoxFeatures = useMemo(
    () => [
      {
        title: "Fleet & Rig Management",
        description:
          "Track every truck, crew, and active route from one command layer.",
        metrics: [
          { label: "Active Jobs", value: `${activeJobs}` },
          { label: "Queued Jobs", value: `${queuedJobs}` }
        ],
        links: [
          { label: "Open Jobs", href: "/admin/jobs" },
          { label: "Open Work Orders", href: "/admin/work-orders" }
        ]
      },
      {
        title: "Instant Quoting",
        description:
          "Generate margin-aware quotes quickly with intake data and pricing logic.",
        metrics: [
          { label: "Live Leads", value: `${leads.length}` },
          { label: "Converted", value: `${convertedLeads}` }
        ],
        links: [
          { label: "Lead Intake", href: "/admin/lead-intake" },
          { label: "View Leads", href: "/admin/leads" }
        ]
      },
      {
        title: "Smart Scheduling",
        description:
          "Route crews faster using queued work, dispatch controls, and job status visibility.",
        metrics: [
          { label: "Total Jobs", value: `${jobs.length}` },
          { label: "In Progress", value: `${activeJobs}` }
        ],
        links: [
          { label: "Schedule Jobs", href: "/admin/jobs" },
          { label: "Dispatch Board", href: "/admin/work-orders" }
        ]
      },
      {
        title: "Customer & Lead CRM",
        description:
          "Manage the full lifecycle from first contact to repeat account relationships.",
        metrics: [
          { label: "Clients", value: `${clients.length}` },
          { label: "Lead Pipeline", value: `${leads.length}` }
        ],
        links: [
          { label: "Clients CRM", href: "/admin/clients" },
          { label: "Messages", href: "/admin/messages" }
        ]
      },
      {
        title: "Financial Visibility",
        description:
          "See open billing exposure and paid totals without leaving operations.",
        metrics: [
          { label: "Open Invoices", value: `${openInvoices}` },
          { label: "Paid Revenue", value: formatCurrency.format(paidRevenue) }
        ],
        links: [
          { label: "Invoices", href: "/admin/invoices" },
          { label: "Audit Trail", href: "/admin/audit" }
        ]
      },
      {
        title: "AI Assistant",
        description:
          "Use Business AI for follow-ups, operational checks, and quick admin navigation.",
        metrics: [
          { label: "Quick Actions", value: "7" },
          { label: "Mode", value: "Live" }
        ],
        links: [
          { label: "Open NeatCurbOS", href: "/admin/business-os" },
          { label: "System Settings", href: "/admin/settings" }
        ]
      }
    ],
    [
      activeJobs,
      clients.length,
      convertedLeads,
      formatCurrency,
      jobs.length,
      leads.length,
      openInvoices,
      paidRevenue,
      queuedJobs
    ]
  );

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

      <section className="panel bizbox-panel">
        <div className="bizbox-header">
          <span className="pill">ServiceOS Embedded</span>
          <div className="section-title">Run your service business without the chaos</div>
          <div className="section-sub">
            Quoting, scheduling, invoicing, fleet tracking, and AI in one admin
            dashboard.
          </div>
          <div className="bizbox-hero-actions">
            <Link href="/admin/lead-intake" className="button-primary">
              Start Quote Workflow
            </Link>
            <Link href="/admin/business-os" className="bizbox-link">
              Open NeatCurbOS
            </Link>
            <a
              href="/guides/NeatCurbOS-Operator-Walkthrough.pdf"
              className="bizbox-link"
              target="_blank"
              rel="noreferrer"
            >
              Open Operator Guide (PDF)
            </a>
            <button type="button" className="bizbox-ghost-button" onClick={openBusinessAi}>
              Open Business AI
            </button>
          </div>
        </div>

        <div className="bizbox-grid">
          {bizInABoxFeatures.map((feature) => (
            <article key={feature.title} className="bizbox-card">
              <div className="bizbox-card-title">{feature.title}</div>
              <p className="section-sub">{feature.description}</p>
              <div className="bizbox-metric-grid">
                {feature.metrics.map((metric) => (
                  <div key={`${feature.title}-${metric.label}`} className="bizbox-metric">
                    <span className="bizbox-metric-label">{metric.label}</span>
                    <strong>{metric.value}</strong>
                  </div>
                ))}
              </div>
              <div className="bizbox-actions">
                {feature.links.map((link) => (
                  <Link key={`${feature.title}-${link.href}`} href={link.href} className="bizbox-link">
                    {link.label}
                  </Link>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      {showOnboarding ? <OnboardingPanel /> : null}
    </div>
  );
}
