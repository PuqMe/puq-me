"use client";

import { AppShell } from "@/components/app-shell";
import { useChatClient } from "@/components/chat-client";

export function ChatShell() {
  const { messages, draft, peerTyping, peerPresence, setDraft, sendTextMessage, sendDemoImage } = useChatClient();

  return (
    <AppShell active="/chat" title="Chat" subtitle="Realtime-ready conversation shell with offline-friendly UI state">
      <section className="grid h-[78vh] grid-rows-[auto,1fr,auto] gap-3">
        <div className="glass-card flex items-center gap-3 rounded-[2rem] p-3">
          <div className="h-12 w-12 rounded-[1.25rem] bg-gradient-to-br from-coral to-amber" />
          <div>
            <div className="text-sm font-semibold text-ink">Maya</div>
            <div className="text-xs text-black/55">{peerTyping ? "Typing..." : peerPresence === "online" ? "Online now" : "Offline"}</div>
          </div>
        </div>

        <div className="glass-card flex flex-col gap-3 overflow-y-auto rounded-[2rem] p-4">
          {messages.map((message) => (
            <div key={message.id} className={`max-w-[82%] rounded-[1.5rem] px-4 py-3 text-sm leading-6 ${message.senderUserId === "101" ? "ml-auto bg-ink text-white" : "bg-white text-ink"}`}>
              {message.messageType === "image" && message.imageUrl ? (
                <img alt="Shared in chat" className="mb-3 h-44 w-full rounded-[1.25rem] object-cover" src={message.imageUrl} />
              ) : null}
              {message.body ? <div>{message.body}</div> : null}
              <div className={`mt-2 text-[11px] ${message.senderUserId === "101" ? "text-white/55" : "text-black/45"}`}>
                {new Date(message.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                {message.senderUserId === "101" ? ` · ${message.deliveryStatus}` : ""}
              </div>
            </div>
          ))}
        </div>

        <div className="glass-card flex items-end gap-3 rounded-[2rem] p-3">
          <textarea
            className="min-h-12 flex-1 resize-none bg-transparent px-2 py-2 outline-none"
            placeholder="Write something good..."
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          <button className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-ink" onClick={sendDemoImage}>
            Image
          </button>
          <button className="rounded-2xl bg-ink px-4 py-3 text-sm font-medium text-white" onClick={sendTextMessage}>
            Send
          </button>
        </div>
      </section>
    </AppShell>
  );
}
