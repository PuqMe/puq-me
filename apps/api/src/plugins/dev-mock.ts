import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";
import { randomUUID } from "node:crypto";

type MockChatMessage = {
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
  moderationStatus: "approved";
  deliveryStatus: "sent" | "delivered" | "read";
  deliveredAt: string | null;
  readAt: string | null;
  createdAt: string;
};

const initialMessages: MockChatMessage[] = [
  {
    messageId: "1",
    conversationId: "1",
    senderUserId: "202",
    messageType: "text",
    body: "Perfekt fuer den lokalen Demo-Chat. Schreib mir einfach direkt zurueck.",
    attachment: null,
    moderationStatus: "approved",
    deliveryStatus: "sent",
    deliveredAt: null,
    readAt: null,
    createdAt: new Date().toISOString()
  }
];

let nextMessageId = 2;
let nextSwipeId = 1;
let nextMatchId = 2;
let nextConversationId = 2;
const messageStore = new Map<string, MockChatMessage[]>();
messageStore.set("1", initialMessages);
const mockUsers = new Map<string, { id: string; email: string; password: string; status: string }>();
const userSwipes = new Map<string, Map<string, "left" | "right" | "super">>();
const matchStore = new Map<string, Array<{
  matchId: string;
  status: "active";
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
    conversationId: string;
    lastMessageAt: string | null;
  };
}>>();
const conversationStore = new Map<string, Array<{
  conversationId: string;
  matchId: string;
  status: "active";
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
}>>();
const radarPool = [
  {
    userId: "202",
    displayName: "Maya",
    age: 29,
    bio: "Keramikstudio tagsueber, Jazzbars nachts und offen fuer echte Gespraeche.",
    city: "Hamburg",
    countryCode: "DE",
    primaryPhotoUrl: null,
    distanceKm: 7,
    profileQualityScore: 88,
    activityScore: 79,
    responseProbabilityScore: 81,
    freshnessScore: 73,
    feedScore: 86,
    scoreBreakdown: {
      distance: 78,
      ageFit: 80,
      activity: 79,
      profileQuality: 88,
      responseProbability: 81,
      freshness: 73
    }
  },
  {
    userId: "203",
    displayName: "Lina",
    age: 27,
    bio: "Fruehe Laeufe, gutes Design und Dinner-Spots mit Haltung.",
    city: "Berlin",
    countryCode: "DE",
    primaryPhotoUrl: null,
    distanceKm: 3,
    profileQualityScore: 91,
    activityScore: 84,
    responseProbabilityScore: 76,
    freshnessScore: 88,
    feedScore: 90,
    scoreBreakdown: {
      distance: 94,
      ageFit: 82,
      activity: 84,
      profileQuality: 91,
      responseProbability: 76,
      freshness: 88
    }
  },
  {
    userId: "204",
    displayName: "Noor",
    age: 26,
    bio: "Museen, Espresso und Stadtwege mit gutem Tempo.",
    city: "Munich",
    countryCode: "DE",
    primaryPhotoUrl: null,
    distanceKm: 11,
    profileQualityScore: 84,
    activityScore: 72,
    responseProbabilityScore: 78,
    freshnessScore: 70,
    feedScore: 80,
    scoreBreakdown: {
      distance: 70,
      ageFit: 81,
      activity: 72,
      profileQuality: 84,
      responseProbability: 78,
      freshness: 70
    }
  }
] as const;
const profileStore = new Map<
  string,
  {
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
  }
>();

function buildDisplayName(email: string) {
  const localPart = email.split("@")[0] ?? "PuQ User";
  const cleaned = localPart.replace(/[._-]+/g, " ").trim();
  return (cleaned || "PuQ User")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
    .slice(0, 80);
}

function ensureMockProfile(user: { id: string; email: string }) {
  const existingProfile = profileStore.get(user.id);
  if (existingProfile) {
    return existingProfile;
  }

  const profile = {
    userId: user.id,
    profile: {
      displayName: buildDisplayName(user.email),
      birthDate: "2000-01-01",
      bio: null,
      gender: null,
      datingIntent: null,
      occupation: null,
      city: null,
      countryCode: null,
      isVisible: true
    },
    interests: [],
    preferences: {
      interestedIn: [],
      minAge: 18,
      maxAge: 99,
      maxDistanceKm: 50,
      showMeGlobally: false,
      onlyVerifiedProfiles: false
    },
    location: null
  };

  profileStore.set(user.id, profile);
  return profile;
}

function getUserFromAuthHeader(headerValue?: string) {
  const token = headerValue?.replace("Bearer ", "").trim();
  const userId = token?.replace("mock-access-", "");
  if (!userId) {
    return null;
  }

  return [...mockUsers.values()].find((entry) => entry.id === userId) ?? null;
}

function ensureUserMatches(userId: string) {
  const existingMatches = matchStore.get(userId);
  if (existingMatches) {
    return existingMatches;
  }

  const seeded = [
    {
      matchId: "1",
      status: "active" as const,
      matchedAt: new Date(Date.now() - 1000 * 60 * 24).toISOString(),
      peer: {
        userId: "202",
        displayName: "Maya",
        age: 29,
        bio: "Schnelle Antworten, ehrliche Energie und gute Abende.",
        city: "Hamburg",
        countryCode: "DE",
        primaryPhotoUrl: null
      },
      conversation: {
        conversationId: "1",
        lastMessageAt: initialMessages[0]?.createdAt ?? null
      }
    }
  ];

  matchStore.set(userId, seeded);
  return seeded;
}

function ensureUserConversations(userId: string) {
  const existing = conversationStore.get(userId);
  if (existing) {
    return existing;
  }

  const seeded = [
    {
      conversationId: "1",
      matchId: "1",
      status: "active" as const,
      unreadCount: 1,
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      updatedAt: initialMessages[0]?.createdAt ?? new Date().toISOString(),
      lastMessageAt: initialMessages[0]?.createdAt ?? null,
      peer: {
        userId: "202",
        displayName: "Maya",
        age: 29,
        bio: "Schnelle Antworten, ehrliche Energie und gute Abende.",
        city: "Hamburg",
        countryCode: "DE",
        primaryPhotoUrl: null
      },
      lastMessage: initialMessages[0]
        ? {
            messageId: initialMessages[0].messageId,
            senderUserId: initialMessages[0].senderUserId,
            messageType: initialMessages[0].messageType,
            body: initialMessages[0].body,
            mediaStorageKey: null,
            createdAt: initialMessages[0].createdAt
          }
        : null
    }
  ];

  conversationStore.set(userId, seeded);
  return seeded;
}

function findConversationOwner(conversationId: string) {
  for (const [userId, items] of conversationStore.entries()) {
    if (items.some((item) => item.conversationId === conversationId)) {
      return userId;
    }
  }

  return null;
}

function buildMockAuthResponse(user: { id: string; email: string; status: string }) {
  return {
    user: {
      id: user.id,
      email: user.email,
      status: user.status
    },
    tokens: {
      accessToken: `mock-access-${user.id}`,
      refreshToken: `mock-refresh-${user.id}`,
      expiresIn: "15m",
      refreshExpiresIn: "30d"
    }
  };
}

const devMockPlugin: FastifyPluginAsync = async (app) => {
  app.get("/health/live", async () => ({
    status: "ok",
    mode: "mock"
  }));

  app.get("/v1/health/live", async () => ({
    status: "ok",
    mode: "mock"
  }));

  app.post("/v1/auth/register", async (request, reply) => {
    const payload = request.body as {
      email?: string;
      password?: string;
    };

    const email = payload.email?.trim().toLowerCase();
    const password = payload.password ?? "";

    if (!email || !password) {
      return reply.code(400).send({ error: "validation_error", message: "Email and password are required." });
    }

    if (mockUsers.has(email)) {
      return reply.code(409).send({ error: "email_already_registered", message: "This email is already registered." });
    }

    const user = {
      id: randomUUID(),
      email,
      password,
      status: "pending"
    };

    mockUsers.set(email, user);
    ensureMockProfile(user);
    return reply.code(201).send(buildMockAuthResponse(user));
  });

  app.post("/v1/auth/login", async (request, reply) => {
    const payload = request.body as {
      email?: string;
      password?: string;
    };

    const email = payload.email?.trim().toLowerCase();
    const password = payload.password ?? "";
    const existingUser = email ? mockUsers.get(email) : null;

    if (!existingUser || existingUser.password !== password) {
      return reply.code(401).send({ error: "invalid_credentials", message: "Email or password is incorrect." });
    }

    return buildMockAuthResponse(existingUser);
  });

  app.post("/v1/auth/google", async (request) => {
    const payload = request.body as {
      credential?: string;
    };

    const suffix = payload.credential?.slice(-8) ?? "demo";
    const email = `google-${suffix}@puq.me`;
    const existingUser = mockUsers.get(email);

    if (existingUser) {
      return buildMockAuthResponse(existingUser);
    }

    const user = {
      id: randomUUID(),
      email,
      password: "",
      status: "active"
    };

    mockUsers.set(email, user);
    ensureMockProfile(user);
    return buildMockAuthResponse(user);
  });

  app.post("/v1/auth/refresh", async (request) => {
    const payload = request.body as {
      refreshToken?: string;
    };
    const userId = payload.refreshToken?.replace("mock-refresh-", "");
    const user = [...mockUsers.values()].find((entry) => entry.id === userId);

    if (!user) {
      return { error: "invalid_refresh_token", message: "Refresh token is invalid." };
    }

    return buildMockAuthResponse(user);
  });

  app.post("/v1/auth/logout", async () => ({
    message: "logged_out"
  }));

  app.get("/v1/profiles/me", async (request, reply) => {
    const user = getUserFromAuthHeader(request.headers.authorization);
    if (!user) {
      return reply.code(401).send({ error: "unauthorized", message: "Please sign in first." });
    }

    return ensureMockProfile(user);
  });

  app.patch("/v1/profiles/me", async (request, reply) => {
    const user = getUserFromAuthHeader(request.headers.authorization);
    if (!user) {
      return reply.code(401).send({ error: "unauthorized", message: "Please sign in first." });
    }

    const currentProfile = ensureMockProfile(user);
    const payload = request.body as Partial<typeof currentProfile.profile>;

    const nextProfile = {
      ...currentProfile,
      profile: {
        ...currentProfile.profile,
        ...payload
      }
    };

    profileStore.set(user.id, nextProfile);
    return nextProfile;
  });

  app.put("/v1/profiles/me/interests", async (request, reply) => {
    const user = getUserFromAuthHeader(request.headers.authorization);
    if (!user) {
      return reply.code(401).send({ error: "unauthorized", message: "Please sign in first." });
    }

    const payload = request.body as { interests?: string[] };
    const currentProfile = ensureMockProfile(user);
    const nextProfile = {
      ...currentProfile,
      interests: payload.interests ?? []
    };

    profileStore.set(user.id, nextProfile);
    return nextProfile;
  });

  app.put("/v1/profiles/me/preferences", async (request, reply) => {
    const user = getUserFromAuthHeader(request.headers.authorization);
    if (!user) {
      return reply.code(401).send({ error: "unauthorized", message: "Please sign in first." });
    }

    const payload = request.body as Partial<{
      interestedIn: string[];
      minAge: number;
      maxAge: number;
      maxDistanceKm: number;
      showMeGlobally: boolean;
      onlyVerifiedProfiles: boolean;
    }>;
    const currentProfile = ensureMockProfile(user);
    const nextProfile = {
      ...currentProfile,
      preferences: {
        ...currentProfile.preferences,
        ...payload
      }
    };

    profileStore.set(user.id, nextProfile);
    return nextProfile;
  });

  app.put("/v1/profiles/me/location", async (request, reply) => {
    const user = getUserFromAuthHeader(request.headers.authorization);
    if (!user) {
      return reply.code(401).send({ error: "unauthorized", message: "Please sign in first." });
    }

    const payload = request.body as {
      latitude?: number;
      longitude?: number;
      city?: string;
      countryCode?: string;
    };
    const currentProfile = ensureMockProfile(user);
    const nextProfile = {
      ...currentProfile,
      location:
        typeof payload.latitude === "number" && typeof payload.longitude === "number"
          ? {
              latitude: payload.latitude,
              longitude: payload.longitude,
              city: payload.city ?? null,
              countryCode: payload.countryCode ?? null
            }
          : currentProfile.location
    };

    if (nextProfile.location) {
      nextProfile.profile = {
        ...nextProfile.profile,
        city: nextProfile.location.city,
        countryCode: nextProfile.location.countryCode
      };
    }

    profileStore.set(user.id, nextProfile);
    return nextProfile;
  });

  app.patch("/v1/profiles/me/visibility", async (request, reply) => {
    const user = getUserFromAuthHeader(request.headers.authorization);
    if (!user) {
      return reply.code(401).send({ error: "unauthorized", message: "Please sign in first." });
    }

    const payload = request.body as { isVisible?: boolean };
    const currentProfile = ensureMockProfile(user);
    const nextProfile = {
      ...currentProfile,
      profile: {
        ...currentProfile.profile,
        isVisible: payload.isVisible ?? currentProfile.profile.isVisible
      }
    };

    profileStore.set(user.id, nextProfile);
    return nextProfile;
  });

  app.get("/v1/swipe/radar", async (request, reply) => {
    const user = getUserFromAuthHeader(request.headers.authorization);
    if (!user) {
      return reply.code(401).send({ error: "unauthorized", message: "Please sign in first." });
    }

    const swipedTargets = userSwipes.get(user.id) ?? new Map<string, "left" | "right" | "super">();
    const items = radarPool.filter((candidate) => !swipedTargets.has(candidate.userId));

    return {
      items,
      cache: {
        hit: false,
        remaining: 0
      }
    };
  });

  app.get("/v1/swipe/discover", async (request, reply) => {
    const user = getUserFromAuthHeader(request.headers.authorization);
    if (!user) {
      return reply.code(401).send({ error: "unauthorized", message: "Please sign in first." });
    }

    const swipedTargets = userSwipes.get(user.id) ?? new Map<string, "left" | "right" | "super">();
    const items = radarPool.filter((candidate) => !swipedTargets.has(candidate.userId));

    return {
      items,
      cache: {
        hit: false,
        remaining: 0
      }
    };
  });

  app.post("/v1/swipe", async (request, reply) => {
    const user = getUserFromAuthHeader(request.headers.authorization);
    if (!user) {
      return reply.code(401).send({ error: "unauthorized", message: "Please sign in first." });
    }

    const payload = request.body as {
      targetUserId?: string;
      direction?: "left" | "right" | "super";
    };

    if (!payload.targetUserId || !payload.direction) {
      return reply.code(400).send({ error: "validation_error", message: "Target and direction are required." });
    }

    const swipes = userSwipes.get(user.id) ?? new Map<string, "left" | "right" | "super">();
    swipes.set(payload.targetUserId, payload.direction);
    userSwipes.set(user.id, swipes);

    const isMatch = payload.direction !== "left" && payload.targetUserId === "203";

    if (isMatch) {
      const matches = ensureUserMatches(user.id);
      if (!matches.some((item) => item.peer.userId === payload.targetUserId)) {
        const matchedCandidate = radarPool.find((candidate) => candidate.userId === payload.targetUserId);
        const matchId = String(nextMatchId++);
        const conversationId = String(nextConversationId++);
        const createdAt = new Date().toISOString();

        matches.unshift({
          matchId,
          status: "active",
          matchedAt: createdAt,
          peer: {
            userId: matchedCandidate?.userId ?? payload.targetUserId,
            displayName: matchedCandidate?.displayName ?? "New Match",
            age: matchedCandidate?.age ?? 28,
            bio: matchedCandidate?.bio ?? null,
            city: matchedCandidate?.city ?? null,
            countryCode: matchedCandidate?.countryCode ?? null,
            primaryPhotoUrl: matchedCandidate?.primaryPhotoUrl ?? null
          },
          conversation: {
            conversationId,
            lastMessageAt: null
          }
        });

        const conversations = ensureUserConversations(user.id);
        conversations.unshift({
          conversationId,
          matchId,
          status: "active",
          unreadCount: 0,
          createdAt,
          updatedAt: createdAt,
          lastMessageAt: null,
          peer: {
            userId: matchedCandidate?.userId ?? payload.targetUserId,
            displayName: matchedCandidate?.displayName ?? "New Match",
            age: matchedCandidate?.age ?? 28,
            bio: matchedCandidate?.bio ?? null,
            city: matchedCandidate?.city ?? null,
            countryCode: matchedCandidate?.countryCode ?? null,
            primaryPhotoUrl: matchedCandidate?.primaryPhotoUrl ?? null
          },
          lastMessage: null
        });

        messageStore.set(conversationId, []);
      }
    }

    return {
      swipeId: String(nextSwipeId++),
      targetUserId: payload.targetUserId,
      direction: payload.direction,
      isMatch
    };
  });

  app.get("/v1/matches", async (request, reply) => {
    const user = getUserFromAuthHeader(request.headers.authorization);
    if (!user) {
      return reply.code(401).send({ error: "unauthorized", message: "Please sign in first." });
    }

    return ensureUserMatches(user.id);
  });

  app.get("/v1/chat/conversations", async (request, reply) => {
    const user = getUserFromAuthHeader(request.headers.authorization);
    if (!user) {
      return reply.code(401).send({ error: "unauthorized", message: "Please sign in first." });
    }

    const items = ensureUserConversations(user.id);
    const totalUnreadCount = items.reduce((sum, item) => sum + item.unreadCount, 0);

    return {
      items,
      meta: {
        totalUnreadCount
      }
    };
  });

  app.get("/v1/chat/conversations/unread-count", async (request, reply) => {
    const user = getUserFromAuthHeader(request.headers.authorization);
    if (!user) {
      return reply.code(401).send({ error: "unauthorized", message: "Please sign in first." });
    }

    const unreadCount = ensureUserConversations(user.id).reduce((sum, item) => sum + item.unreadCount, 0);
    return { unreadCount };
  });

  app.get("/v1/chat/conversations/:conversationId/messages", async (request, reply) => {
    const user = getUserFromAuthHeader(request.headers.authorization);
    if (!user) {
      return reply.code(401).send({ error: "unauthorized", message: "Please sign in first." });
    }

    const conversationId = (request.params as { conversationId?: string }).conversationId ?? "1";
    const ownerUserId = findConversationOwner(conversationId);
    if (ownerUserId !== user.id) {
      return reply.code(404).send({ error: "not_found", message: "Conversation not found." });
    }

    return {
      items: messageStore.get(conversationId) ?? [],
      meta: {
        nextCursor: null,
        hasMore: false
      }
    };
  });

  app.post("/v1/chat/messages", async (request, reply) => {
    const user = getUserFromAuthHeader(request.headers.authorization);
    if (!user) {
      return reply.code(401).send({ error: "unauthorized", message: "Please sign in first." });
    }

    const payload = request.body as {
      conversationId?: string;
      messageType?: "text" | "image";
      body?: string | null;
      attachment?: {
        storageKey: string;
        mimeType: string;
        sizeBytes: number;
      } | null;
    };

    const conversationId = payload.conversationId ?? "1";
    const ownerUserId = findConversationOwner(conversationId);
    if (ownerUserId !== user.id) {
      return reply.code(404).send({ error: "not_found", message: "Conversation not found." });
    }

    const message: MockChatMessage = {
      messageId: String(nextMessageId++),
      conversationId,
      senderUserId: user.id,
      messageType: payload.messageType ?? "text",
      body: payload.body ?? null,
      attachment: payload.attachment ?? null,
      moderationStatus: "approved",
      deliveryStatus: "sent",
      deliveredAt: null,
      readAt: null,
      createdAt: new Date().toISOString()
    };

    const messages = messageStore.get(conversationId) ?? [];
    messages.push(message);
    messageStore.set(conversationId, messages);

    const conversations = ensureUserConversations(user.id);
    const conversation = conversations.find((item) => item.conversationId === conversationId);
    if (conversation) {
      conversation.updatedAt = message.createdAt;
      conversation.lastMessageAt = message.createdAt;
      conversation.lastMessage = {
        messageId: message.messageId,
        senderUserId: message.senderUserId,
        messageType: message.messageType,
        body: message.body,
        mediaStorageKey: message.attachment?.storageKey ?? null,
        createdAt: message.createdAt
      };
    }

    return reply.code(201).send({
      message,
      websocketEvent: null,
      moderationEvent: null
    });
  });

  app.post("/v1/chat/conversations/read", async (request, reply) => {
    const user = getUserFromAuthHeader(request.headers.authorization);
    if (!user) {
      return reply.code(401).send({ error: "unauthorized", message: "Please sign in first." });
    }

    const payload = request.body as {
      conversationId?: string;
    };

    const conversations = ensureUserConversations(user.id);
    const conversation = conversations.find((item) => item.conversationId === payload.conversationId);
    if (!conversation) {
      return reply.code(404).send({ error: "not_found", message: "Conversation not found." });
    }

    conversation.unreadCount = 0;

    return {
      conversationId: conversation.conversationId,
      updatedCount: 1,
      websocketEvent: {
        type: "chat.messages.read",
        conversationId: conversation.conversationId,
        actorUserId: user.id
      }
    };
  });
};

export default fp(devMockPlugin);
