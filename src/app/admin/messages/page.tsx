"use client";

import { useEffect, useState } from "react";
import SectionHeader from "@/components/SectionHeader";
import Tooltip from "@/components/Tooltip";
import { supabase } from "@/lib/supabaseClient";

type Client = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
};

export default function MessagesPage() {
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
      setStatus("Pick a client first.");
      return;
    }
    if (channel === "email" && !client.email) {
      setStatus("Client email is missing.");
      return;
    }
    if (channel === "sms" && !client.phone) {
      setStatus("Client phone is missing.");
      return;
    }

    const { data: session } = await supabase.auth.getSession();
    const token = session.session?.access_token;
    if (!token) {
      setStatus("You are not authenticated.");
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
      setStatus(data?.error || "Failed to send message.");
      return;
    }

    setStatus("Message sent.");
    setSubject("");
    setBody("");
  };

  return (
    <div className="panel">
      <SectionHeader
        title="Messages"
        subtitle="Send email or SMS updates directly from the hub."
        action={<span className="pill">Admin Only</span>}
      />
      <div style={{ display: "grid", gap: "12px", marginTop: "16px" }}>
        <label className="form-field">
          Client
          <select value={clientId} onChange={(e) => setClientId(e.target.value)}>
            <option value="">Select a client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name || client.email || client.phone || client.id}
              </option>
            ))}
          </select>
        </label>
        <label className="form-field">
          Channel
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value as "email" | "sms")}
          >
            <option value="email">Email</option>
            <option value="sms">SMS</option>
          </select>
        </label>
        {channel === "email" ? (
          <label className="form-field">
            Subject
            <input value={subject} onChange={(e) => setSubject(e.target.value)} />
          </label>
        ) : null}
        <label className="form-field">
          Message
          <textarea rows={4} value={body} onChange={(e) => setBody(e.target.value)} />
        </label>
        <Tooltip label="Send email or SMS and log it in Messages + Audit">
          <button className="button-primary" type="button" onClick={handleSend}>
            Send Message
          </button>
        </Tooltip>
        {status ? <div className="note">{status}</div> : null}
      </div>
    </div>
  );
}
