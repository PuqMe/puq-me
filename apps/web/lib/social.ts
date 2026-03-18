"use client";

import { env } from "@/lib/env";
import { fetchWithSession } from "@/lib/auth";

export type DiscoverFeedItem = {
  userId: string;
  displayName: string;
  age: number;
  bio: string | null;
  city: string | null;
  countryCode: string | null;
  primaryPhotoUrl: string | null;
  distanceKm: number;
  profileQualityScore: number;
  activityScore: number;
  responseProbabilityScore: number;
  freshnessScore: number;
  feedScore: number;
  scoreBreakdown: {
    distance: number;
    ageFit: number;
    activity: number;
    profileQuality: number;
    responseProbability: number;
    freshness: number;
  };
};

export type DiscoverResponse = {
  items: DiscoverFeedItem[];
  cache: {
    hit: boolean;
    remaining: number;
  };
};

export type SwipeResponse = {
  swipeId: string;
  targetUserId: string;
  direction: "left" | "right" | "super";
  isMatch: boolean;
};

export type MatchItem = {
  matchId: string;
  status: "active" | "unmatched" | "blocked";
  matchedAt: string;
  peer: {
    userId: string;
    displayName: string;
    age: number;
    bio: string | null;
    city: string | null;
    countryCode: string | null;
    primaryPhotoUrl: string | null;
  };
  conversation: {
    conversationId: string | null;
    lastMessageAt: string | null;
  };
};

export type ConversationSummary = {
  conversationId: string;
  matchId: string;
  status: "active" | "archived" | "blocked";
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string | null;
  peer: {
    userId: string;
    displayName: string;
    age: number;
    bio: string | null;
    city: string | null;
    countryCode: string | null;
    primaryPhotoUrl: string | null;
  };
  lastMessage: {
    messageId: string;
    senderUserId: string;
    messageType: "text" | "image" | "system";
    body: string | null;
    mediaStorageKey: string | null;
    createdAt: string;
  } | null;
};

export type ConversationMessage = {
  messageId: string;
  conversationId: string;
  senderUserId: string;
  messageType: "text" | "image" | "system";
  body: string | null;
  attachment: {
    storageKey: string;
    mimeType: string | null;
    sizeBytes: number | null;
  } | null;
  moderationStatus: "approved" | "pending" | "review" | "blocked";
  deliveryStatus: "sent" | "delivered" | "read";
  deliveredAt: string | null;
  readAt: string | null;
  createdAt: string;
};

async function readApiError(response: Response) {
  try {
    const payload = (await response.json()) as {
      error?: string;
      message?: string;
      details?: {
        formErrors?: string[];
        fieldErrors?: Record<string, string[] | undefined>;
      };
    };

    if (payload.details?.formErrors?.[0]) {
      return payload.details.formErrors[0];
    }

    const firstFieldError = Object.values(payload.details?.fieldErrors ?? {}).flat().find(Boolean);
    if (firstFieldError) {
      return firstFieldError;
    }

    if (payload.message) {
      return payload.message;
    }

    if (payload.error) {
      return payload.error.replaceAll("_", " ");
    }
  } catch {
    return "Request failed.";
  }

  return "Request failed.";
}

async function expectOk(response: Response) {
  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  return response;
}

export async function fetchDiscoverFeed(limit = 12, refresh = false) {
  const response = await fetchWithSession(`${env.apiBaseUrl}/v1/swipe/discover?limit=${limit}&refresh=${refresh}`);
  await expectOk(response);
  return (await response.json()) as DiscoverResponse;
}

export async function createSwipe(targetUserId: string, direction: "left" | "right" | "super") {
  const response = await fetchWithSession(`${env.apiBaseUrl}/v1/swipe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ targetUserId, direction })
  });
  await expectOk(response);
  return (await response.json()) as SwipeResponse;
}

export async function fetchMatches() {
  const response = await fetchWithSession(`${env.apiBaseUrl}/v1/matches`);
  await expectOk(response);
  return (await response.json()) as MatchItem[];
}

export async function fetchConversations() {
  const response = await fetchWithSession(`${env.apiBaseUrl}/v1/chat/conversations`);
  await expectOk(response);
  return (await response.json()) as {
    items: ConversationSummary[];
    meta: {
      totalUnreadCount: number;
    };
  };
}

export async function fetchConversationMessages(conversationId: string) {
  const response = await fetchWithSession(`${env.apiBaseUrl}/v1/chat/conversations/${conversationId}/messages`);
  await expectOk(response);
  return (await response.json()) as {
    items: ConversationMessage[];
    meta: {
      nextCursor: string | null;
      hasMore: boolean;
    };
  };
}

export async function sendConversationMessage(conversationId: string, body: string) {
  const response = await fetchWithSession(`${env.apiBaseUrl}/v1/chat/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      conversationId,
      messageType: "text",
      body
    })
  });
  await expectOk(response);
  return (await response.json()) as {
    message: ConversationMessage;
  };
}

export async function markConversationRead(conversationId: string) {
  const response = await fetchWithSession(`${env.apiBaseUrl}/v1/chat/conversations/read`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ conversationId })
  });
  await expectOk(response);
  return response.json();
}
