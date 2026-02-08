"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
};

const seedMessages: ChatMessage[] = [
  {
    id: "seed-1",
    role: "assistant",
    content:
      "Business AI online. Ask about revenue projections, lead follow-ups, or dispatch readiness."
  }
];

export default function BusinessAIChat() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(seedMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleNavigate = (label: string, href: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `ai-nav-${Date.now()}`,
        role: "assistant",
        content: `Opening ${label}...`
      }
    ]);
    router.push(href);
  };

  const commandRoute = (text: string) => {
    const normalized = text.trim().toLowerCase();
    const map: Record<string, { label: string; href: string }> = {
      dashboard: { label: "Dashboard", href: "/admin" },
      leads: { label: "Leads", href: "/admin/leads" },
      clients: { label: "Clients", href: "/admin/clients" },
      jobs: { label: "Jobs", href: "/admin/jobs" },
      messages: { label: "Messages", href: "/admin/messages" },
      "lead intake": { label: "Lead Intake", href: "/admin/lead-intake" },
      settings: { label: "Settings", href: "/admin/settings" },
      "work orders": { label: "Work Orders", href: "/admin/work-orders" },
      audit: { label: "Audit Logs", href: "/admin/audit" },
      "audit logs": { label: "Audit Logs", href: "/admin/audit" }
    };

    const match = Object.keys(map).find((key) =>
      normalized.includes(key)
    );
    return match ? map[match] : null;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const navTarget = commandRoute(input);
    if (navTarget) {
      handleNavigate(navTarget.label, navTarget.href);
      setInput("");
      return;
    }
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim()
    };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        throw new Error("No active session.");
      }

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoISO = weekAgo.toISOString().slice(0, 10);

      const [{ count: leadsCount }, { count: jobsCount }, { count: jobsWeek }] =
        await Promise.all([
          supabase.from("leads").select("id", { count: "exact", head: true }),
          supabase.from("jobs").select("id", { count: "exact", head: true }),
          supabase
            .from("jobs")
            .select("id", { count: "exact", head: true })
            .gte("scheduled_date", weekAgoISO)
        ]);

      const contextNote = `Context: leads=${leadsCount ?? 0}, jobs=${jobsCount ?? 0}, jobs_last_7_days=${jobsWeek ?? 0}.`;

      const response = await fetch("/api/business-ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          messages: [
            { role: "user", content: contextNote },
            ...nextMessages.map(({ role, content }) => ({ role, content }))
          ]
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Business AI unavailable.");
      }
      const assistantMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content:
          data?.message?.content ||
          data?.response ||
          "Business AI responded, but no message was returned."
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const assistantMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content:
          "Business AI engine offline. Start the Going Digital engine and set BUSINESS_AI_ENGINE_URL."
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`nexus ${open ? "open" : ""}`}>
      <button className="nexus-toggle" onClick={() => setOpen((prev) => !prev)}>
        {open ? "Close Business AI" : "Business AI"}
      </button>
      {open ? (
        <div className="nexus-panel">
          <div className="nexus-header">
            <div>
              <div className="nexus-title">Business AI Core</div>
              <div className="nexus-sub">Business brain + pricing logic</div>
            </div>
            <span className="pill">2-3 in standard</span>
          </div>
          <div className="nexus-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`nexus-message ${message.role}`}
              >
                {message.content}
              </div>
            ))}
          </div>
          <div className="nexus-quick">
            <button onClick={() => handleNavigate("Dashboard", "/admin")}>
              Dashboard
            </button>
            <button onClick={() => handleNavigate("Leads", "/admin/leads")}>
              Leads
            </button>
            <button onClick={() => handleNavigate("Clients", "/admin/clients")}>
              Clients
            </button>
            <button onClick={() => handleNavigate("Messages", "/admin/messages")}>
              Messages
            </button>
            <button onClick={() => handleNavigate("Audit Logs", "/admin/audit")}>
              Audit Logs
            </button>
            <button onClick={() => handleNavigate("Work Orders", "/admin/work-orders")}>
              Work Orders
            </button>
          </div>
          <div className="nexus-input">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask Business AI..."
              onKeyDown={(event) => {
                if (event.key === "Enter") handleSend();
              }}
            />
            <button onClick={handleSend} disabled={isLoading}>
              {isLoading ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
