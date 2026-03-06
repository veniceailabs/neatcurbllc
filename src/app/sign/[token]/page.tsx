"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import SignaturePad, { SignaturePadHandle } from "@/components/SignaturePad";

type DocData = {
  signature_id: string;
  signer_name:  string;
  signer_email: string;
  document: { id: string; title: string; body_html: string };
};

type State = "loading" | "ready" | "already_signed" | "done" | "error";

export default function SignPage({ params }: { params: { token: string } }) {
  const [state, setState]     = useState<State>("loading");
  const [data, setData]       = useState<DocData | null>(null);
  const [typedName, setTyped] = useState("");
  const [mode, setMode]       = useState<"draw" | "type">("draw");
  const [busy, setBusy]       = useState(false);
  const [errMsg, setErrMsg]   = useState("");
  const padRef = useRef<SignaturePadHandle>(null);

  useEffect(() => {
    fetch(`/api/sign/${params.token}`)
      .then((r) => r.json())
      .then((json) => {
        if (!json.ok) { setState("error"); return; }
        if (json.data?.already_signed) { setState("already_signed"); return; }
        setData(json.data);
        setState("ready");
      })
      .catch(() => setState("error"));
  }, [params.token]);

  const submit = async () => {
    setErrMsg("");
    if (mode === "draw") {
      if (!padRef.current || padRef.current.isEmpty()) {
        setErrMsg("Please draw your signature before submitting.");
        return;
      }
    } else {
      if (!typedName.trim()) {
        setErrMsg("Please type your full name to sign.");
        return;
      }
    }

    setBusy(true);
    const body: Record<string, string> = {};
    if (mode === "draw") {
      body.signature_data = padRef.current!.getSignatureData()!;
    } else {
      body.typed_name = typedName.trim();
    }

    const res  = await fetch(`/api/sign/${params.token}`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(body),
    });
    const json = await res.json();
    if (json.ok) {
      setState("done");
    } else {
      setErrMsg(json.message || "Signing failed. Please try again.");
    }
    setBusy(false);
  };

  return (
    <div className="sign-page">
      <header className="sign-header">
        <Image src="/brand/neat-curb-logo-full.png" alt="Neat Curb LLC" width={100} height={75} />
        <div>
          <strong>Neat Curb LLC</strong>
          <span className="note">(716) 241-1499 · neatcurbllc.com</span>
        </div>
      </header>

      <main className="sign-main">
        {state === "loading" && <div className="sign-state-box note">Loading document…</div>}

        {state === "error" && (
          <div className="sign-state-box">
            <h2>Invalid Link</h2>
            <p className="note">This signing link is invalid or has expired. Contact Neat Curb LLC at (716) 241-1499.</p>
          </div>
        )}

        {state === "already_signed" && (
          <div className="sign-state-box sign-done">
            <span className="sign-done-icon">✓</span>
            <h2>Already Signed</h2>
            <p className="note">You have already signed this document. No further action is needed.</p>
          </div>
        )}

        {state === "done" && (
          <div className="sign-state-box sign-done">
            <span className="sign-done-icon">✓</span>
            <h2>Document Signed</h2>
            <p>Thank you, <strong>{data?.signer_name}</strong>. Your signature has been recorded.</p>
            <p className="note">Neat Curb LLC will receive a notification. Keep this page for your records.</p>
          </div>
        )}

        {state === "ready" && data && (
          <div className="sign-content">
            <div className="sign-doc-meta">
              <h1>{data.document.title}</h1>
              <p className="note">Please review the full document below, then sign at the bottom.</p>
            </div>

            <div className="sign-doc-body doc-preview-html"
              dangerouslySetInnerHTML={{ __html: data.document.body_html }}
            />

            <div className="sign-action-box">
              <h2>Sign Here — {data.signer_name}</h2>
              <p className="note">{data.signer_email}</p>

              <div className="sign-mode-toggle">
                <button
                  className={`sign-mode-btn ${mode === "draw" ? "active" : ""}`}
                  onClick={() => setMode("draw")}
                >
                  ✍️ Draw Signature
                </button>
                <button
                  className={`sign-mode-btn ${mode === "type" ? "active" : ""}`}
                  onClick={() => setMode("type")}
                >
                  ⌨️ Type Name
                </button>
              </div>

              {mode === "draw" && (
                <div>
                  <SignaturePad ref={padRef} width={560} height={160} />
                  <button className="sign-clear-btn" onClick={() => padRef.current?.clear()}>Clear</button>
                </div>
              )}

              {mode === "type" && (
                <div className="sign-type-wrap">
                  <input
                    className="sign-type-input"
                    placeholder="Type your full legal name"
                    value={typedName}
                    onChange={(e) => setTyped(e.target.value)}
                  />
                  {typedName && (
                    <div className="sign-typed-preview">{typedName}</div>
                  )}
                </div>
              )}

              {errMsg && <p className="doc-error">{errMsg}</p>}

              <div className="sign-legal-note">
                By clicking &ldquo;Sign Document&rdquo;, I agree that my electronic signature is the legal equivalent of my handwritten signature on this document. I consent to be legally bound by its terms.
              </div>

              <button
                className="btn-primary sign-submit-btn"
                onClick={submit}
                disabled={busy}
              >
                {busy ? "Submitting…" : "Sign Document"}
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="sign-footer">
        <span>Neat Curb LLC · 229 West Genesee St, Box 106 · Buffalo, NY 14202</span>
        <span>Licensed &amp; Insured · (716) 241-1499</span>
      </footer>
    </div>
  );
}
