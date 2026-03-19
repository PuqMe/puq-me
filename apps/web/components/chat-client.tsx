"use client";

import { useEffect, useState } from "react";
import {
  fetchConversationMessages,
  fetchConversations,
  markConversationRead,
  sendConversationMessage,
  type ConversationMessage,
  type ConversationSummary
} from "@/lib/social";
import { readStoredUser } from "@/lib/auth";

export function useChatClient(initialConversationId?: string | null) {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(initialConversationId ?? null);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [metaUnreadCount, setMetaUnreadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const data = await fetchConversations();
        if (cancelled) {
          return;
        }

        setConversations(data.items);
        setMetaUnreadCount(data.meta.totalUnreadCount);

        const preferredConversation =
          (initialConversationId && data.items.find((item) => item.conversationId === initialConversationId)?.conversationId) ??
          data.items[0]?.conversationId ??
          null;

        setSelectedConversationId(preferredConversation);
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error instanceof Error ? error.message : "Could not load conversations.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [initialConversationId]);

  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([]);
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const data = await fetchConversationMessages(selectedConversationId);
        if (cancelled) {
          return;
        }

        setMessages(data.items);
        await markConversationRead(selectedConversationId);
        setConversations((current) =>
          current.map((conversation) =>
            conversation.conversationId === selectedConversationId ? { ...conversation, unreadCount: 0 } : conversation
          )
        );
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error instanceof Error ? error.message : "Could not load messages.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedConversationId]);

  const selectedConversation =
    conversations.find((conversation) => conversation.conversationId === selectedConversationId) ?? null;
  const selfUserId = readStoredUser()?.id ?? "";

  async function sendTextMessage() {
    const body = draft.trim();
    if (!selectedConversationId || !body || isSending) {
      return;
    }

    setIsSending(true);
    setErrorMessage(null);

    try {
      const result = await sendConversationMessage(selectedConversationId, body);
      setMessages((current) => [...current, result.message]);
      setDraft("");
      setConversations((current) =>
        current.map((conversation) =>
          conversation.conversationId === selectedConversationId
            ? {
                ...conversation,
                updatedAt: result.message.createdAt,
                lastMessageAt: result.message.createdAt,
                lastMessage: {
                  messageId: result.message.messageId,
                  senderUserId: result.message.senderUserId,
                  messageType: result.message.messageType,
                  body: result.message.body,
                  mediaStorageKey: result.message.attachment?.storageKey ?? null,
                  createdAt: result.message.createdAt
                }
              }
            : conversation
        )
      );
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not send message.");
    } finally {
      setIsSending(false);
    }
  }

  return {
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
  };
}
