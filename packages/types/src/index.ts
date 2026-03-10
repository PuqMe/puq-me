export type UserId = string;

export type DatingIntent = "serious" | "casual" | "friends";

export type SwipeDirection = "left" | "right" | "super";

export type MatchSummary = {
  id: string;
  peerUserId: UserId;
  peerDisplayName: string;
  matchedAt: string;
};

export type ChatEvent =
  | { type: "message.created"; payload: { threadId: string; messageId: string } }
  | { type: "typing"; payload: { threadId: string; isTyping: boolean } };
