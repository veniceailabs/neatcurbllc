"use client";

import { useState } from "react";
import { TEMPLATES, Template } from "@/lib/document-templates";
import { supabase } from "@/lib/supabaseClient";

type Signer = { name: string; email: string };

type Props = {
  onCreated: () => void;
  onCancel: () => void;
};

const STEPS = ["Choose Template", "Fill Details", "Preview", "Signers"] as const;

export default function DocumentCreator({ onCreated, onCancel }: Props) {
  const [step, setStep]         = useState(0);
  const [template, setTemplate] = useState<Template | null>(null);
  const [fields, setFields]     = useState<Record<string, string>>({});
  const [title, setTitle]       = useState("");
  const [signers, setSigners]   = useState<Signer[]>([{ name: "", email: "" }]);
  const [busy, setBusy]         = useState(false);
  const [err, setErr]           = useState("");

  const setField = (key: string, val: string) => setFields((f) => ({ ...f, [key]: val }));

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const addSigner    = () => setSigners((s) => [...s, { name: "", email: "" }]);
  const removeSigner = (i: number) => setSigners((s) => s.filter((_, idx) => idx !== i));
  const setSigner    = (i: number, key: keyof Signer, val: string) =>
    setSigners((s) => s.map((sg, idx) => idx === i ? { ...sg, [key]: val } : sg));

  const canAdvance = () => {
    if (step === 0) return Boolean(template);
    if (step === 1) {
      const req = template?.fields.filter((f) => f.required) ?? [];
      return req.every((f) => fields[f.key]?.trim());
    }
    if (step === 2) return Boolean(title.trim());
    return true;
  };

  const submit = async () => {
    if (!template) return;
    setErr("");
    setBusy(true);

    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) { setErr("Not authenticated."); setBusy(false); return; }

    const validSigners = signers.filter((s) => s.email.trim() && s.name.trim());

    const res = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ template_id: template.id, title, fields, signers: validSigners }),
    });

    const json = await res.json();
    if (!json.ok) { setErr(json.message || "Failed to create document."); setBusy(false); return; }

    // If signers provided, send immediately
    if (validSigners.length > 0) {
      await fetch(`/api/documents/${json.data.id}/send`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    setBusy(false);
    onCreated();
  };

  return (
    <div className="doc-creator">
      {/* Step indicator */}
      <div className="doc-creator-steps">
        {STEPS.map((label, i) => (
          <div key={label} className={`doc-creator-step ${i === step ? "active" : ""} ${i < step ? "done" : ""}`}>
            <span className="doc-creator-step-num">{i < step ? "✓" : i + 1}</span>
            <span className="doc-creator-step-label">{label}</span>
          </div>
        ))}
      </div>

      {/* Step 0: Template picker */}
      {step === 0 && (
        <div className="doc-creator-body">
          <h3>Select a document template</h3>
          <div className="doc-template-grid">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                className={`doc-template-card ${template?.id === t.id ? "selected" : ""}`}
                onClick={() => setTemplate(t)}
              >
                <span className="doc-template-icon">{t.icon}</span>
                <strong>{t.label}</strong>
                <span className="note">{t.description}</span>
                <span className={`pill doc-cat-pill doc-cat-${t.category}`}>{t.category}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 1: Fields */}
      {step === 1 && template && (
        <div className="doc-creator-body">
          <h3>{template.icon} {template.label}</h3>
          <div className="doc-fields-form">
            {template.fields.map((field) => (
              <div key={field.key} className="doc-field-row">
                <label className="doc-field-label">
                  {field.label}
                  {field.required && <span className="doc-required">*</span>}
                </label>
                {field.type === "textarea" ? (
                  <textarea
                    className="doc-field-input"
                    value={fields[field.key] ?? ""}
                    placeholder={field.placeholder}
                    rows={3}
                    onChange={(e) => setField(field.key, e.target.value)}
                  />
                ) : field.type === "select" ? (
                  <select
                    className="doc-field-input"
                    value={fields[field.key] ?? ""}
                    onChange={(e) => setField(field.key, e.target.value)}
                  >
                    <option value="">— Select —</option>
                    {field.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    className="doc-field-input"
                    value={fields[field.key] ?? ""}
                    placeholder={field.placeholder}
                    onChange={(e) => setField(field.key, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Preview */}
      {step === 2 && template && (
        <div className="doc-creator-body">
          <div className="doc-title-row">
            <label className="doc-field-label">Document Title</label>
            <input
              className="doc-field-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`e.g., "Snow Contract — Smith Residence 2026"`}
            />
          </div>
          <div
            className="doc-preview-html"
            dangerouslySetInnerHTML={{ __html: template.render(fields) }}
          />
        </div>
      )}

      {/* Step 3: Signers */}
      {step === 3 && (
        <div className="doc-creator-body">
          <h3>Add Signers</h3>
          <p className="note">Each signer will receive a unique email link to review and sign the document electronically.</p>
          <div className="doc-signers-list">
            {signers.map((s, i) => (
              <div key={i} className="doc-signer-row">
                <input
                  className="doc-field-input"
                  placeholder="Full Name"
                  value={s.name}
                  onChange={(e) => setSigner(i, "name", e.target.value)}
                />
                <input
                  className="doc-field-input"
                  placeholder="Email Address"
                  type="email"
                  value={s.email}
                  onChange={(e) => setSigner(i, "email", e.target.value)}
                />
                {signers.length > 1 && (
                  <button className="doc-remove-signer" onClick={() => removeSigner(i)} title="Remove">✕</button>
                )}
              </div>
            ))}
            <button className="doc-add-signer" onClick={addSigner}>+ Add Another Signer</button>
          </div>
          {err && <p className="doc-error">{err}</p>}
        </div>
      )}

      {/* Nav buttons */}
      <div className="doc-creator-nav">
        <button className="btn-outline" onClick={step === 0 ? onCancel : back} disabled={busy}>
          {step === 0 ? "Cancel" : "← Back"}
        </button>
        {step < STEPS.length - 1 ? (
          <button className="btn-primary" onClick={next} disabled={!canAdvance()}>
            Next →
          </button>
        ) : (
          <button className="btn-primary" onClick={submit} disabled={busy}>
            {busy ? "Creating..." : signers.some((s) => s.email.trim()) ? "Create & Send for Signature" : "Create Document (No Signers)"}
          </button>
        )}
      </div>
    </div>
  );
}
