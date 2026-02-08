"use client";

import { useState } from "react";

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
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(seedMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
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
      const response = await fetch("/api/business-ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content }) => ({ role, content }))
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
