"use client";

import { env } from "@/lib/env";

type SessionUser = {
  id: string;
  email: string;
  status: string;
};

type SessionTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  refreshExpiresIn: string;
};

export type FallbackAuthResponse = {
  user: SessionUser;
  tokens: SessionTokens;
};

export type FallbackProfileResponse = {
  userId: string;
  profile: {
    displayName: string;
    birthDate: string;
    bio: string | null;
    gender: string | null;
    datingIntent: string | null;
    occupation: string | null;
    city: string | null;
    countryCode: string | null;
    isVisible: boolean;
  };
  interests: string[];
  preferences: {
    interestedIn: string[];
    minAge: number;
    maxAge: number;
    maxDistanceKm: number;
    showMeGlobally: boolean;
    onlyVerifiedProfiles: boolean;
  };
  location: {
    latitude: number;
    longitude: number;
    city: string | null;
    countryCode: string | null;
  } | null;
};

export type FallbackDiscoverFeedItem = {
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

export type FallbackSwipeResponse = {
  swipeId: string;
  targetUserId: string;
  direction: "left" | "right" | "super";
  isMatch: boolean;
};

export type FallbackMatchItem = {
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

export type FallbackConversationSummary = {
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

export type FallbackConversationMessage = {
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

type FallbackState = {
  profiles: Record<string, FallbackProfileResponse>;
  swipes: Record<string, Array<{ targetUserId: string; direction: "left" | "right" | "super"; createdAt: string }>>;
  matches: Record<string, FallbackMatchItem[]>;
  conversations: Record<string, FallbackConversationSummary[]>;
  messages: Record<string, FallbackConversationMessage[]>;
};

const fallbackStateKey = "puqme.local-app-fallback.v1";
const sessionStorageKey = "puqme.session.user";

const seededPeople: FallbackDiscoverFeedItem[] = [
  {
    userId: "fall-jules",
    displayName: "Jules",
    age: 29,
    bio: "Creative strategist, walks fast, laughs louder, liebt spontane Rooftop-Abende.",
    city: "Berlin",
    countryCode: "DE",
    primaryPhotoUrl: null,
    distanceKm: 2.4,
    profileQualityScore: 92,
    activityScore: 81,
    responseProbabilityScore: 84,
    freshnessScore: 88,
    feedScore: 91,
    scoreBreakdown: { distance: 90, ageFit: 86, activity: 81, profileQuality: 92, responseProbability: 84, freshness: 88 }
  },
  {
    userId: "fall-maya",
    displayName: "Maya",
    age: 27,
    bio: "Product designer, matcha fan, sucht Tiefgang ohne Drama.",
    city: "Hamburg",
    countryCode: "DE",
    primaryPhotoUrl: null,
    distanceKm: 5.8,
    profileQualityScore: 89,
    activityScore: 78,
    responseProbabilityScore: 79,
    freshnessScore: 91,
    feedScore: 87,
    scoreBreakdown: { distance: 82, ageFit: 88, activity: 78, profileQuality: 89, responseProbability: 79, freshness: 91 }
  },
  {
    userId: "fall-enzo",
    displayName: "Enzo",
    age: 31,
    bio: "Chef, Nachteule, lebt fuer gute Gespraeche und noch bessere Pasta.",
    city: "Milan",
    countryCode: "IT",
    primaryPhotoUrl: null,
    distanceKm: 7.1,
    profileQualityScore: 85,
    activityScore: 83,
    responseProbabilityScore: 76,
    freshnessScore: 80,
    feedScore: 84,
    scoreBreakdown: { distance: 77, ageFit: 85, activity: 83, profileQuality: 85, responseProbability: 76, freshness: 80 }
  },
  {
    userId: "fall-lina",
    displayName: "Lina",
    age: 26,
    bio: "Founder energy, museum dates, klarer Kopf und schneller Humor.",
    city: "Amsterdam",
    countryCode: "NL",
    primaryPhotoUrl: null,
    distanceKm: 9.3,
    profileQualityScore: 94,
    activityScore: 87,
    responseProbabilityScore: 82,
    freshnessScore: 90,
    feedScore: 93,
    scoreBreakdown: { distance: 73, ageFit: 90, activity: 87, profileQuality: 94, responseProbability: 82, freshness: 90 }
  }
];

function isBrowser() {
  return typeof window !== "undefined";
}

function slugifyEmail(email: string) {
  return email.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function readStoredSessionUser() {
  if (!isBrowser()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(sessionStorageKey);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

function createDefaultProfile(user: SessionUser): FallbackProfileResponse {
  const handle = user.email.split("@")[0]?.replace(/[^a-z0-9]+/gi, " ").trim() || "PuQ User";
  const displayName = handle.charAt(0).toUpperCase() + handle.slice(1);

  return {
    userId: user.id,
    profile: {
      displayName,
      birthDate: "",
      bio: null,
      gender: null,
      datingIntent: "meaningful_connection",
      occupation: null,
      city: null,
      countryCode: "DE",
      isVisible: true
    },
    interests: [],
    preferences: {
      interestedIn: [],
      minAge: 24,
      maxAge: 38,
      maxDistanceKm: 25,
      showMeGlobally: false,
      onlyVerifiedProfiles: false
    },
    location: null
  };
}

function defaultState(): FallbackState {
  return {
    profiles: {},
    swipes: {},
    matches: {},
    conversations: {},
    messages: {}
  };
}

function loadState() {
  if (!isBrowser()) {
    return defaultState();
  }

  try {
    const raw = window.localStorage.getItem(fallbackStateKey);
    return raw ? ({ ...defaultState(), ...(JSON.parse(raw) as FallbackState) }) : defaultState();
  } catch {
    return defaultState();
  }
}

function saveState(state: FallbackState) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(fallbackStateKey, JSON.stringify(state));
}

function ensureUserState(user: SessionUser) {
  const state = loadState();

  if (!state.profiles[user.id]) {
    state.profiles[user.id] = createDefaultProfile(user);
  }

  state.swipes[user.id] ??= [];
  state.matches[user.id] ??= [];
  state.conversations[user.id] ??= [];

  saveState(state);
  return state;
}

function currentIsoTime() {
  return new Date().toISOString();
}

function buildConversationFromMatch(match: FallbackMatchItem): FallbackConversationSummary {
  return {
    conversationId: match.conversation.conversationId ?? `${match.matchId}-conversation`,
    matchId: match.matchId,
    status: "active",
    unreadCount: 1,
    createdAt: match.matchedAt,
    updatedAt: match.matchedAt,
    lastMessageAt: match.matchedAt,
    peer: match.peer,
    lastMessage: {
      messageId: `${match.matchId}-hello`,
      senderUserId: match.peer.userId,
      messageType: "text",
      body: `Hey, ich bin ${match.peer.displayName}. Lust auf ein echtes erstes Gespraech?`,
      mediaStorageKey: null,
      createdAt: match.matchedAt
    }
  };
}

function buildMessagesForConversation(conversation: FallbackConversationSummary): FallbackConversationMessage[] {
  if (!conversation.lastMessage) {
    return [];
  }

  return [
    {
      messageId: conversation.lastMessage.messageId,
      conversationId: conversation.conversationId,
      senderUserId: conversation.lastMessage.senderUserId,
      messageType: conversation.lastMessage.messageType,
      body: conversation.lastMessage.body,
      attachment: null,
      moderationStatus: "approved",
      deliveryStatus: "read",
      deliveredAt: conversation.lastMessage.createdAt,
      readAt: conversation.lastMessage.createdAt,
      createdAt: conversation.lastMessage.createdAt
    }
  ];
}

export function shouldUseLocalAppFallback(response?: Response) {
  return Boolean(response && response.status === 404 && env.apiBaseUrl.includes("api.puq.me"));
}

export function shouldUseLocalAppFallbackForError(error: unknown) {
  return env.apiBaseUrl.includes("api.puq.me") && error instanceof TypeError;
}

export function createFallbackSession(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const slug = slugifyEmail(normalizedEmail || "guest@puq.me");

  const session: FallbackAuthResponse = {
    user: {
      id: `fallback-${slug || "user"}`,
      email: normalizedEmail || "guest@puq.me",
      status: "active"
    },
    tokens: {
      accessToken: `fallback-access-${slug || "user"}`,
      refreshToken: `fallback-refresh-${slug || "user"}`,
      expiresIn: "15m",
      refreshExpiresIn: "30d"
    }
  };

  ensureUserState(session.user);
  return session;
}

export function fetchFallbackProfile() {
  const user = readStoredSessionUser();
  if (!user) {
    throw new Error("Bitte zuerst einloggen.");
  }

  const state = ensureUserState(user);
  return state.profiles[user.id];
}

export function updateFallbackProfile(input: Partial<FallbackProfileResponse["profile"]>) {
  const user = readStoredSessionUser();
  if (!user) {
    throw new Error("Bitte zuerst einloggen.");
  }

  const state = ensureUserState(user);
  const currentProfile = state.profiles[user.id]!;
  state.profiles[user.id] = {
    ...currentProfile,
    profile: {
      ...currentProfile.profile,
      ...input
    }
  };

  saveState(state);
  return state.profiles[user.id]!;
}

export function updateFallbackInterests(interests: string[]) {
  const user = readStoredSessionUser();
  if (!user) {
    throw new Error("Bitte zuerst einloggen.");
  }

  const state = ensureUserState(user);
  state.profiles[user.id] = {
    ...state.profiles[user.id]!,
    interests
  };
  saveState(state);
  return state.profiles[user.id]!;
}

export function updateFallbackPreferences(input: FallbackProfileResponse["preferences"]) {
  const user = readStoredSessionUser();
  if (!user) {
    throw new Error("Bitte zuerst einloggen.");
  }

  const state = ensureUserState(user);
  state.profiles[user.id] = {
    ...state.profiles[user.id]!,
    preferences: {
      ...state.profiles[user.id]!.preferences,
      ...input
    }
  };
  saveState(state);
  return state.profiles[user.id]!;
}

export function updateFallbackLocation(input: NonNullable<FallbackProfileResponse["location"]>) {
  const user = readStoredSessionUser();
  if (!user) {
    throw new Error("Bitte zuerst einloggen.");
  }

  const state = ensureUserState(user);
  state.profiles[user.id] = {
    ...state.profiles[user.id]!,
    profile: {
      ...state.profiles[user.id]!.profile,
      city: input.city ?? state.profiles[user.id]!.profile.city,
      countryCode: input.countryCode ?? state.profiles[user.id]!.profile.countryCode
    },
    location: input
  };
  saveState(state);
  return state.profiles[user.id]!;
}

export function updateFallbackVisibility(isVisible: boolean) {
  return updateFallbackProfile({ isVisible });
}

export function fetchFallbackDiscoverFeed(limit = 12) {
  const user = readStoredSessionUser();
  if (!user) {
    throw new Error("Bitte zuerst einloggen.");
  }

  const state = ensureUserState(user);
  const swipedIds = new Set(state.swipes[user.id]?.map((entry) => entry.targetUserId) ?? []);
  const items = seededPeople.filter((item) => !swipedIds.has(item.userId)).slice(0, limit);

  return {
    items,
    cache: {
      hit: false,
      remaining: Math.max(0, seededPeople.length - swipedIds.size)
    }
  };
}

export function createFallbackSwipe(targetUserId: string, direction: "left" | "right" | "super") {
  const user = readStoredSessionUser();
  if (!user) {
    throw new Error("Bitte zuerst einloggen.");
  }

  const state = ensureUserState(user);
  const createdAt = currentIsoTime();
  state.swipes[user.id]!.push({ targetUserId, direction, createdAt });

  const target = seededPeople.find((item) => item.userId === targetUserId);
  const isMatch = Boolean(target && (direction === "right" || direction === "super"));

  if (isMatch && target) {
    const existing = state.matches[user.id]!.find((match) => match.peer.userId === targetUserId);
    if (!existing) {
      const match: FallbackMatchItem = {
        matchId: `match-${user.id}-${targetUserId}`,
        status: "active",
        matchedAt: createdAt,
        peer: {
          userId: target.userId,
          displayName: target.displayName,
          age: target.age,
          bio: target.bio,
          city: target.city,
          countryCode: target.countryCode,
          primaryPhotoUrl: target.primaryPhotoUrl
        },
        conversation: {
          conversationId: `conversation-${user.id}-${targetUserId}`,
          lastMessageAt: createdAt
        }
      };

      const conversation = buildConversationFromMatch(match);
      state.matches[user.id]!.unshift(match);
      state.conversations[user.id]!.unshift(conversation);
      state.messages[conversation.conversationId] = buildMessagesForConversation(conversation);
    }
  }

  saveState(state);

  return {
    swipeId: `swipe-${user.id}-${targetUserId}-${Date.now()}`,
    targetUserId,
    direction,
    isMatch
  } satisfies FallbackSwipeResponse;
}

export function fetchFallbackMatches() {
  const user = readStoredSessionUser();
  if (!user) {
    throw new Error("Bitte zuerst einloggen.");
  }

  const state = ensureUserState(user);
  return state.matches[user.id] ?? [];
}

export function fetchFallbackConversations() {
  const user = readStoredSessionUser();
  if (!user) {
    throw new Error("Bitte zuerst einloggen.");
  }

  const state = ensureUserState(user);
  const items = state.conversations[user.id] ?? [];

  return {
    items,
    meta: {
      totalUnreadCount: items.reduce((sum, item) => sum + item.unreadCount, 0)
    }
  };
}

export function fetchFallbackConversationMessages(conversationId: string) {
  const user = readStoredSessionUser();
  if (!user) {
    throw new Error("Bitte zuerst einloggen.");
  }

  ensureUserState(user);

  return {
    items: loadState().messages[conversationId] ?? [],
    meta: {
      nextCursor: null,
      hasMore: false
    }
  };
}

export function sendFallbackConversationMessage(conversationId: string, body: string) {
  const user = readStoredSessionUser();
  if (!user) {
    throw new Error("Bitte zuerst einloggen.");
  }

  const state = ensureUserState(user);
  const createdAt = currentIsoTime();
  const message: FallbackConversationMessage = {
    messageId: `message-${Date.now()}`,
    conversationId,
    senderUserId: user.id,
    messageType: "text",
    body,
    attachment: null,
    moderationStatus: "approved",
    deliveryStatus: "sent",
    deliveredAt: createdAt,
    readAt: null,
    createdAt
  };

  state.messages[conversationId] ??= [];
  state.messages[conversationId]!.push(message);
  state.conversations[user.id] = (state.conversations[user.id] ?? []).map((conversation) =>
    conversation.conversationId === conversationId
      ? {
          ...conversation,
          unreadCount: 0,
          updatedAt: createdAt,
          lastMessageAt: createdAt,
          lastMessage: {
            messageId: message.messageId,
            senderUserId: message.senderUserId,
            messageType: message.messageType,
            body: message.body,
            mediaStorageKey: null,
            createdAt
          }
        }
      : conversation
  );

  saveState(state);

  return {
    message
  };
}

export function markFallbackConversationRead(conversationId: string) {
  const user = readStoredSessionUser();
  if (!user) {
    return { status: "ok" };
  }

  const state = ensureUserState(user);
  state.conversations[user.id] = (state.conversations[user.id] ?? []).map((conversation) =>
    conversation.conversationId === conversationId ? { ...conversation, unreadCount: 0 } : conversation
  );
  saveState(state);
  return { status: "ok" };
}
