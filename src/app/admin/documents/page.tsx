"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { CheckCircle2, Circle, Clock, FileText, PenLine, Send, Bell, Plus, ChevronRight, X } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import DocumentCreator from "@/components/DocumentCreator";
import SignaturePad, { SignaturePadHandle } from "@/components/SignaturePad";
import { supabase } from "@/lib/supabaseClient";

type Signer = {
  id: string;
  signer_name: string;
  signer_email: string;
  signing_token: string;
  status: "pending" | "signed" | "declined";
  signed_at: string | null;
};

type Doc = {
  id: string;
  title: string;
  template_type: string;
  status: string;
  body_html: string;
  created_at: string;
  created_by: string;
  nc_document_signatures: Signer[];
};

const TEMPLATE_LABELS: Record<string, string> = {
  snow_removal_contract:      "❄️ Snow Removal Contract",
  lawn_maintenance_agreement: "🌿 Lawn Maintenance Agreement",
  subcontractor_agreement:    "🧑‍🔧 Subcontractor Agreement",
  equipment_use_agreement:    "🚜 Equipment Use Agreement",
  property_liability_waiver:  "📋 Property Liability Waiver",
};

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  draft:            { label: "Draft",            cls: "status-draft"    },
  sent:             { label: "Sent",             cls: "status-sent"     },
  partially_signed: { label: "Partially Signed", cls: "status-partial"  },
  signed:           { label: "Fully Signed",     cls: "status-signed"   },
  voided:           { label: "Voided",           cls: "status-voided"   },
};

export default function DocumentsPage() {
  const [docs, setDocs]           = useState<Doc[]>([]);
  const [activeId, setActiveId]   = useState<string | null>(null);
  const [loading, setLoading]     = useState(true);
  const [creating, setCreating]   = useState(false);
  const [busy, setBusy]           = useState(false);
  const [toast, setToast]         = useState("");

  // In-app signing modal state
  const [signingFor, setSigningFor]     = useState<Signer | null>(null);
  const [signMode, setSignMode]         = useState<"draw" | "type">("draw");
  const [typedName, setTypedName]       = useState("");
  const [signBusy, setSignBusy]         = useState(false);
  const [signErr, setSignErr]           = useState("");
  const padRef = useRef<SignaturePadHandle>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  };

  const load = useCallback(async () => {
    setLoading(true);
    const token = await getToken();
    if (!token) { setLoading(false); return; }
    const res = await fetch("/api/documents", { headers: { Authorization: `Bearer ${token}` } });
    const json = await res.json();
    if (json.ok) {
      setDocs(json.data ?? []);
      if (!activeId && json.data?.length > 0) setActiveId(json.data[0].id);
    }
    setLoading(false);
  }, [activeId]);

  useEffect(() => { load(); }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const activeDoc = docs.find((d) => d.id === activeId) ?? null;

  const handleSend = async () => {
    if (!activeId) return;
    setBusy(true);
    const token = await getToken();
    const res = await fetch(`/api/documents/${activeId}/send`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    const json = await res.json();
    showToast(json.ok ? `Sent to ${json.data?.sent?.length ?? 0} signer(s).` : json.message ?? "Send failed.");
    await load();
    setBusy(false);
  };

  const handleRemind = async () => {
    if (!activeId) return;
    setBusy(true);
    const token = await getToken();
    const res = await fetch(`/api/documents/${activeId}/remind`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    const json = await res.json();
    showToast(json.ok ? `Reminder sent to ${json.data?.sent?.length ?? 0} signer(s).` : json.message ?? "Remind failed.");
    setBusy(false);
  };

  const openSignModal = (signer: Signer) => {
    setSigningFor(signer);
    setSignMode("draw");
    setTypedName("");
    setSignErr("");
  };

  const closeSignModal = () => {
    setSigningFor(null);
    setSignErr("");
  };

  const submitInAppSign = async () => {
    if (!signingFor) return;
    setSignErr("");

    if (signMode === "draw") {
      if (!padRef.current || padRef.current.isEmpty()) {
        setSignErr("Please draw your signature before submitting.");
        return;
      }
    } else {
      if (!typedName.trim()) {
        setSignErr("Please type your full name to sign.");
        return;
      }
    }

    setSignBusy(true);
    const body: Record<string, string> = {};
    if (signMode === "draw") {
      body.signature_data = padRef.current!.getSignatureData()!;
    } else {
      body.typed_name = typedName.trim();
    }

    const res  = await fetch(`/api/sign/${signingFor.signing_token}`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(body),
    });
    const json = await res.json();
    if (json.ok) {
      showToast(`${signingFor.signer_name} has signed successfully.`);
      closeSignModal();
      await load();
    } else {
      setSignErr(json.message || "Signing failed. Please try again.");
    }
    setSignBusy(false);
  };

  const signedCount  = activeDoc?.nc_document_signatures.filter((s) => s.status === "signed").length  ?? 0;
  const totalSigners = activeDoc?.nc_document_signatures.length ?? 0;

  if (creating) {
    return (
      <div className="panel">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ fontWeight: 800, fontSize: "1.1rem" }}>New Document</h2>
          <button className="doc-close-btn" onClick={() => setCreating(false)}><X size={18} /></button>
        </div>
        <DocumentCreator
          onCreated={async () => { setCreating(false); await load(); }}
          onCancel={() => setCreating(false)}
        />
      </div>
    );
  }

  return (
    <div className="panel">
      <SectionHeader
        title="Documents & Contracts"
        subtitle="Create, send, and track signed agreements for clients, workers, and equipment."
        action={
          <button className="btn-primary" onClick={() => setCreating(true)} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Plus size={16} /> New Document
          </button>
        }
      />

      {toast && <div className="doc-toast">{toast}</div>}

      {loading ? (
        <div className="note" style={{ marginTop: 24 }}>Loading documents…</div>
      ) : docs.length === 0 ? (
        <div className="kpi-card" style={{ marginTop: 20, textAlign: "center", padding: 40 }}>
          <FileText size={40} style={{ opacity: 0.3, margin: "0 auto 12px" }} />
          <div style={{ fontWeight: 700, marginBottom: 6 }}>No documents yet</div>
          <div className="note">Click <strong>New Document</strong> to create your first contract or agreement.</div>
        </div>
      ) : (
        <div className="doc-manager">
          {/* Left list */}
          <aside className="doc-list">
            {docs.map((doc) => {
              const sigCount  = doc.nc_document_signatures.filter((s) => s.status === "signed").length;
              const sigTotal  = doc.nc_document_signatures.length;
              const isActive  = doc.id === activeId;
              const isSigned  = doc.status === "signed";
              return (
                <button
                  key={doc.id}
                  className={`doc-list-row ${isActive ? "active" : ""}`}
                  onClick={() => setActiveId(doc.id)}
                >
                  <span className="doc-list-icon">
                    {isSigned ? <CheckCircle2 size={16} style={{ color: "#1C7C20" }} /> : <Circle size={16} style={{ color: "#aaa" }} />}
                  </span>
                  <span className="doc-list-meta">
                    <strong>{doc.title}</strong>
                    <small>{TEMPLATE_LABELS[doc.template_type] ?? doc.template_type}</small>
                    <small style={{ color: "#aaa" }}>
                      {sigTotal > 0 ? `${sigCount}/${sigTotal} signed` : "No signers"}
                    </small>
                  </span>
                  {isActive && <ChevronRight size={14} style={{ flexShrink: 0, opacity: 0.5 }} />}
                </button>
              );
            })}
          </aside>

          {/* Right detail */}
          <section className="doc-detail">
            {!activeDoc ? (
              <div className="note">Select a document.</div>
            ) : (
              <>
                {/* Header */}
                <div className="doc-detail-head">
                  <div>
                    <h3>{activeDoc.title}</h3>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4, flexWrap: "wrap" }}>
                      <span className={`pill ${STATUS_CONFIG[activeDoc.status]?.cls ?? "status-draft"}`}>
                        {STATUS_CONFIG[activeDoc.status]?.label ?? activeDoc.status}
                      </span>
                      <span className="note">{TEMPLATE_LABELS[activeDoc.template_type] ?? activeDoc.template_type}</span>
                      {totalSigners > 0 && (
                        <span className="note">{signedCount}/{totalSigners} signatures</span>
                      )}
                    </div>
                  </div>
                  <div className="doc-detail-actions">
                    <button
                      className="btn-outline"
                      onClick={handleSend}
                      disabled={busy || activeDoc.status === "signed" || totalSigners === 0}
                      title="Send signature request emails"
                    >
                      <Send size={14} /> Send
                    </button>
                    <button
                      className="btn-outline"
                      onClick={handleRemind}
                      disabled={busy || activeDoc.nc_document_signatures.every((s) => s.status === "signed")}
                      title="Remind pending signers"
                    >
                      <Bell size={14} /> Remind
                    </button>
                  </div>
                </div>

                {/* Signers */}
                {totalSigners > 0 && (
                  <div className="doc-signers-status">
                    <strong style={{ fontSize: "0.82rem", marginBottom: 8, display: "block" }}>Signing Status</strong>
                    {activeDoc.nc_document_signatures.map((s) => (
                      <div key={s.id} className="doc-signer-status-row">
                        {s.status === "signed"
                          ? <CheckCircle2 size={15} style={{ color: "#1C7C20", flexShrink: 0 }} />
                          : <Clock size={15} style={{ color: "#F5A31A", flexShrink: 0 }} />}
                        <span style={{ flex: 1 }}>
                          <strong>{s.signer_name}</strong> — {s.signer_email}
                        </span>
                        <span className={`pill ${s.status === "signed" ? "status-signed" : "status-sent"}`}>
                          {s.status === "signed" ? `Signed ${s.signed_at ? new Date(s.signed_at).toLocaleDateString() : ""}` : "Pending"}
                        </span>
                        {s.status === "pending" && (
                          <button
                            className="btn-sign-inapp"
                            onClick={() => openSignModal(s)}
                            title="Sign this document in the app"
                          >
                            <PenLine size={13} /> Sign In App
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Document preview */}
                <div className="doc-preview-scroll">
                  <div
                    className="doc-preview-html"
                    dangerouslySetInnerHTML={{ __html: activeDoc.body_html || "<p class='note' style='padding:20px'>No document content.</p>" }}
                  />
                </div>

                {activeDoc.status === "signed" && (
                  <div className="doc-fully-signed-banner">
                    <PenLine size={16} /> All signatures collected — document is fully executed.
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      )}

      {/* In-app signing modal */}
      {signingFor && (
        <div className="inapp-sign-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeSignModal(); }}>
          <div className="inapp-sign-modal">
            <div className="inapp-sign-header">
              <div>
                <h3>Sign Document</h3>
                <p className="note" style={{ marginTop: 2 }}>
                  Signing as <strong>{signingFor.signer_name}</strong> — {signingFor.signer_email}
                </p>
              </div>
              <button className="doc-close-btn" onClick={closeSignModal}><X size={18} /></button>
            </div>

            <div className="sign-mode-toggle" style={{ marginBottom: 16 }}>
              <button
                className={`sign-mode-btn ${signMode === "draw" ? "active" : ""}`}
                onClick={() => setSignMode("draw")}
              >
                ✍️ Draw Signature
              </button>
              <button
                className={`sign-mode-btn ${signMode === "type" ? "active" : ""}`}
                onClick={() => setSignMode("type")}
              >
                ⌨️ Type Name
              </button>
            </div>

            {signMode === "draw" && (
              <div>
                <SignaturePad ref={padRef} width={500} height={150} />
                <button className="sign-clear-btn" onClick={() => padRef.current?.clear()}>Clear</button>
              </div>
            )}

            {signMode === "type" && (
              <div className="sign-type-wrap">
                <input
                  className="sign-type-input"
                  placeholder="Type full legal name"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                />
                {typedName && <div className="sign-typed-preview">{typedName}</div>}
              </div>
            )}

            {signErr && <p className="doc-error" style={{ marginTop: 10 }}>{signErr}</p>}

            <p className="sign-legal-note" style={{ marginTop: 14 }}>
              By clicking &ldquo;Confirm Signature&rdquo;, this electronic signature serves as the legal equivalent of a handwritten signature and the signer consents to be legally bound by this document.
            </p>

            <div style={{ display: "flex", gap: 10, marginTop: 16, justifyContent: "flex-end" }}>
              <button className="btn-outline" onClick={closeSignModal} disabled={signBusy}>Cancel</button>
              <button className="btn-primary" onClick={submitInAppSign} disabled={signBusy}>
                {signBusy ? "Submitting…" : "Confirm Signature"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
