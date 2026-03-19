"use client";

import { env } from "@/lib/env";
import { fetchWithSession } from "@/lib/auth";
import {
  createFallbackSwipe,
  fetchFallbackConversationMessages,
  fetchFallbackConversations,
  fetchFallbackRadarFeed,
  fetchFallbackMatches,
  markFallbackConversationRead,
  sendFallbackConversationMessage,
  shouldUseLocalAppFallback,
  shouldUseLocalAppFallbackForError
} from "@/lib/local-app-fallback";

export type RadarFeedItem = {
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

export type RadarResponse = {
  items: RadarFeedItem[];
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

export async function fetchRadarFeed(limit = 12, refresh = false) {
  try {
    const response = await fetchWithSession(`${env.apiBaseUrl}/v1/swipe/radar?limit=${limit}&refresh=${refresh}`);
    if (shouldUseLocalAppFallback(response)) {
      return fetchFallbackRadarFeed(limit) as RadarResponse;
    }

    await expectOk(response);
    return (await response.json()) as RadarResponse;
  } catch (error) {
    if (shouldUseLocalAppFallbackForError(error)) {
      return fetchFallbackRadarFeed(limit) as RadarResponse;
    }

    throw error;
  }
}

export async function createSwipe(targetUserId: string, direction: "left" | "right" | "super") {
  try {
    const response = await fetchWithSession(`${env.apiBaseUrl}/v1/swipe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId, direction })
    });
    if (shouldUseLocalAppFallback(response)) {
      return createFallbackSwipe(targetUserId, direction) as SwipeResponse;
    }

    await expectOk(response);
    return (await response.json()) as SwipeResponse;
  } catch (error) {
    if (shouldUseLocalAppFallbackForError(error)) {
      return createFallbackSwipe(targetUserId, direction) as SwipeResponse;
    }

    throw error;
  }
}

export async function fetchMatches() {
  try {
    const response = await fetchWithSession(`${env.apiBaseUrl}/v1/matches`);
    if (shouldUseLocalAppFallback(response)) {
      return fetchFallbackMatches() as MatchItem[];
    }

    await expectOk(response);
    return (await response.json()) as MatchItem[];
  } catch (error) {
    if (shouldUseLocalAppFallbackForError(error)) {
      return fetchFallbackMatches() as MatchItem[];
    }

    throw error;
  }
}

export async function fetchConversations() {
  try {
    const response = await fetchWithSession(`${env.apiBaseUrl}/v1/chat/conversations`);
    if (shouldUseLocalAppFallback(response)) {
      return fetchFallbackConversations() as {
        items: ConversationSummary[];
        meta: {
          totalUnreadCount: number;
        };
      };
    }

    await expectOk(response);
    return (await response.json()) as {
      items: ConversationSummary[];
      meta: {
        totalUnreadCount: number;
      };
    };
  } catch (error) {
    if (shouldUseLocalAppFallbackForError(error)) {
      return fetchFallbackConversations() as {
        items: ConversationSummary[];
        meta: {
          totalUnreadCount: number;
        };
      };
    }

    throw error;
  }
}

export async function fetchConversationMessages(conversationId: string) {
  try {
    const response = await fetchWithSession(`${env.apiBaseUrl}/v1/chat/conversations/${conversationId}/messages`);
    if (shouldUseLocalAppFallback(response)) {
      return fetchFallbackConversationMessages(conversationId) as {
        items: ConversationMessage[];
        meta: {
          nextCursor: string | null;
          hasMore: boolean;
        };
      };
    }

    await expectOk(response);
    return (await response.json()) as {
      items: ConversationMessage[];
      meta: {
        nextCursor: string | null;
        hasMore: boolean;
      };
    };
  } catch (error) {
    if (shouldUseLocalAppFallbackForError(error)) {
      return fetchFallbackConversationMessages(conversationId) as {
        items: ConversationMessage[];
        meta: {
          nextCursor: string | null;
          hasMore: boolean;
        };
      };
    }

    throw error;
  }
}

export async function sendConversationMessage(conversationId: string, body: string) {
  try {
    const response = await fetchWithSession(`${env.apiBaseUrl}/v1/chat/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId,
        messageType: "text",
        body
      })
    });
    if (shouldUseLocalAppFallback(response)) {
      return sendFallbackConversationMessage(conversationId, body) as {
        message: ConversationMessage;
      };
    }

    await expectOk(response);
    return (await response.json()) as {
      message: ConversationMessage;
    };
  } catch (error) {
    if (shouldUseLocalAppFallbackForError(error)) {
      return sendFallbackConversationMessage(conversationId, body) as {
        message: ConversationMessage;
      };
    }

    throw error;
  }
}

export async function markConversationRead(conversationId: string) {
  try {
    const response = await fetchWithSession(`${env.apiBaseUrl}/v1/chat/conversations/read`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId })
    });
    if (shouldUseLocalAppFallback(response)) {
      return markFallbackConversationRead(conversationId);
    }

    await expectOk(response);
    return response.json();
  } catch (error) {
    if (shouldUseLocalAppFallbackForError(error)) {
      return markFallbackConversationRead(conversationId);
    }

    throw error;
  }
}
