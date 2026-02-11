"use client";

import { useEffect, useMemo, useState } from "react";

type LeadStatus = "new" | "draft" | "converted" | "archived";

export type LeadRecord = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  service: string | null;
  created_at: string;
  message: string | null;
  address: string | null;
  lead_status: LeadStatus | null;
  estimated_low: number | null;
  estimated_high: number | null;
  pricing_meta: {
    serviceDetail?: string | null;
  } | null;
};

type LeadEditModalProps = {
  lead: LeadRecord;
  open: boolean;
  labels: {
    title: string;
    name: string;
    phone: string;
    address: string;
    service: string;
    detail: string;
    status: string;
    estimate: string;
    message: string;
    save: string;
    cancel: string;
    archive: string;
    call: string;
    email: string;
    statusNew: string;
    statusContacted: string;
    statusConverted: string;
    statusArchived: string;
  };
  onClose: () => void;
  onSave: (lead: LeadRecord) => Promise<void>;
  onArchive: (lead: LeadRecord) => Promise<void>;
};

export default function LeadEditModal({
  lead,
  open,
  labels,
  onClose,
  onSave,
  onArchive
}: LeadEditModalProps) {
  const [draft, setDraft] = useState<LeadRecord>(lead);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft(lead);
  }, [lead]);

  const statusOptions = useMemo(
    () => [
      { value: "new", label: labels.statusNew },
      { value: "draft", label: labels.statusContacted },
      { value: "converted", label: labels.statusConverted },
      { value: "archived", label: labels.statusArchived }
    ],
    [labels]
  );

  const handleSave = async () => {
    setSaving(true);
    await onSave(draft);
    setSaving(false);
  };

  const handleArchive = async () => {
    setSaving(true);
    await onArchive(draft);
    setSaving(false);
  };

  if (!open) return null;

  return (
    <div className="lead-modal-backdrop" onClick={onClose}>
      <aside className="lead-modal" onClick={(event) => event.stopPropagation()}>
        <div className="lead-modal-header">
          <h3>{labels.title}</h3>
          <button type="button" className="btn-secondary" onClick={onClose}>
            {labels.cancel}
          </button>
        </div>

        <div className="lead-modal-grid">
          <label className="form-field">
            {labels.name}
            <input
              value={draft.name}
              onChange={(event) => setDraft({ ...draft, name: event.target.value })}
            />
          </label>
          <label className="form-field">
            {labels.phone}
            <input
              value={draft.phone ?? ""}
              onChange={(event) => setDraft({ ...draft, phone: event.target.value })}
            />
          </label>
          <label className="form-field lead-modal-full">
            {labels.address}
            <input
              value={draft.address ?? ""}
              onChange={(event) => setDraft({ ...draft, address: event.target.value })}
            />
          </label>
          <label className="form-field">
            {labels.status}
            <select
              value={draft.lead_status ?? "new"}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  lead_status: event.target.value as LeadStatus
                })
              }
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            {labels.estimate} (Low)
            <input
              type="number"
              value={draft.estimated_low ?? ""}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  estimated_low: event.target.value ? Number(event.target.value) : null
                })
              }
            />
          </label>
          <label className="form-field">
            {labels.estimate} (High)
            <input
              type="number"
              value={draft.estimated_high ?? ""}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  estimated_high: event.target.value ? Number(event.target.value) : null
                })
              }
            />
          </label>
          <div className="kpi-card lead-modal-full">
            <div className="note">
              {labels.service}: {draft.service || "--"}
            </div>
            {draft.pricing_meta?.serviceDetail ? (
              <div className="note">
                {labels.detail}: {draft.pricing_meta.serviceDetail}
              </div>
            ) : null}
            <div className="note">
              {labels.message}: {draft.message || "--"}
            </div>
          </div>
        </div>

        <div className="lead-modal-actions">
          <a className="btn-secondary" href={draft.phone ? `tel:${draft.phone}` : "#"}>
            {labels.call}
          </a>
          <a className="btn-secondary" href={draft.email ? `mailto:${draft.email}` : "#"}>
            {labels.email}
          </a>
          <button className="btn-secondary" type="button" disabled={saving} onClick={handleArchive}>
            {labels.archive}
          </button>
          <button className="button-primary" type="button" disabled={saving} onClick={handleSave}>
            {labels.save}
          </button>
        </div>
      </aside>
    </div>
  );
}
