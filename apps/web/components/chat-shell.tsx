"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { useChatClient } from "@/components/chat-client";

export function ChatShell() {
  const searchParams = useSearchParams();
  const initialConversationId = useMemo(() => searchParams.get("conversationId"), [searchParams]);
  const {
    conversations,
    messages,
    selectedConversation,
    selectedConversationId,
    selfUserId,
    draft,
    isLoading,
    isSending,
    errorMessage,
    metaUnreadCount,
    setDraft,
    setSelectedConversationId,
    sendTextMessage
  } = useChatClient(initialConversationId);

  return (
    <AppShell active="/chat" title="Chat" subtitle="Echte Conversations, echte Messages und echte Session statt Demo-Thread">
      <section className="grid h-[78vh] grid-rows-[auto,auto,1fr,auto] gap-3">
        <div className="grid grid-cols-3 gap-2 text-[11px] font-medium">
          <div className="glass-card rounded-[1.2rem] px-3 py-3 text-white/82">{conversations.length} chats</div>
          <div className="glass-card rounded-[1.2rem] px-3 py-3 text-white/82">{metaUnreadCount} unread</div>
          <div className="glass-card rounded-[1.2rem] px-3 py-3 text-white/82">Session live</div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {conversations.map((conversation) => (
            <button
              key={conversation.conversationId}
              className={`rounded-[1.2rem] px-4 py-3 text-left text-sm ${conversation.conversationId === selectedConversationId ? "glow-button text-white" : "glass-card text-white/82"}`}
              onClick={() => setSelectedConversationId(conversation.conversationId)}
            >
              <div className="font-semibold">{conversation.peer.displayName}</div>
              <div className="mt-1 text-xs text-white/62">{conversation.unreadCount ? `${conversation.unreadCount} unread` : "Open chat"}</div>
            </button>
          ))}
        </div>

        <div className="glass-card flex items-center gap-3 rounded-[1.75rem] p-3">
          <div className="h-12 w-12 rounded-[1.1rem] bg-gradient-to-br from-[#E6A77A] to-[#e9c98b]" />
          <div className="min-w-0">
            <div className="text-sm font-semibold text-white">{selectedConversation?.peer.displayName ?? "Noch kein Chat aktiv"}</div>
            <div className="text-xs text-white/62">
              {selectedConversation ? `${selectedConversation.peer.city ?? "Unbekannt"} · ${selectedConversation.peer.age}` : "Waehle links eine Conversation"}
            </div>
          </div>
          <div className="ml-auto soft-pill rounded-full px-3 py-1.5 text-[11px] font-semibold">
            {selectedConversation?.status ?? "idle"}
          </div>
        </div>

        <div className="glass-card flex flex-col gap-3 overflow-y-auto rounded-[1.9rem] p-4">
          {isLoading ? <div className="text-sm text-white/72">Chat wird geladen...</div> : null}
          {errorMessage ? <div className="text-sm text-[#ffb4c7]">{errorMessage}</div> : null}

          {!isLoading && !errorMessage && !selectedConversation ? (
            <div className="text-sm text-white/72">Sobald dein erster Match-Chat existiert, erscheint er hier.</div>
          ) : null}

          {messages.map((message) => {
            const isOwn = message.senderUserId === selfUserId;

            return (
              <div
                key={message.messageId}
                className={`max-w-[84%] rounded-[1.35rem] px-4 py-3 text-sm leading-6 ${isOwn ? "ml-auto bg-[#A855F7]/85 text-white" : "bg-white/10 text-white"}`}
              >
                {message.body ? <div>{message.body}</div> : null}
                <div className="mt-2 text-[11px] text-white/55">
                  {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  {isOwn ? ` · ${message.deliveryStatus}` : ""}
                </div>
              </div>
            );
          })}
        </div>

        <div className="glass-card flex items-end gap-2 rounded-[1.75rem] p-3">
          <textarea
            className="min-h-11 flex-1 resize-none rounded-[1rem] bg-white/10 px-3 py-3 text-white outline-none placeholder:text-white/45"
            onChange={(event) => setDraft(event.target.value)}
            placeholder={selectedConversation ? "Write a simple message..." : "Waehle erst einen Chat"}
            value={draft}
          />
          <button className="glow-button rounded-[1rem] px-4 py-3 text-sm font-semibold text-white" disabled={!selectedConversationId || isSending} onClick={() => void sendTextMessage()}>
            {isSending ? "Send..." : "Send"}
          </button>
        </div>
      </section>
    </AppShell>
  );
}
