import type { SendMessageBody } from "./schema.js";

type SafetyContext = {
  duplicateMessagesLastHour: number;
  senderReportsLast24h: number;
};

export type ChatSafetyAction = "allow" | "mark_review" | "throttle_sender" | "block_message" | "escalate_moderation";
export type ChatSafetyLabel =
  | "money_request"
  | "external_contact_shift"
  | "suspicious_link"
  | "mass_duplicate_message"
  | "romance_scam_pattern";

export type ChatSafetyAssessment = {
  messageRiskScore: number;
  userRiskScoreDelta: number;
  action: ChatSafetyAction;
  labels: ChatSafetyLabel[];
  dangerous: boolean;
  moderationStatus: "approved" | "review" | "blocked";
  deliverToRecipient: boolean;
  reasons: string[];
};

const moneyPatterns = [
  /\b(send money|wire money|bank transfer|gift card|western union|paypal me)\b/i,
  /\bcrypto\b/i,
  /\binvest(?:ment|ing)?\b/i,
  /\bforex\b/i,
  /\bbtc\b/i,
  /\beth\b/i
];

const externalContactPatterns = [
  /\bwhatsapp\b/i,
  /\btelegram\b/i,
  /\bsnap(chat)?\b/i,
  /\binstagram\b/i,
  /\bsignal\b/i,
  /\b(?:@[\w.]{3,})\b/i,
  /\b\d{6,}\b/i
];

const suspiciousLinkPatterns = [
  /\bhttps?:\/\/\S+/i,
  /\bwww\.\S+/i,
  /\bt\[.\]me\b/i,
  /\bbit\.ly\b/i,
  /\btinyurl\.com\b/i
];

const romanceScamPatterns = [
  /\btrust me\b/i,
  /\bi need your help\b/i,
  /\bemergency\b/i,
  /\bplease send\b/i,
  /\bprivate chat\b/i,
  /\bmove (to|this) (whatsapp|telegram|signal)\b/i
];

export function assessChatMessageSafety(payload: SendMessageBody, context: SafetyContext): ChatSafetyAssessment {
  const text = `${payload.body ?? ""}`.trim();
  const normalized = text
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^\p{L}\p{N}\s@:./[\]-]/gu, "");

  let messageRiskScore = 0;
  let userRiskScoreDelta = 0;
  const labels: ChatSafetyLabel[] = [];
  const reasons: string[] = [];

  if (moneyPatterns.some((pattern) => pattern.test(normalized))) {
    messageRiskScore += 35;
    userRiskScoreDelta += 20;
    labels.push("money_request");
    reasons.push("money_request_detected");
  }

  if (externalContactPatterns.some((pattern) => pattern.test(normalized))) {
    messageRiskScore += 20;
    userRiskScoreDelta += 15;
    labels.push("external_contact_shift");
    reasons.push("external_contact_shift_detected");
  }

  if (suspiciousLinkPatterns.some((pattern) => pattern.test(normalized))) {
    messageRiskScore += 25;
    userRiskScoreDelta += 15;
    labels.push("suspicious_link");
    reasons.push("suspicious_link_detected");
  }

  if (romanceScamPatterns.some((pattern) => pattern.test(normalized))) {
    messageRiskScore += 22;
    userRiskScoreDelta += 18;
    labels.push("romance_scam_pattern");
    reasons.push("romance_scam_pattern_detected");
  }

  if (context.duplicateMessagesLastHour >= 5) {
    messageRiskScore += context.duplicateMessagesLastHour >= 15 ? 30 : 18;
    userRiskScoreDelta += context.duplicateMessagesLastHour >= 15 ? 25 : 12;
    labels.push("mass_duplicate_message");
    reasons.push("duplicate_message_spike");
  }

  if (context.senderReportsLast24h >= 3) {
    messageRiskScore += context.senderReportsLast24h >= 8 ? 20 : 10;
    userRiskScoreDelta += context.senderReportsLast24h >= 8 ? 20 : 10;
    reasons.push("recent_report_spike");
  }

  const dangerous = messageRiskScore >= 70 || labels.includes("money_request");

  if (messageRiskScore >= 85) {
    return {
      messageRiskScore,
      userRiskScoreDelta,
      action: "block_message",
      labels,
      dangerous,
      moderationStatus: "blocked",
      deliverToRecipient: false,
      reasons
    };
  }

  if (messageRiskScore >= 60) {
    return {
      messageRiskScore,
      userRiskScoreDelta,
      action: "escalate_moderation",
      labels,
      dangerous,
      moderationStatus: "review",
      deliverToRecipient: false,
      reasons
    };
  }

  if (messageRiskScore >= 35) {
    return {
      messageRiskScore,
      userRiskScoreDelta,
      action: "mark_review",
      labels,
      dangerous,
      moderationStatus: "review",
      deliverToRecipient: true,
      reasons
    };
  }

  return {
    messageRiskScore,
    userRiskScoreDelta,
    action: "allow",
    labels,
    dangerous,
    moderationStatus: "approved",
    deliverToRecipient: true,
    reasons
  };
}
