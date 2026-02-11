"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
};

type ChatApiData = {
  message?: { role?: string; content?: string } | string;
  degraded?: boolean;
  details?: string | null;
  requestId?: string;
  circuitOpen?: boolean;
};

const seedMessages: ChatMessage[] = [
  {
    id: "seed-1",
    role: "assistant",
    content:
      "Business AI online. Ask about revenue projections, lead follow-ups, or dispatch readiness."
  }
];

const HISTORY_KEY = "neatcurb_business_ai_history_v1";
const OPEN_KEY = "neatcurb_business_ai_open_v1";
const MAX_LOCAL_MESSAGES = 24;

export default function BusinessAIChat() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(seedMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedOpen = window.localStorage.getItem(OPEN_KEY);
      if (storedOpen !== null) setOpen(storedOpen === "1");
      const raw = window.localStorage.getItem(HISTORY_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as ChatMessage[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        setMessages(parsed.slice(-MAX_LOCAL_MESSAGES));
      }
    } catch {
      // Ignore local storage parse issues.
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(OPEN_KEY, open ? "1" : "0");
  }, [open]);

  useEffect(() => {
    window.localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify(messages.slice(-MAX_LOCAL_MESSAGES))
    );
  }, [messages]);

  const setAssistantMessage = (content: string) => {
    setMessages((prev) => [
      ...prev,
      { id: `ai-${Date.now()}`, role: "assistant", content }
    ]);
  };

  const handleNavigate = (label: string, href: string) => {
    setAssistantMessage(`Opening ${label}...`);
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

    const trimmed = normalized.replace(/^\//, "");
    const match = Object.keys(map).find((key) =>
      trimmed === key || trimmed.includes(key)
    );
    return match ? map[match] : null;
  };

  const quickActions = useMemo(
    () => [
      { label: "Dashboard", href: "/admin" },
      { label: "Leads", href: "/admin/leads" },
      { label: "Clients", href: "/admin/clients" },
      { label: "Messages", href: "/admin/messages" },
      { label: "Audit Logs", href: "/admin/audit" },
      { label: "Work Orders", href: "/admin/work-orders" }
    ],
    []
  );

  const extractAssistantContent = (payload: unknown) => {
    if (!payload || typeof payload !== "object") return null;
    const maybe = payload as { content?: unknown };
    if (typeof maybe.content === "string") return maybe.content;
    return null;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    setLastError(null);

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

      const response = await fetch("/api/business-ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content }) => ({ role, content }))
        })
      });

      const payload = await response.json().catch(() => null);
      if (!payload || typeof payload !== "object") {
        throw new Error("Business AI returned an unreadable response.");
      }

      const result = payload as {
        ok?: boolean;
        message?: string;
        errorCode?: string;
        data?: ChatApiData;
      };

      if (!response.ok) {
        throw new Error(result.message || "Business AI unavailable.");
      }

      const data = result.data;
      const content =
        extractAssistantContent(data?.message) ||
        (typeof data?.message === "string" ? data.message : null) ||
        "Business AI responded, but no message was returned.";

      setAssistantMessage(content);
      if (data?.degraded) {
        setLastError("Business AI is in fallback mode. Metrics are still available.");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Business AI request failed.";
      setLastError(errorMessage);
      setAssistantMessage(
        "Business AI is temporarily unavailable. You can still use quick actions while it reconnects."
      );
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
          {lastError ? (
            <div className="nexus-error" role="status">
              {lastError}
            </div>
          ) : null}
          <div className="nexus-quick">
            {quickActions.map((action) => (
              <button
                key={action.href}
                onClick={() => handleNavigate(action.label, action.href)}
              >
                {action.label}
              </button>
            ))}
            <button
              onClick={() => setMessages(seedMessages)}
              type="button"
              aria-label="Reset AI conversation"
            >
              Reset
            </button>
          </div>
          <div className="nexus-input">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask Business AI..."
              autoComplete="off"
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
