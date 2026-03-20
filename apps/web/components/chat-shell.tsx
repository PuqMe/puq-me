"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { useChatClient } from "@/components/chat-client";
import { useLanguage } from "@/lib/i18n";

export function ChatShell() {
  const { t } = useLanguage();
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
    <AppShell active="/chat" title={t.chatTitle} subtitle={t.chatSubtitle}>
      <section className="grid h-[78vh] grid-rows-[auto,auto,1fr,auto] gap-3">
        <div className="grid grid-cols-3 gap-2 text-[11px] font-medium">
          <div className="glass-card rounded-[1.2rem] px-3 py-3 text-white/82">{conversations.length} {t.chatsCount}</div>
          <div className="glass-card rounded-[1.2rem] px-3 py-3 text-white/82">{metaUnreadCount} {t.unreadCount}</div>
          <div className="glass-card rounded-[1.2rem] px-3 py-3 text-white/82">{t.sessionLive}</div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {conversations.map((conversation) => (
            <button
              key={conversation.conversationId}
              className={`rounded-[1.2rem] px-4 py-3 text-left text-sm ${conversation.conversationId === selectedConversationId ? "glow-button text-white" : "glass-card text-white/82"}`}
              onClick={() => setSelectedConversationId(conversation.conversationId)}
            >
              <div className="font-semibold">{conversation.peer.displayName}</div>
              <div className="mt-1 text-xs text-white/62">
                {conversation.unreadCount ? `${conversation.unreadCount} ${t.unreadCount}` : t.openChat}
              </div>
            </button>
          ))}
        </div>

        <div className="glass-card flex items-center gap-3 rounded-[1.75rem] p-3">
          <div className="h-12 w-12 rounded-[1.1rem] bg-gradient-to-br from-[#E6A77A] to-[#e9c98b]" />
          <div className="min-w-0">
            <div className="text-sm font-semibold text-white">
              {selectedConversation?.peer.displayName ?? t.noActiveChat}
            </div>
            <div className="text-xs text-white/62">
              {selectedConversation
                ? `${selectedConversation.peer.city ?? t.unknown} · ${selectedConversation.peer.age}`
                : t.chooseChat}
            </div>
          </div>
          <div className="ml-auto soft-pill rounded-full px-3 py-1.5 text-[11px] font-semibold">
            {selectedConversation?.status ?? "idle"}
          </div>
        </div>

        <div className="glass-card flex flex-col gap-3 overflow-y-auto rounded-[1.9rem] p-4">
          {errorMessage ? <div className="text-sm text-[#ffb4c7]">{errorMessage}</div> : null}

          {!isLoading && !errorMessage && conversations.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-white/20">
                <path d="M5 6.5h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9l-4 3v-3H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z"/>
              </svg>
              <div className="text-sm text-white/50">{t.noMatchChat}</div>
            </div>
          ) : null}

          {!isLoading && !errorMessage && conversations.length > 0 && !selectedConversation ? (
            <div className="text-sm text-white/72">{t.chooseChat}</div>
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
            placeholder={selectedConversation ? t.messagePlaceholder : t.noConversation}
            value={draft}
          />
          <button
            className="glow-button rounded-[1rem] px-4 py-3 text-sm font-semibold text-white"
            disabled={!selectedConversationId || isSending}
            onClick={() => void sendTextMessage()}
          >
            {isSending ? t.sending : t.send}
          </button>
        </div>
      </section>
    </AppShell>
  );
}
