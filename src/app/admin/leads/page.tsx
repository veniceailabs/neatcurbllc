"use client";

import { useEffect, useMemo, useState } from "react";
import SectionHeader from "@/components/SectionHeader";
import { supabase } from "@/lib/supabaseClient";
import { useLanguage } from "@/components/language-context";
import { getCopy } from "@/lib/i18n";
import SearchBar from "@/components/ui/SearchBar";
import LeadEditModal, { type LeadRecord } from "@/components/admin/LeadEditModal";

export default function LeadsPage() {
  const { language } = useLanguage();
  const copy = getCopy(language);
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLead, setSelectedLead] = useState<LeadRecord | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("leads")
        .select(
          "id,name,phone,email,service,created_at,message,address,lead_status,estimated_low,estimated_high,pricing_meta"
        )
        .order("created_at", { ascending: false });
      if (data) setLeads(data);
    };
    load();
  }, []);

  const filteredLeads = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return leads;
    return leads.filter((lead) => {
      const haystack = [lead.name, lead.address, lead.service]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [leads, searchQuery]);

  const updateLead = async (draftLead: LeadRecord) => {
    const payload = {
      name: draftLead.name,
      phone: draftLead.phone,
      address: draftLead.address,
      lead_status: draftLead.lead_status,
      estimated_low: draftLead.estimated_low,
      estimated_high: draftLead.estimated_high
    };
    const { data, error } = await supabase
      .from("leads")
      .update(payload)
      .eq("id", draftLead.id)
      .select(
        "id,name,phone,email,service,created_at,message,address,lead_status,estimated_low,estimated_high,pricing_meta"
      )
      .single();

    if (error || !data) return;

    setLeads((prev) => prev.map((lead) => (lead.id === data.id ? data : lead)));
    setSelectedLead(data);
  };

  const archiveLead = async (draftLead: LeadRecord) => {
    const { data, error } = await supabase
      .from("leads")
      .update({ lead_status: "archived" })
      .eq("id", draftLead.id)
      .select(
        "id,name,phone,email,service,created_at,message,address,lead_status,estimated_low,estimated_high,pricing_meta"
      )
      .single();
    if (error || !data) return;
    setLeads((prev) => prev.map((lead) => (lead.id === data.id ? data : lead)));
    setSelectedLead(data);
  };

  const statusLabel = (status: LeadRecord["lead_status"]) => {
    if (status === "converted") return copy.admin.leads.statusConverted;
    if (status === "archived") return copy.admin.leads.statusArchived;
    if (status === "draft") return copy.admin.leads.statusContacted;
    return copy.admin.leads.statusNew;
  };

  return (
    <div className="panel">
      <SectionHeader
        title={copy.admin.leads.title}
        subtitle={copy.admin.leads.subtitle}
        action={<span className="pill">{filteredLeads.length} {copy.admin.leads.active}</span>}
      />
      <div style={{ marginTop: "14px" }}>
        <SearchBar
          value={searchQuery}
          placeholder={copy.admin.leads.searchPlaceholder}
          onChange={setSearchQuery}
        />
      </div>
      <div style={{ marginTop: "18px", display: "grid", gap: "12px" }}>
        {leads.length === 0 ? (
          <div className="kpi-card">
            <div style={{ fontWeight: 700 }}>{copy.admin.leads.emptyTitle}</div>
            <div className="note">{copy.admin.leads.emptyBody}</div>
            <a className="button-primary" href="/admin/lead-intake" style={{ marginTop: "10px" }}>
              {copy.admin.leads.manualLead}
            </a>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="kpi-card">
            <div style={{ fontWeight: 700 }}>{copy.admin.leads.noResults}</div>
            <div className="note">{copy.admin.leads.noResultsBody}</div>
          </div>
        ) : (
          filteredLeads.map((lead) => (
            <button
              key={lead.id}
              type="button"
              className="kpi-card lead-card-button"
              onClick={() => setSelectedLead(lead)}
            >
              <div style={{ fontWeight: 700 }}>{lead.name}</div>
              <div className="note">
                {copy.admin.leads.service}: {lead.service || "--"}
              </div>
              {lead.pricing_meta?.serviceDetail ? (
                <div className="note">
                  {copy.admin.leads.detail}: {lead.pricing_meta.serviceDetail}
                </div>
              ) : null}
              <div className="note">
                {copy.admin.leads.address}: {lead.address || "--"}
              </div>
              <div className="note">
                {copy.admin.leads.phone}: {lead.phone || "--"}
              </div>
              <div className="note">
                {copy.admin.leads.status}: {statusLabel(lead.lead_status)}
              </div>
              {lead.estimated_low !== null ? (
                <div className="note">
                  {copy.admin.leads.estimate}: ${lead.estimated_low}
                  {lead.estimated_high && lead.estimated_high !== lead.estimated_low
                    ? ` - $${lead.estimated_high}`
                    : ""}
                </div>
              ) : null}
              <div className="note">
                {copy.admin.leads.message}: {lead.message || "--"}
              </div>
            </button>
          ))
        )}
      </div>
      {selectedLead ? (
        <LeadEditModal
          open
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onSave={updateLead}
          onArchive={archiveLead}
          labels={{
            title: copy.admin.leads.editLead,
            name: copy.quote.name,
            phone: copy.admin.leads.phone,
            address: copy.admin.leads.address,
            service: copy.admin.leads.service,
            detail: copy.admin.leads.detail,
            status: copy.admin.leads.status,
            estimate: copy.admin.leads.estimate,
            message: copy.admin.leads.message,
            save: copy.admin.common.save,
            cancel: copy.admin.common.cancel,
            archive: copy.admin.common.archive,
            call: copy.admin.common.call,
            email: copy.admin.common.email,
            statusNew: copy.admin.leads.statusNew,
            statusContacted: copy.admin.leads.statusContacted,
            statusConverted: copy.admin.leads.statusConverted,
            statusArchived: copy.admin.leads.statusArchived
          }}
        />
      ) : null}
    </div>
  );
}
