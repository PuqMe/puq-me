/**
 * Chat message safety assessment.
 * Port of the Fastify safety.ts module.
 */

export type ChatSafetyAssessment = {
  messageRiskScore: number;
  userRiskScoreDelta: number;
  action: "allow" | "mark_review" | "throttle_sender" | "block_message" | "escalate_moderation";
  labels: string[];
  reasons: string[];
  dangerous: boolean;
  moderationStatus: "approved" | "pending" | "review" | "blocked";
  deliverToRecipient: boolean;
};

type SafetyContext = {
  duplicateMessagesLastHour: number;
  senderReportsLast24h: number;
};

type MessagePayload = {
  body?: string;
  messageType: string;
  attachment?: { storageKey: string } | null;
};

const MONEY_PATTERNS = /\b(send|transfer|wire|pay|bitcoin|btc|eth|crypto|bank\s*account|iban|western\s*union|moneygram|paypal|venmo|zelle|cash\s*app)\b/i;
const EXTERNAL_CONTACT_PATTERNS = /\b(whatsapp|telegram|snapchat|instagram|signal|viber|line|wechat|kik)\b|\b\d{7,15}\b/i;
const LINK_PATTERNS = /https?:\/\/|bit\.ly|tinyurl|t\.co|goo\.gl|short\.link/i;
const ROMANCE_SCAM_PATTERNS = /\b(trust\s*me|emergency|private\s*chat|i\s*need\s*your\s*help|don'?t\s*tell|secret|please\s*help|urgent|stranded|hospital|accident)\b/i;

export function assessChatMessageSafety(
  payload: MessagePayload,
  context: SafetyContext
): ChatSafetyAssessment {
  const body = payload.body ?? "";
  let riskScore = 0;
  let userDelta = 0;
  const labels: string[] = [];
  const reasons: string[] = [];

  // Money request detection
  if (MONEY_PATTERNS.test(body)) {
    riskScore += 35;
    userDelta += 20;
    labels.push("money_request");
    reasons.push("Message contains financial/money transfer language");
  }

  // External contact shift
  if (EXTERNAL_CONTACT_PATTERNS.test(body)) {
    riskScore += 20;
    labels.push("external_contact_shift");
    reasons.push("Message attempts to move conversation off-platform");
  }

  // Suspicious links
  if (LINK_PATTERNS.test(body)) {
    riskScore += 25;
    labels.push("suspicious_link");
    reasons.push("Message contains URL or shortened link");
  }

  // Romance scam patterns
  if (ROMANCE_SCAM_PATTERNS.test(body)) {
    riskScore += 22;
    labels.push("romance_scam_pattern");
    reasons.push("Message matches known romance scam language");
  }

  // Mass duplicate messages
  if (context.duplicateMessagesLastHour >= 5) {
    const dupeScore = context.duplicateMessagesLastHour >= 10 ? 30 : 18;
    riskScore += dupeScore;
    labels.push("mass_duplicate_message");
    reasons.push(`${context.duplicateMessagesLastHour} duplicate messages in last hour`);
  }

  // Report spikes
  if (context.senderReportsLast24h >= 2) {
    const reportScore = context.senderReportsLast24h >= 5 ? 20 : 10;
    riskScore += reportScore;
    reasons.push(`${context.senderReportsLast24h} reports in last 24h`);
  }

  // Determine action
  let action: ChatSafetyAssessment["action"] = "allow";
  let moderationStatus: ChatSafetyAssessment["moderationStatus"] = "approved";
  let deliverToRecipient = true;
  let dangerous = false;

  if (riskScore >= 85) {
    action = "block_message";
    moderationStatus = "blocked";
    deliverToRecipient = false;
    dangerous = true;
  } else if (riskScore >= 60) {
    action = "escalate_moderation";
    moderationStatus = "review";
    deliverToRecipient = false;
    dangerous = true;
  } else if (riskScore >= 35) {
    action = "mark_review";
    moderationStatus = "review";
    deliverToRecipient = true;
  }

  return {
    messageRiskScore: riskScore,
    userRiskScoreDelta: userDelta,
    action,
    labels,
    reasons,
    dangerous,
    moderationStatus,
    deliverToRecipient
  };
}
