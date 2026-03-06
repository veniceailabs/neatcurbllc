"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, Minimize2, SendHorizontal, X } from "lucide-react";

type VisitorMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
};

type ChatbotResponse = {
  ok?: boolean;
  message?: string;
  data?: {
    reply?: string;
    suggestions?: string[];
  };
};

const CHAT_HISTORY_KEY = "neatcurb_visitor_chat_history_v1";
const CHAT_OPEN_KEY = "neatcurb_visitor_chat_open_v1";
const CHAT_WELCOME_SHOWN_KEY = "neatcurb_visitor_chat_welcome_v1";
const AUTO_MINIMIZE_MS = 45_000;

const defaultSuggestions = [
  "What services do you offer?",
  "What areas do you service?",
  "How fast can I get a quote?",
  "How do I contact Corey?"
];

const welcomeMessage: VisitorMessage = {
  id: "assistant-welcome",
  role: "assistant",
  content:
    "Welcome to Neat Curb LLC. I can answer service questions and help you request a quote while Corey is busy."
};

export default function VisitorAssistant() {
  const pathname = usePathname();
  const [hydrated, setHydrated] = useState(false);
  const [open, setOpen] = useState(false);
  const [showNudge, setShowNudge] = useState(false);
  const [messages, setMessages] = useState<VisitorMessage[]>([welcomeMessage]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>(defaultSuggestions);

  const hidden = pathname.startsWith("/admin") || pathname.startsWith("/sign");

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || hidden) return;

    try {
      const storedOpen = window.localStorage.getItem(CHAT_OPEN_KEY);
      if (storedOpen !== null) setOpen(storedOpen === "1");

      const storedHistory = window.localStorage.getItem(CHAT_HISTORY_KEY);
      if (storedHistory) {
        const parsed = JSON.parse(storedHistory) as VisitorMessage[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed.slice(-20));
        }
      }

      const welcomeShown = window.localStorage.getItem(CHAT_WELCOME_SHOWN_KEY);
      if (!welcomeShown) {
        const showTimer = window.setTimeout(() => {
          setShowNudge(true);
          setOpen(true);
        }, 1200);
        const hideTimer = window.setTimeout(() => {
          setShowNudge(false);
          setOpen(false);
        }, 12_000);
        window.localStorage.setItem(CHAT_WELCOME_SHOWN_KEY, "1");
        return () => {
          clearTimeout(showTimer);
          clearTimeout(hideTimer);
        };
      }
    } catch {
      // Ignore local storage parse errors.
    }
  }, [hydrated, hidden]);

  useEffect(() => {
    if (!hydrated || hidden) return;
    window.localStorage.setItem(CHAT_OPEN_KEY, open ? "1" : "0");
  }, [hydrated, hidden, open]);

  useEffect(() => {
    if (!hydrated || hidden) return;
    window.localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages.slice(-20)));
  }, [hydrated, hidden, messages]);

  useEffect(() => {
    if (!open || hidden) return;
    const timer = window.setTimeout(() => {
      setOpen(false);
      setShowNudge(false);
    }, AUTO_MINIMIZE_MS);
    return () => clearTimeout(timer);
  }, [open, hidden, messages, input, sending]);

  const quickActions = useMemo(
    () => (suggestions.length > 0 ? suggestions.slice(0, 4) : defaultSuggestions),
    [suggestions]
  );

  const runQuickCommand = (prompt: string) => {
    const normalized = prompt.trim().toLowerCase();

    if (normalized.includes("open request quote")) {
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-nav-${Date.now()}`,
          role: "assistant",
          content: "Opening the quote form now."
        }
      ]);
      window.location.href = "/request-quote";
      return true;
    }

    if (normalized.includes("call now")) {
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-call-${Date.now()}`,
          role: "assistant",
          content: "Calling (716) 241-1499."
        }
      ]);
      window.location.href = "tel:+17162411499";
      return true;
    }

    if (normalized.includes("open dot card")) {
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-dot-${Date.now()}`,
          role: "assistant",
          content: "Opening the DOT card."
        }
      ]);
      window.open("https://dot.cards/neatcurb", "_blank", "noopener,noreferrer");
      return true;
    }

    return false;
  };

  const askAssistant = async (prompt: string) => {
    const message = prompt.trim();
    if (!message || sending) return;

    setError(null);
    setShowNudge(false);
    if (runQuickCommand(message)) return;

    const userMessage: VisitorMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: message
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSending(true);

    try {
      const response = await fetch("/api/public/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          history: messages.slice(-8).map(({ role, content }) => ({ role, content }))
        })
      });
      const payload = (await response.json().catch(() => null)) as ChatbotResponse | null;
      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.message || "Assistant is unavailable.");
      }

      const reply =
        typeof payload.data?.reply === "string" && payload.data.reply.trim().length > 0
          ? payload.data.reply.trim()
          : "I can help with services, areas, certifications, and quotes.";

      const nextSuggestions = Array.isArray(payload.data?.suggestions)
        ? payload.data?.suggestions.filter(
            (entry): entry is string => typeof entry === "string" && entry.trim().length > 0
          )
        : [];

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: reply
        }
      ]);
      if (nextSuggestions.length > 0) {
        setSuggestions(nextSuggestions.slice(0, 4));
      }
    } catch (err) {
      const messageText =
        err instanceof Error ? err.message : "Assistant request failed.";
      setError(messageText);
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-fallback-${Date.now()}`,
          role: "assistant",
          content:
            "I can still help with basics: call (716) 241-1499 or submit a request at /request-quote."
        }
      ]);
    } finally {
      setSending(false);
    }
  };

  if (!hydrated || hidden) return null;

  return (
    <div className={`visitor-assistant ${open ? "open" : ""}`}>
      {showNudge && !open ? (
        <button
          className="visitor-assistant-nudge"
          onClick={() => setOpen(true)}
          type="button"
        >
          Welcome! Ask us anything.
        </button>
      ) : null}

      {open ? (
        <section
          className="visitor-assistant-panel"
          aria-label="Neat Curb assistant"
          role="dialog"
        >
          <div className="visitor-assistant-header">
            <div>
              <div className="visitor-assistant-title">Neat Curb Assistant</div>
              <div className="visitor-assistant-sub">Live help while Corey is on-site</div>
            </div>
            <button
              className="visitor-assistant-close"
              type="button"
              aria-label="Minimize chat assistant"
              onClick={() => setOpen(false)}
            >
              <X size={16} />
            </button>
          </div>

          <div className="visitor-assistant-messages">
            {messages.slice(-10).map((message) => (
              <div key={message.id} className={`visitor-assistant-message ${message.role}`}>
                {message.content}
              </div>
            ))}
          </div>

          <div className="visitor-assistant-quick">
            {quickActions.map((action) => (
              <button
                key={action}
                type="button"
                onClick={() => void askAssistant(action)}
                disabled={sending}
              >
                {action}
              </button>
            ))}
          </div>

          {error ? (
            <div className="visitor-assistant-error" role="status">
              {error}
            </div>
          ) : null}

          <div className="visitor-assistant-input">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about services, areas, or quotes..."
              autoComplete="off"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void askAssistant(input);
                }
              }}
            />
            <button onClick={() => void askAssistant(input)} disabled={sending || !input.trim()}>
              {sending ? "..." : <SendHorizontal size={16} />}
            </button>
          </div>
        </section>
      ) : null}

      <button
        className="visitor-assistant-toggle"
        type="button"
        onClick={() => {
          setShowNudge(false);
          setOpen((prev) => !prev);
        }}
        aria-expanded={open}
      >
        {open ? <Minimize2 size={16} /> : <MessageCircle size={16} />}
        <span>{open ? "Minimize" : "Need Help?"}</span>
      </button>
    </div>
  );
}
