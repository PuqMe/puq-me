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

// ── Nearby / Location types ──

export type NearbyUser = {
  userId: string;
  displayName: string;
  age: number;
  bio: string | null;
  city: string | null;
  primaryPhotoUrl: string | null;
  distanceKm: number;
  lastActiveAt: string | null;
  isOnline: boolean;
  latitude?: number;
  longitude?: number;
};

export type NearbyResponse = {
  items: NearbyUser[];
  meta: {
    totalNearby: number;
    radarViews: number;
  };
};

export type CircleEncounter = {
  userId: string;
  displayName: string;
  age: number;
  area: string;
  primaryPhotoUrl: string | null;
  mutual: boolean;
  timestamp: string;
  distanceKm: number;
  encounterCount: number;
};

export type CircleEncounterResponse = {
  items: CircleEncounter[];
  meta: {
    totalEncounters: number;
    period: string;
  };
};

export type FriendCircle = {
  circleId: string;
  name: string;
  emoji: string;
  members: {
    userId: string;
    displayName: string;
    primaryPhotoUrl: string | null;
    isOnline: boolean;
  }[];
  settings: {
    locationSharing: boolean;
    presenceSharing: boolean;
    availabilitySharing: boolean;
  };
};

export type CircleListResponse = {
  items: FriendCircle[];
};

// ── Fallback data for when API is unreachable ──

function fallbackNearbyUsers(): NearbyResponse {
  return {
    items: [
      { userId: "demo-1", displayName: "Alex", age: 28, bio: null, city: "Berlin", primaryPhotoUrl: null, distanceKm: 1.8, lastActiveAt: new Date(Date.now() - 2 * 60000).toISOString(), isOnline: true },
      { userId: "demo-2", displayName: "Jordan", age: 26, bio: null, city: "Berlin", primaryPhotoUrl: null, distanceKm: 2.4, lastActiveAt: new Date(Date.now() - 4 * 60000).toISOString(), isOnline: true },
      { userId: "demo-3", displayName: "Casey", age: 30, bio: null, city: "Berlin", primaryPhotoUrl: null, distanceKm: 3.1, lastActiveAt: new Date(Date.now() - 8 * 60000).toISOString(), isOnline: false },
      { userId: "demo-4", displayName: "Morgan", age: 27, bio: null, city: "Berlin", primaryPhotoUrl: null, distanceKm: 3.8, lastActiveAt: new Date(Date.now() - 12 * 60000).toISOString(), isOnline: false },
      { userId: "demo-5", displayName: "Riley", age: 25, bio: null, city: "Berlin", primaryPhotoUrl: null, distanceKm: 4.5, lastActiveAt: new Date(Date.now() - 20 * 60000).toISOString(), isOnline: true },
    ],
    meta: { totalNearby: 5, radarViews: Math.floor(Math.random() * 16) + 5 },
  };
}

function fallbackEncounters(): CircleEncounterResponse {
  return {
    items: [
      { userId: "demo-1", displayName: "Maya", age: 29, area: "Kreuzberg", primaryPhotoUrl: null, mutual: true, timestamp: "14:30", distanceKm: 0.8, encounterCount: 2 },
      { userId: "demo-2", displayName: "Noor", age: 26, area: "Neuköln", primaryPhotoUrl: null, mutual: false, timestamp: "11:15", distanceKm: 1.2, encounterCount: 1 },
    ],
    meta: { totalEncounters: 2, period: "24h" },
  };
}

function fallbackCircles(): CircleListResponse {
  return {
    items: [
      {
        circleId: "demo-close", name: "Close Friends", emoji: "💜",
        members: [
          { userId: "m1", displayName: "Maya", primaryPhotoUrl: null, isOnline: true },
          { userId: "m2", displayName: "Emma", primaryPhotoUrl: null, isOnline: false },
          { userId: "m3", displayName: "Lukas", primaryPhotoUrl: null, isOnline: true },
          { userId: "m4", displayName: "Anna", primaryPhotoUrl: null, isOnline: false },
        ],
        settings: { locationSharing: true, presenceSharing: true, availabilitySharing: true },
      },
      {
        circleId: "demo-work", name: "Colleagues", emoji: "💼",
        members: [
          { userId: "w1", displayName: "Jan", primaryPhotoUrl: null, isOnline: false },
          { userId: "w2", displayName: "Kim", primaryPhotoUrl: null, isOnline: true },
          { userId: "w3", displayName: "Ben", primaryPhotoUrl: null, isOnline: false },
          { userId: "w4", displayName: "Clara", primaryPhotoUrl: null, isOnline: false },
        ],
        settings: { locationSharing: false, presenceSharing: true, availabilitySharing: false },
      },
      {
        circleId: "demo-sport", name: "Sport Group", emoji: "⚽",
        members: [
          { userId: "s1", displayName: "Tim", primaryPhotoUrl: null, isOnline: true },
          { userId: "s2", displayName: "Max", primaryPhotoUrl: null, isOnline: false },
          { userId: "s3", displayName: "Robin", primaryPhotoUrl: null, isOnline: false },
          { userId: "s4", displayName: "Sam", primaryPhotoUrl: null, isOnline: true },
        ],
        settings: { locationSharing: true, presenceSharing: false, availabilitySharing: false },
      },
    ],
  };
}

// ── API Functions ──

export async function fetchNearbyUsers(lat: number, lon: number, limit = 20): Promise<NearbyResponse> {
  try {
    const response = await fetchWithSession(
      `${env.apiBaseUrl}/v1/swipe/radar?limit=${limit}&refresh=false&lat=${lat}&lon=${lon}`
    );
    if (shouldUseLocalAppFallback(response)) {
      return fallbackNearbyUsers();
    }
    await expectOk(response);
    const data = await response.json() as RadarResponse;
    // Map RadarFeedItem to NearbyUser
    return {
      items: data.items.map(item => ({
        userId: item.userId,
        displayName: item.displayName,
        age: item.age,
        bio: item.bio,
        city: item.city,
        primaryPhotoUrl: item.primaryPhotoUrl,
        distanceKm: item.distanceKm,
        lastActiveAt: null,
        isOnline: item.activityScore > 0.5,
      })),
      meta: {
        totalNearby: data.items.length,
        radarViews: data.cache?.remaining ?? Math.floor(Math.random() * 16) + 5,
      },
    };
  } catch (error) {
    if (shouldUseLocalAppFallbackForError(error)) {
      return fallbackNearbyUsers();
    }
    throw error;
  }
}

export async function updateMyLocation(latitude: number, longitude: number, city?: string) {
  try {
    const response = await fetchWithSession(`${env.apiBaseUrl}/v1/profiles/me/location`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ latitude, longitude, city }),
    });
    if (shouldUseLocalAppFallback(response)) return;
    await expectOk(response);
  } catch (error) {
    if (shouldUseLocalAppFallbackForError(error)) return;
    throw error;
  }
}

export async function postLocationEvent(lat: number, lon: number, accuracyMeters: number = 50) {
  try {
    const response = await fetchWithSession(`${env.apiBaseUrl}/v1/circle/location-events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lat, lon, accuracyMeters }),
    });
    if (shouldUseLocalAppFallback(response)) return;
    await expectOk(response);
  } catch (error) {
    if (shouldUseLocalAppFallbackForError(error)) return;
    throw error;
  }
}

export async function fetchCircleEncounters(window: string = "24h", lat?: number, lon?: number): Promise<CircleEncounterResponse> {
  try {
    let url = `${env.apiBaseUrl}/v1/circle/encounters?window=${window}`;
    if (lat !== undefined && lon !== undefined) {
      url += `&lat=${lat}&lon=${lon}`;
    }
    const response = await fetchWithSession(url);
    if (shouldUseLocalAppFallback(response)) {
      return fallbackEncounters();
    }
    await expectOk(response);
    return (await response.json()) as CircleEncounterResponse;
  } catch (error) {
    if (shouldUseLocalAppFallbackForError(error)) {
      return fallbackEncounters();
    }
    throw error;
  }
}

export async function fetchMyCircles(): Promise<CircleListResponse> {
  try {
    const response = await fetchWithSession(`${env.apiBaseUrl}/v1/circle/groups`);
    if (shouldUseLocalAppFallback(response)) {
      return fallbackCircles();
    }
    await expectOk(response);
    return (await response.json()) as CircleListResponse;
  } catch (error) {
    if (shouldUseLocalAppFallbackForError(error)) {
      return fallbackCircles();
    }
    throw error;
  }
}

export async function createCircle(name: string, emoji: string): Promise<FriendCircle | null> {
  try {
    const response = await fetchWithSession(`${env.apiBaseUrl}/v1/circle/groups`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, emoji }),
    });
    if (shouldUseLocalAppFallback(response)) return null;
    await expectOk(response);
    return (await response.json()) as FriendCircle;
  } catch (error) {
    if (shouldUseLocalAppFallbackForError(error)) return null;
    throw error;
  }
}

export async function updateCircleSettings(circleId: string, settings: Partial<FriendCircle["settings"]>) {
  try {
    const response = await fetchWithSession(`${env.apiBaseUrl}/v1/circle/groups/${circleId}/settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    if (shouldUseLocalAppFallback(response)) return;
    await expectOk(response);
  } catch (error) {
    if (shouldUseLocalAppFallbackForError(error)) return;
    throw error;
  }
}

export async function sendWave(targetUserId: string) {
  try {
    const response = await fetchWithSession(`${env.apiBaseUrl}/v1/swipe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId, direction: "right" }),
    });
    if (shouldUseLocalAppFallback(response)) return { swipeId: "demo", targetUserId, direction: "right" as const, isMatch: Math.random() > 0.7 };
    await expectOk(response);
    return (await response.json()) as SwipeResponse;
  } catch (error) {
    if (shouldUseLocalAppFallbackForError(error)) return { swipeId: "demo", targetUserId, direction: "right" as const, isMatch: false };
    throw error;
  }
}

export async function registerPushDevice(subscription: PushSubscription) {
  try {
    const keys = subscription.toJSON().keys;
    const response = await fetchWithSession(`${env.apiBaseUrl}/v1/notifications/devices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        platform: "web",
        provider: "web_push",
        token: subscription.endpoint,
        endpoint: subscription.endpoint,
        keys: {
          p256dh: keys?.p256dh ?? "",
          auth: keys?.auth ?? "",
        },
        locale: navigator.language?.split("-")[0] || "en",
      }),
    });
    if (shouldUseLocalAppFallback(response)) return;
    await expectOk(response);
  } catch (error) {
    if (shouldUseLocalAppFallbackForError(error)) return;
    throw error;
  }
}

export async function updateFreeNowStatus(enabled: boolean) {
  try {
    const response = await fetchWithSession(`${env.apiBaseUrl}/v1/profiles/me/visibility`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ freeNow: enabled }),
    });
    if (shouldUseLocalAppFallback(response)) return;
    await expectOk(response);
  } catch (error) {
    if (shouldUseLocalAppFallbackForError(error)) return;
    throw error;
  }
}
