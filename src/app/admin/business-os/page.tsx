"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import SectionHeader from "@/components/SectionHeader";
import KpiCard from "@/components/KpiCard";
import { supabase } from "@/lib/supabaseClient";

type Product = {
  id: string;
  name: string | null;
  description: string | null;
  unit_price: number | null;
  category: string | null;
  active: boolean | null;
  created_at: string | null;
};

type Estimate = {
  id: string;
  lead_id: string | null;
  client_id: string | null;
  status: string | null;
  total_low: number | null;
  total_high: number | null;
  created_at: string | null;
};

type EstimateItem = {
  id: string;
  estimate_id: string | null;
  description: string | null;
  quantity: number | null;
  unit_price: number | null;
  line_total: number | null;
};

type Route = {
  id: string;
  name: string | null;
  route_date: string | null;
  status: string | null;
  created_at: string | null;
};

type RouteStop = {
  id: string;
  route_id: string | null;
  job_id: string | null;
  stop_order: number | null;
  notes: string | null;
};

type Program = {
  id: string;
  name: string | null;
  description: string | null;
  interval: string | null;
  active: boolean | null;
  created_at: string | null;
};

type ProgramStep = {
  id: string;
  program_id: string | null;
  step_order: number | null;
  title: string | null;
  notes: string | null;
};

type Reminder = {
  id: string;
  reminder_type: string | null;
  target_id: string | null;
  scheduled_for: string | null;
  status: string | null;
  created_at: string | null;
};

type LeadLite = { id: string; name: string | null };
type ClientLite = { id: string; name: string | null };
type JobLite = { id: string; service: string | null; status: string | null };

type ProductForm = {
  name: string;
  category: string;
  unitPrice: string;
  description: string;
};

type QuoteForm = {
  leadId: string;
  clientId: string;
  status: string;
  itemDescription: string;
  quantity: string;
  unitPrice: string;
};

type RouteForm = {
  name: string;
  routeDate: string;
  status: string;
  jobId: string;
  notes: string;
};

type ProgramForm = {
  name: string;
  description: string;
  interval: string;
  stepTitle: string;
  stepNotes: string;
};

type ReminderForm = {
  reminderType: string;
  targetId: string;
  scheduledFor: string;
  status: string;
};

const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2
});

const shortDateTime = (value: string | null) => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

export default function BusinessOsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [estimateItems, setEstimateItems] = useState<EstimateItem[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [routeStops, setRouteStops] = useState<RouteStop[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [programSteps, setProgramSteps] = useState<ProgramStep[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [leads, setLeads] = useState<LeadLite[]>([]);
  const [clients, setClients] = useState<ClientLite[]>([]);
  const [jobs, setJobs] = useState<JobLite[]>([]);

  const [productForm, setProductForm] = useState<ProductForm>({
    name: "",
    category: "Snow Removal",
    unitPrice: "",
    description: ""
  });
  const [quoteForm, setQuoteForm] = useState<QuoteForm>({
    leadId: "",
    clientId: "",
    status: "draft",
    itemDescription: "",
    quantity: "1",
    unitPrice: ""
  });
  const [routeForm, setRouteForm] = useState<RouteForm>({
    name: "",
    routeDate: new Date().toISOString().slice(0, 10),
    status: "draft",
    jobId: "",
    notes: ""
  });
  const [programForm, setProgramForm] = useState<ProgramForm>({
    name: "",
    description: "",
    interval: "weekly",
    stepTitle: "",
    stepNotes: ""
  });
  const [reminderForm, setReminderForm] = useState<ReminderForm>({
    reminderType: "lead_follow_up",
    targetId: "",
    scheduledFor: "",
    status: "pending"
  });

  const itemsByEstimate = useMemo(() => {
    const map = new Map<string, EstimateItem[]>();
    estimateItems.forEach((item) => {
      if (!item.estimate_id) return;
      const list = map.get(item.estimate_id) ?? [];
      list.push(item);
      map.set(item.estimate_id, list);
    });
    return map;
  }, [estimateItems]);

  const stopsByRoute = useMemo(() => {
    const map = new Map<string, RouteStop[]>();
    routeStops.forEach((stop) => {
      if (!stop.route_id) return;
      const list = map.get(stop.route_id) ?? [];
      list.push(stop);
      map.set(stop.route_id, list);
    });
    return map;
  }, [routeStops]);

  const stepsByProgram = useMemo(() => {
    const map = new Map<string, ProgramStep[]>();
    programSteps.forEach((step) => {
      if (!step.program_id) return;
      const list = map.get(step.program_id) ?? [];
      list.push(step);
      map.set(step.program_id, list);
    });
    return map;
  }, [programSteps]);

  const leadMap = useMemo(() => {
    return new Map(leads.map((lead) => [lead.id, lead.name || "Unnamed lead"]));
  }, [leads]);

  const clientMap = useMemo(() => {
    return new Map(
      clients.map((client) => [client.id, client.name || "Unnamed client"])
    );
  }, [clients]);

  const jobMap = useMemo(() => {
    return new Map(
      jobs.map((job) => [job.id, job.service || `Job ${job.id.slice(0, 6)}`])
    );
  }, [jobs]);

  const activeProducts = useMemo(
    () => products.filter((product) => product.active !== false).length,
    [products]
  );

  const openReminders = useMemo(
    () =>
      reminders.filter((reminder) =>
        ["pending", "queued", "scheduled"].includes((reminder.status || "").toLowerCase())
      ).length,
    [reminders]
  );

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    const [
      productsRes,
      estimatesRes,
      estimateItemsRes,
      routesRes,
      routeStopsRes,
      programsRes,
      programStepsRes,
      remindersRes,
      leadsRes,
      clientsRes,
      jobsRes
    ] = await Promise.all([
      supabase
        .from("products")
        .select("id,name,description,unit_price,category,active,created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("estimates")
        .select("id,lead_id,client_id,status,total_low,total_high,created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("estimate_items")
        .select("id,estimate_id,description,quantity,unit_price,line_total"),
      supabase
        .from("routes")
        .select("id,name,route_date,status,created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("route_stops")
        .select("id,route_id,job_id,stop_order,notes")
        .order("stop_order", { ascending: true }),
      supabase
        .from("programs")
        .select("id,name,description,interval,active,created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("program_steps")
        .select("id,program_id,step_order,title,notes")
        .order("step_order", { ascending: true }),
      supabase
        .from("reminders")
        .select("id,reminder_type,target_id,scheduled_for,status,created_at")
        .order("scheduled_for", { ascending: true }),
      supabase.from("leads").select("id,name").order("created_at", { ascending: false }),
      supabase
        .from("clients")
        .select("id,name")
        .order("created_at", { ascending: false }),
      supabase
        .from("jobs")
        .select("id,service,status")
        .order("created_at", { ascending: false })
    ]);

    setProducts((productsRes.data as Product[]) || []);
    setEstimates((estimatesRes.data as Estimate[]) || []);
    setEstimateItems((estimateItemsRes.data as EstimateItem[]) || []);
    setRoutes((routesRes.data as Route[]) || []);
    setRouteStops((routeStopsRes.data as RouteStop[]) || []);
    setPrograms((programsRes.data as Program[]) || []);
    setProgramSteps((programStepsRes.data as ProgramStep[]) || []);
    setReminders((remindersRes.data as Reminder[]) || []);
    setLeads((leadsRes.data as LeadLite[]) || []);
    setClients((clientsRes.data as ClientLite[]) || []);
    setJobs((jobsRes.data as JobLite[]) || []);

    const errors = [
      productsRes.error,
      estimatesRes.error,
      estimateItemsRes.error,
      routesRes.error,
      routeStopsRes.error,
      programsRes.error,
      programStepsRes.error,
      remindersRes.error,
      leadsRes.error,
      clientsRes.error,
      jobsRes.error
    ].filter(Boolean);
    if (errors.length > 0) {
      setError(
        "Some NeatCurbOS data could not load yet. Core navigation still works. If this persists, use Owner Account Rescue on login."
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setSuccessNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2200);
  };

  const onCreateProduct = async (event: FormEvent) => {
    event.preventDefault();
    const name = productForm.name.trim();
    const unitPrice = Number(productForm.unitPrice);
    if (!name || Number.isNaN(unitPrice)) {
      setError("Template name and unit price are required.");
      return;
    }

    const { error: insertError } = await supabase.from("products").insert({
      name,
      category: productForm.category || null,
      description: productForm.description || null,
      unit_price: unitPrice,
      active: true
    });
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setProductForm({ name: "", category: "Snow Removal", unitPrice: "", description: "" });
    setSuccessNotice("Service template created.");
    await loadAll();
  };

  const onToggleProduct = async (product: Product) => {
    const { error: updateError } = await supabase
      .from("products")
      .update({ active: product.active === false })
      .eq("id", product.id);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setSuccessNotice("Template status updated.");
    await loadAll();
  };

  const onCreateEstimate = async (event: FormEvent) => {
    event.preventDefault();
    const quantity = Number(quoteForm.quantity);
    const unitPrice = Number(quoteForm.unitPrice);
    const description = quoteForm.itemDescription.trim();
    if (!description || Number.isNaN(quantity) || Number.isNaN(unitPrice)) {
      setError("Quote package requires item description, quantity, and unit price.");
      return;
    }
    const lineTotal = quantity * unitPrice;

    const { data: estimateData, error: estimateError } = await supabase
      .from("estimates")
      .insert({
        lead_id: quoteForm.leadId || null,
        client_id: quoteForm.clientId || null,
        status: quoteForm.status,
        total_low: lineTotal,
        total_high: lineTotal
      })
      .select("id")
      .single();

    if (estimateError || !estimateData?.id) {
      setError(estimateError?.message || "Unable to create estimate.");
      return;
    }

    const { error: itemError } = await supabase.from("estimate_items").insert({
      estimate_id: estimateData.id,
      description,
      quantity,
      unit_price: unitPrice,
      line_total: lineTotal
    });

    if (itemError) {
      setError(itemError.message);
      return;
    }

    setQuoteForm({
      leadId: "",
      clientId: "",
      status: "draft",
      itemDescription: "",
      quantity: "1",
      unitPrice: ""
    });
    setSuccessNotice("Quote package created.");
    await loadAll();
  };

  const onCreateRoute = async (event: FormEvent) => {
    event.preventDefault();
    const routeName = routeForm.name.trim();
    if (!routeName || !routeForm.routeDate) {
      setError("Route name and route date are required.");
      return;
    }

    const { data: routeData, error: routeError } = await supabase
      .from("routes")
      .insert({
        name: routeName,
        route_date: routeForm.routeDate,
        status: routeForm.status
      })
      .select("id")
      .single();
    if (routeError || !routeData?.id) {
      setError(routeError?.message || "Unable to create route.");
      return;
    }

    if (routeForm.jobId) {
      const { error: stopError } = await supabase.from("route_stops").insert({
        route_id: routeData.id,
        job_id: routeForm.jobId,
        stop_order: 1,
        notes: routeForm.notes || null
      });
      if (stopError) {
        setError(stopError.message);
        return;
      }
    }

    setRouteForm({
      name: "",
      routeDate: new Date().toISOString().slice(0, 10),
      status: "draft",
      jobId: "",
      notes: ""
    });
    setSuccessNotice("Route plan created.");
    await loadAll();
  };

  const onCreateProgram = async (event: FormEvent) => {
    event.preventDefault();
    const name = programForm.name.trim();
    const stepTitle = programForm.stepTitle.trim();
    if (!name || !stepTitle) {
      setError("Program name and first step title are required.");
      return;
    }

    const { data: programData, error: programError } = await supabase
      .from("programs")
      .insert({
        name,
        description: programForm.description || null,
        interval: programForm.interval,
        active: true
      })
      .select("id")
      .single();
    if (programError || !programData?.id) {
      setError(programError?.message || "Unable to create program.");
      return;
    }

    const { error: stepError } = await supabase.from("program_steps").insert({
      program_id: programData.id,
      step_order: 1,
      title: stepTitle,
      notes: programForm.stepNotes || null
    });
    if (stepError) {
      setError(stepError.message);
      return;
    }

    setProgramForm({
      name: "",
      description: "",
      interval: "weekly",
      stepTitle: "",
      stepNotes: ""
    });
    setSuccessNotice("Automation program created.");
    await loadAll();
  };

  const onToggleProgram = async (program: Program) => {
    const { error: updateError } = await supabase
      .from("programs")
      .update({ active: program.active === false })
      .eq("id", program.id);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setSuccessNotice("Program status updated.");
    await loadAll();
  };

  const onCreateReminder = async (event: FormEvent) => {
    event.preventDefault();
    if (!reminderForm.reminderType || !reminderForm.scheduledFor) {
      setError("Reminder type and schedule time are required.");
      return;
    }

    const { error: insertError } = await supabase.from("reminders").insert({
      reminder_type: reminderForm.reminderType,
      target_id: reminderForm.targetId || null,
      scheduled_for: new Date(reminderForm.scheduledFor).toISOString(),
      status: reminderForm.status
    });
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setReminderForm({
      reminderType: "lead_follow_up",
      targetId: "",
      scheduledFor: "",
      status: "pending"
    });
    setSuccessNotice("Reminder scheduled.");
    await loadAll();
  };

  const onCompleteReminder = async (reminder: Reminder) => {
    const { error: updateError } = await supabase
      .from("reminders")
      .update({ status: "complete" })
      .eq("id", reminder.id);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setSuccessNotice("Reminder marked complete.");
    await loadAll();
  };

  const workspaceShortcuts = [
    { label: "Leads", href: "/admin/leads", desc: "Review new requests and follow up." },
    { label: "Clients", href: "/admin/clients", desc: "See active customers and service history." },
    { label: "Jobs", href: "/admin/jobs", desc: "Track queued, in-progress, and completed jobs." },
    { label: "Invoices", href: "/admin/invoices", desc: "Check sent, open, and paid invoices." },
    { label: "Messages", href: "/admin/messages", desc: "Send updates by text or email." },
    { label: "Operator Guide PDF", href: "/guides/NeatCurbOS-Operator-Walkthrough.pdf", desc: "Open the step-by-step walkthrough for the team." },
    { label: "Dashboard", href: "/admin", desc: "Back to KPI overview and Biz-in-a-Box panel." }
  ];

  return (
    <div className="panel">
      <SectionHeader
        title="NeatCurbOS"
        subtitle="Everything in one place for quotes, routes, automations, and reminders. Start with Shortcuts, then use the 5 setup blocks below."
        action={<span className="pill">Live Modules: 5</span>}
      />

      <div className="kpi-grid" style={{ marginTop: "16px" }}>
        <KpiCard label="Templates" value={`${products.length}`} trend={`${activeProducts} active`} />
        <KpiCard label="Quote Packages" value={`${estimates.length}`} trend={`${estimateItems.length} items`} />
        <KpiCard label="Routes" value={`${routes.length}`} trend={`${routeStops.length} planned stops`} />
        <KpiCard label="Programs" value={`${programs.length}`} trend={`${programSteps.length} workflow steps`} />
        <KpiCard label="Reminders" value={`${reminders.length}`} trend={`${openReminders} open`} />
      </div>

      {loading ? <div className="note" style={{ marginTop: "10px" }}>Loading NeatCurbOS data...</div> : null}
      {error ? <div className="note" style={{ marginTop: "10px" }}>{error}</div> : null}
      {notice ? <div className="note" style={{ marginTop: "10px" }}>{notice}</div> : null}

      <div style={{ marginTop: "16px", display: "grid", gap: "14px" }}>
        <section className="kpi-card">
          <div className="section-title">Quick Shortcuts (Daily Use)</div>
          <div className="section-sub">
            Use these first if you are moving fast during the day.
          </div>
          <div
            style={{
              marginTop: "10px",
              display: "grid",
              gap: "10px",
              gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))"
            }}
          >
            {workspaceShortcuts.map((shortcut) => (
              <Link
                key={shortcut.href}
                href={shortcut.href}
                className="panel"
                style={{ padding: "12px", textDecoration: "none" }}
                target={shortcut.href.startsWith("/guides/") ? "_blank" : undefined}
                rel={shortcut.href.startsWith("/guides/") ? "noreferrer" : undefined}
              >
                <div style={{ fontWeight: 800 }}>{shortcut.label}</div>
                <div className="note" style={{ marginTop: "4px" }}>{shortcut.desc}</div>
              </Link>
            ))}
          </div>
        </section>

        <section className="kpi-card">
          <div className="section-title">1) Services & Prices</div>
          <div className="section-sub">Save your common services so quoting is faster.</div>
          <form onSubmit={onCreateProduct} style={{ marginTop: "10px", display: "grid", gap: "10px", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
            <label className="form-field">
              Service Name
              <input value={productForm.name} onChange={(event) => setProductForm((prev) => ({ ...prev, name: event.target.value }))} placeholder="Driveway Snow - Medium" />
            </label>
            <label className="form-field">
              Category
              <input value={productForm.category} onChange={(event) => setProductForm((prev) => ({ ...prev, category: event.target.value }))} placeholder="Snow Removal" />
            </label>
            <label className="form-field">
              Unit Price
              <input value={productForm.unitPrice} onChange={(event) => setProductForm((prev) => ({ ...prev, unitPrice: event.target.value }))} placeholder="85" />
            </label>
            <label className="form-field">
              Notes
              <input value={productForm.description} onChange={(event) => setProductForm((prev) => ({ ...prev, description: event.target.value }))} placeholder="Standard 2-3 inch trigger service" />
            </label>
            <div style={{ display: "flex", alignItems: "end" }}>
              <button className="button-primary" type="submit">Save Service</button>
            </div>
          </form>

          <div style={{ marginTop: "12px", display: "grid", gap: "8px" }}>
            {products.slice(0, 8).map((product) => (
              <div key={product.id} className="panel" style={{ padding: "12px", display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{product.name || "Untitled service"}</div>
                  <div className="note">
                    {(product.category || "General")} · {moneyFormatter.format(Number(product.unit_price || 0))}
                  </div>
                </div>
                <button className="btn-secondary" type="button" onClick={() => onToggleProduct(product)}>
                  {product.active === false ? "Activate" : "Pause"}
                </button>
              </div>
            ))}
            {products.length === 0 ? <div className="note">No templates yet.</div> : null}
          </div>
        </section>

        <section className="kpi-card">
          <div className="section-title">2) Quote Builder</div>
          <div className="section-sub">Create a customer quote package from one screen.</div>
          <form onSubmit={onCreateEstimate} style={{ marginTop: "10px", display: "grid", gap: "10px", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
            <label className="form-field">
              Lead
              <select value={quoteForm.leadId} onChange={(event) => setQuoteForm((prev) => ({ ...prev, leadId: event.target.value }))}>
                <option value="">No lead</option>
                {leads.map((lead) => (
                  <option key={lead.id} value={lead.id}>{lead.name || lead.id.slice(0, 8)}</option>
                ))}
              </select>
            </label>
            <label className="form-field">
              Client
              <select value={quoteForm.clientId} onChange={(event) => setQuoteForm((prev) => ({ ...prev, clientId: event.target.value }))}>
                <option value="">No client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>{client.name || client.id.slice(0, 8)}</option>
                ))}
              </select>
            </label>
            <label className="form-field">
              Status
              <select value={quoteForm.status} onChange={(event) => setQuoteForm((prev) => ({ ...prev, status: event.target.value }))}>
                <option value="draft">draft</option>
                <option value="sent">sent</option>
                <option value="approved">approved</option>
              </select>
            </label>
            <label className="form-field">
              Service Item
              <input value={quoteForm.itemDescription} onChange={(event) => setQuoteForm((prev) => ({ ...prev, itemDescription: event.target.value }))} placeholder="Seasonal snow package" />
            </label>
            <label className="form-field">
              Qty
              <input value={quoteForm.quantity} onChange={(event) => setQuoteForm((prev) => ({ ...prev, quantity: event.target.value }))} placeholder="1" />
            </label>
            <label className="form-field">
              Unit Price
              <input value={quoteForm.unitPrice} onChange={(event) => setQuoteForm((prev) => ({ ...prev, unitPrice: event.target.value }))} placeholder="1200" />
            </label>
            <div style={{ display: "flex", alignItems: "end" }}>
              <button className="button-primary" type="submit">Create Quote</button>
            </div>
          </form>
          <div style={{ marginTop: "12px", display: "grid", gap: "8px" }}>
            {estimates.slice(0, 8).map((estimate) => {
              const packageItems = itemsByEstimate.get(estimate.id) ?? [];
              return (
                <div key={estimate.id} className="panel" style={{ padding: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
                    <div style={{ fontWeight: 700 }}>Package {estimate.id.slice(0, 8)}</div>
                    <div className="pill">{estimate.status || "draft"}</div>
                  </div>
                  <div className="note" style={{ marginTop: "6px" }}>
                    Lead: {estimate.lead_id ? leadMap.get(estimate.lead_id) || estimate.lead_id.slice(0, 8) : "--"} · Client: {estimate.client_id ? clientMap.get(estimate.client_id) || estimate.client_id.slice(0, 8) : "--"}
                  </div>
                  <div className="note">
                    Total: {moneyFormatter.format(Number(estimate.total_high || estimate.total_low || 0))} · Items: {packageItems.length}
                  </div>
                </div>
              );
            })}
            {estimates.length === 0 ? <div className="note">No quote packages yet.</div> : null}
          </div>
        </section>

        <section className="kpi-card">
          <div className="section-title">3) Route Planner</div>
          <div className="section-sub">Plan today’s crew route and optional first stop.</div>
          <form onSubmit={onCreateRoute} style={{ marginTop: "10px", display: "grid", gap: "10px", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
            <label className="form-field">
              Route Name
              <input value={routeForm.name} onChange={(event) => setRouteForm((prev) => ({ ...prev, name: event.target.value }))} placeholder="North Zone Snow Route" />
            </label>
            <label className="form-field">
              Date
              <input type="date" value={routeForm.routeDate} onChange={(event) => setRouteForm((prev) => ({ ...prev, routeDate: event.target.value }))} />
            </label>
            <label className="form-field">
              Status
              <select value={routeForm.status} onChange={(event) => setRouteForm((prev) => ({ ...prev, status: event.target.value }))}>
                <option value="draft">draft</option>
                <option value="ready">ready</option>
                <option value="active">active</option>
              </select>
            </label>
            <label className="form-field">
              First Job Stop
              <select value={routeForm.jobId} onChange={(event) => setRouteForm((prev) => ({ ...prev, jobId: event.target.value }))}>
                <option value="">No stop</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>{(job.service || "Job")} · {job.status || "queued"}</option>
                ))}
              </select>
            </label>
            <label className="form-field">
              Stop Notes
              <input value={routeForm.notes} onChange={(event) => setRouteForm((prev) => ({ ...prev, notes: event.target.value }))} placeholder="Priority hospital entry first" />
            </label>
            <div style={{ display: "flex", alignItems: "end" }}>
              <button className="button-primary" type="submit">Save Route</button>
            </div>
          </form>

          <div style={{ marginTop: "12px", display: "grid", gap: "8px" }}>
            {routes.slice(0, 8).map((route) => {
              const stops = stopsByRoute.get(route.id) ?? [];
              return (
                <div key={route.id} className="panel" style={{ padding: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
                    <div style={{ fontWeight: 700 }}>{route.name || "Unnamed route"}</div>
                    <div className="pill">{route.status || "draft"}</div>
                  </div>
                  <div className="note">
                    Date: {route.route_date || "--"} · Stops: {stops.length}
                  </div>
                  {stops.slice(0, 1).map((stop) => (
                    <div key={stop.id} className="note">
                      First stop: {stop.job_id ? jobMap.get(stop.job_id) || stop.job_id.slice(0, 8) : "--"}
                    </div>
                  ))}
                </div>
              );
            })}
            {routes.length === 0 ? <div className="note">No routes yet.</div> : null}
          </div>
        </section>

        <section className="kpi-card">
          <div className="section-title">4) Repeating Workflows</div>
          <div className="section-sub">Set repeatable operational checklists for your team.</div>
          <form onSubmit={onCreateProgram} style={{ marginTop: "10px", display: "grid", gap: "10px", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
            <label className="form-field">
              Program Name
              <input value={programForm.name} onChange={(event) => setProgramForm((prev) => ({ ...prev, name: event.target.value }))} placeholder="Storm Follow-up System" />
            </label>
            <label className="form-field">
              Interval
              <select value={programForm.interval} onChange={(event) => setProgramForm((prev) => ({ ...prev, interval: event.target.value }))}>
                <option value="daily">daily</option>
                <option value="weekly">weekly</option>
                <option value="monthly">monthly</option>
                <option value="event-driven">event-driven</option>
              </select>
            </label>
            <label className="form-field">
              Description
              <input value={programForm.description} onChange={(event) => setProgramForm((prev) => ({ ...prev, description: event.target.value }))} placeholder="Workflow for post-storm outreach and billing." />
            </label>
            <label className="form-field">
              First Step
              <input value={programForm.stepTitle} onChange={(event) => setProgramForm((prev) => ({ ...prev, stepTitle: event.target.value }))} placeholder="Send completion message" />
            </label>
            <label className="form-field">
              Step Notes
              <input value={programForm.stepNotes} onChange={(event) => setProgramForm((prev) => ({ ...prev, stepNotes: event.target.value }))} placeholder="Include proof photo link and invoice reminder." />
            </label>
            <div style={{ display: "flex", alignItems: "end" }}>
              <button className="button-primary" type="submit">Save Workflow</button>
            </div>
          </form>

          <div style={{ marginTop: "12px", display: "grid", gap: "8px" }}>
            {programs.slice(0, 8).map((program) => {
              const steps = stepsByProgram.get(program.id) ?? [];
              return (
                <div key={program.id} className="panel" style={{ padding: "12px", display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{program.name || "Untitled program"}</div>
                    <div className="note">
                      Interval: {program.interval || "--"} · Steps: {steps.length}
                    </div>
                  </div>
                  <button className="btn-secondary" type="button" onClick={() => onToggleProgram(program)}>
                    {program.active === false ? "Activate" : "Pause"}
                  </button>
                </div>
              );
            })}
            {programs.length === 0 ? <div className="note">No automation programs yet.</div> : null}
          </div>
        </section>

        <section className="kpi-card">
          <div className="section-title">5) Follow-Up Reminders</div>
          <div className="section-sub">Never miss callbacks, billing reminders, or route checks.</div>
          <form onSubmit={onCreateReminder} style={{ marginTop: "10px", display: "grid", gap: "10px", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
            <label className="form-field">
              Reminder Type
              <select value={reminderForm.reminderType} onChange={(event) => setReminderForm((prev) => ({ ...prev, reminderType: event.target.value }))}>
                <option value="lead_follow_up">lead_follow_up</option>
                <option value="invoice_follow_up">invoice_follow_up</option>
                <option value="route_check">route_check</option>
                <option value="program_step">program_step</option>
              </select>
            </label>
            <label className="form-field">
              Target ID
              <select value={reminderForm.targetId} onChange={(event) => setReminderForm((prev) => ({ ...prev, targetId: event.target.value }))}>
                <option value="">No target</option>
                {leads.slice(0, 10).map((lead) => (
                  <option key={`lead-${lead.id}`} value={lead.id}>Lead · {lead.name || lead.id.slice(0, 8)}</option>
                ))}
                {clients.slice(0, 10).map((client) => (
                  <option key={`client-${client.id}`} value={client.id}>Client · {client.name || client.id.slice(0, 8)}</option>
                ))}
                {jobs.slice(0, 10).map((job) => (
                  <option key={`job-${job.id}`} value={job.id}>Job · {(job.service || job.id.slice(0, 8))}</option>
                ))}
              </select>
            </label>
            <label className="form-field">
              Scheduled For
              <input type="datetime-local" value={reminderForm.scheduledFor} onChange={(event) => setReminderForm((prev) => ({ ...prev, scheduledFor: event.target.value }))} />
            </label>
            <label className="form-field">
              Status
              <select value={reminderForm.status} onChange={(event) => setReminderForm((prev) => ({ ...prev, status: event.target.value }))}>
                <option value="pending">pending</option>
                <option value="queued">queued</option>
                <option value="scheduled">scheduled</option>
              </select>
            </label>
            <div style={{ display: "flex", alignItems: "end" }}>
              <button className="button-primary" type="submit">Schedule Reminder</button>
            </div>
          </form>

          <div style={{ marginTop: "12px", display: "grid", gap: "8px" }}>
            {reminders.slice(0, 10).map((reminder) => (
              <div key={reminder.id} className="panel" style={{ padding: "12px", display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{reminder.reminder_type || "reminder"}</div>
                  <div className="note">
                    {shortDateTime(reminder.scheduled_for)} · Status: {reminder.status || "--"}
                  </div>
                </div>
                <button className="btn-secondary" type="button" onClick={() => onCompleteReminder(reminder)} disabled={(reminder.status || "").toLowerCase() === "complete"}>
                  Mark Complete
                </button>
              </div>
            ))}
            {reminders.length === 0 ? <div className="note">No reminders yet.</div> : null}
          </div>
        </section>
      </div>
    </div>
  );
}
