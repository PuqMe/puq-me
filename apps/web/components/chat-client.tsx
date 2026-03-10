"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage, ChatSocketEvent } from "@/lib/chat-types";
import { env } from "@/lib/env";

const DEMO_THREAD_ID = 1;
const DEMO_SELF_ID = "101";
const DEMO_TOKEN = "replace-with-jwt";
const API_BASE_URL = env.apiBaseUrl;
const WS_BASE_URL = env.websocketBaseUrl;

const fallbackMessages: ChatMessage[] = [
  {
    id: 1,
    threadId: DEMO_THREAD_ID,
    senderUserId: "202",
    senderPublicId: "demo-peer",
    messageType: "text",
    body: "You strike me as someone who knows the best late-night spots.",
    imageUrl: null,
    moderationStatus: "approved",
    deliveryStatus: "read",
    sentAt: new Date().toISOString()
  }
];

export function useChatClient() {
  const [messages, setMessages] = useState<ChatMessage[]>(fallbackMessages);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [peerTyping, setPeerTyping] = useState(false);
  const [peerPresence, setPeerPresence] = useState<"online" | "offline">("online");
  const typingTimeoutRef = useRef<number | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket(`${WS_BASE_URL}/ws/chat?token=${encodeURIComponent(DEMO_TOKEN)}&threadId=${DEMO_THREAD_ID}`);
    socketRef.current = socket;

    socket.addEventListener("message", (event) => {
      try {
        const data = JSON.parse(event.data) as ChatSocketEvent;

        if (data.type === "message.created") {
          setMessages((current) => {
            if (current.some((message) => message.id === data.payload.id)) {
              return current;
            }
            return [...current, data.payload];
          });

          if (data.payload.senderUserId !== DEMO_SELF_ID) {
            socket.send(
              JSON.stringify({
                type: "message.status",
                payload: {
                  messageId: data.payload.id,
                  status: "delivered"
                }
              })
            );
          }
        }

        if (data.type === "message.status") {
          setMessages((current) =>
            current.map((message) =>
              message.id === data.payload.messageId
                ? {
                    ...message,
                    deliveryStatus: data.payload.status,
                    deliveredAt: data.payload.status === "delivered" ? data.payload.updatedAt : message.deliveredAt,
                    readAt: data.payload.status === "read" ? data.payload.updatedAt : message.readAt
                  }
                : message
            )
          );
        }

        if (data.type === "typing" && data.payload.userId !== DEMO_SELF_ID) {
          setPeerTyping(data.payload.isTyping);
        }

        if (data.type === "presence" && data.payload.userId !== DEMO_SELF_ID) {
          setPeerPresence(data.payload.state);
        }
      } catch {
        return;
      }
    });

    return () => {
      socket.close();
    };
  }, []);

  async function sendMessage(messageType: "text" | "image", imageUrl?: string) {
    const body = draft.trim();
    if (messageType === "text" && !body) {
      return;
    }

    const response = await fetch(`${API_BASE_URL}/v1/chat/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEMO_TOKEN}`
      },
      body: JSON.stringify({
        threadId: DEMO_THREAD_ID,
        messageType,
        body: messageType === "text" ? body : null,
        imageUrl: imageUrl ?? null
      })
    });

    if (!response.ok) {
      return;
    }

    const message = (await response.json()) as ChatMessage;
    setMessages((current) => [...current, message]);
    setDraft("");
    setTyping(false);
    socketRef.current?.send(JSON.stringify({ type: "typing", payload: { isTyping: false } }));
  }

  function onDraftChange(value: string) {
    setDraft(value);
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    if (!typing) {
      setTyping(true);
      socketRef.current.send(JSON.stringify({ type: "typing", payload: { isTyping: true } }));
    }

    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = window.setTimeout(() => {
      setTyping(false);
      socketRef.current?.send(JSON.stringify({ type: "typing", payload: { isTyping: false } }));
    }, 1500);
  }

  async function sendDemoImage() {
    await sendMessage("image", "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80");
  }

  return {
    messages,
    draft,
    peerTyping,
    peerPresence,
    setDraft: onDraftChange,
    sendTextMessage: () => void sendMessage("text"),
    sendDemoImage: () => void sendDemoImage()
  };
}
