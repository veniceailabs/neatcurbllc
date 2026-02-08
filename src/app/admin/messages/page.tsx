"use client";

import { useEffect, useState } from "react";
import SectionHeader from "@/components/SectionHeader";
import Tooltip from "@/components/Tooltip";
import { supabase } from "@/lib/supabaseClient";
import { useLanguage } from "@/components/language-context";
import { getCopy } from "@/lib/i18n";

type Client = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
};

export default function MessagesPage() {
  const { language } = useLanguage();
  const copy = getCopy(language);
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState("");
  const [channel, setChannel] = useState<"email" | "sms">("email");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("clients")
        .select("id,name,email,phone")
        .order("name", { ascending: true });
      if (data) setClients(data);
    };
    load();
  }, []);

  const handleSend = async () => {
    setStatus(null);
    const client = clients.find((c) => c.id === clientId);
    if (!client) {
      setStatus(copy.admin.messages.statusClient);
      return;
    }
    if (channel === "email" && !client.email) {
      setStatus(copy.admin.messages.statusEmail);
      return;
    }
    if (channel === "sms" && !client.phone) {
      setStatus(copy.admin.messages.statusPhone);
      return;
    }

    const { data: session } = await supabase.auth.getSession();
    const token = session.session?.access_token;
    if (!token) {
      setStatus(copy.admin.messages.statusAuth);
      return;
    }

    const endpoint = channel === "email" ? "/api/messages/email" : "/api/messages/sms";
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        client_id: client.id,
        to: channel === "email" ? client.email : client.phone,
        subject,
        body
      })
    });

    const data = await response.json();
    if (!response.ok) {
      setStatus(data?.error || copy.admin.messages.statusFail);
      return;
    }

    setStatus(copy.admin.messages.statusSent);
    setSubject("");
    setBody("");
  };

  return (
    <div className="panel">
      <SectionHeader
        title={copy.admin.messages.title}
        subtitle={copy.admin.messages.subtitle}
        action={<span className="pill">{copy.admin.messages.adminOnly}</span>}
      />
      <div style={{ display: "grid", gap: "12px", marginTop: "16px" }}>
        <label className="form-field">
          {copy.admin.messages.client}
          <select value={clientId} onChange={(e) => setClientId(e.target.value)}>
            <option value="">{copy.admin.messages.selectClient}</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name || client.email || client.phone || client.id}
              </option>
            ))}
          </select>
        </label>
        <label className="form-field">
          {copy.admin.messages.channel}
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value as "email" | "sms")}
          >
            <option value="email">{copy.admin.messages.email}</option>
            <option value="sms">{copy.admin.messages.sms}</option>
          </select>
        </label>
        {channel === "email" ? (
          <label className="form-field">
            {copy.admin.messages.subject}
            <input value={subject} onChange={(e) => setSubject(e.target.value)} />
          </label>
        ) : null}
        <label className="form-field">
          {copy.admin.messages.message}
          <textarea rows={4} value={body} onChange={(e) => setBody(e.target.value)} />
        </label>
        <Tooltip label={copy.admin.messages.tooltip}>
          <button className="button-primary" type="button" onClick={handleSend}>
            {copy.admin.messages.send}
          </button>
        </Tooltip>
        {status ? <div className="note">{status}</div> : null}
      </div>
    </div>
  );
}
