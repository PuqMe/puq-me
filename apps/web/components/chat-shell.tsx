"use client";

import { AppShell } from "@/components/app-shell";
import { useChatClient } from "@/components/chat-client";

export function ChatShell() {
  const { messages, draft, peerTyping, peerPresence, setDraft, sendTextMessage, sendDemoImage } = useChatClient();

  return (
    <AppShell active="/chat" title="Chat" subtitle="Everything important in one screen: conversation, status and quick reply">
      <section className="grid h-[78vh] grid-rows-[auto,auto,1fr,auto] gap-3">
        <div className="grid grid-cols-2 gap-2 text-[11px] font-medium">
          <div className="glass-card rounded-[1.2rem] px-3 py-3 text-white/82">Unread first</div>
          <div className="glass-card rounded-[1.2rem] px-3 py-3 text-white/82">Fast replies</div>
        </div>

        <div className="glass-card flex items-center gap-3 rounded-[1.75rem] p-3">
          <div className="h-12 w-12 rounded-[1.1rem] bg-gradient-to-br from-[#E6A77A] to-[#e9c98b]" />
          <div className="min-w-0">
            <div className="text-sm font-semibold text-white">Maya</div>
            <div className="text-xs text-white/62">{peerTyping ? "Typing..." : peerPresence === "online" ? "Online now" : "Offline"}</div>
          </div>
          <div className="ml-auto soft-pill rounded-full px-3 py-1.5 text-[11px] font-semibold">Reply fast</div>
        </div>

        <div className="glass-card flex items-center gap-2 rounded-[1.25rem] px-3 py-2.5 text-sm text-white/72">
          <span className="soft-pill rounded-full px-2.5 py-1 text-[11px] font-semibold">Tip</span>
          Keep messages short to make starting a conversation easier.
        </div>

        <div className="glass-card flex flex-col gap-3 overflow-y-auto rounded-[1.9rem] p-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`max-w-[84%] rounded-[1.35rem] px-4 py-3 text-sm leading-6 ${message.senderUserId === "101" ? "ml-auto bg-[#A855F7]/85 text-white" : "bg-white/10 text-white"}`}
            >
              {message.messageType === "image" && message.imageUrl ? (
                <img alt="Shared in chat" className="mb-3 h-40 w-full rounded-[1rem] object-cover" src={message.imageUrl} />
              ) : null}
              {message.body ? <div>{message.body}</div> : null}
              <div className={`mt-2 text-[11px] ${message.senderUserId === "101" ? "text-white/55" : "text-white/55"}`}>
                {new Date(message.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                {message.senderUserId === "101" ? ` · ${message.deliveryStatus}` : ""}
              </div>
            </div>
          ))}
        </div>

        <div className="glass-card flex items-end gap-2 rounded-[1.75rem] p-3">
          <textarea
            className="min-h-11 flex-1 resize-none rounded-[1rem] bg-white/10 px-3 py-3 text-white outline-none placeholder:text-white/45"
            placeholder="Write a simple message..."
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          <button className="glass-card rounded-[1rem] px-3 py-3 text-sm font-semibold text-white" onClick={sendDemoImage}>
            Photo
          </button>
          <button className="glow-button rounded-[1rem] px-4 py-3 text-sm font-semibold text-white" onClick={sendTextMessage}>
            Send
          </button>
        </div>
      </section>
    </AppShell>
  );
}
