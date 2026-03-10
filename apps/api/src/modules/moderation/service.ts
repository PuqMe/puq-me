import type { FastifyInstance } from "fastify";
import { ForbiddenError, TooManyRequestsError } from "../../common/errors.js";
import { ModerationRepository } from "./repository.js";
import type { CreateReportBody, EvaluateRiskBody, ModerationStatus } from "./schema.js";

export class ModerationService {
  private readonly repository: ModerationRepository;

  constructor(private readonly app: FastifyInstance) {
    this.repository = new ModerationRepository(app);
  }

  private reportRateKey(reporterUserId: string) {
    return `moderation:reports:${reporterUserId}`;
  }

  private riskThrottleKey(userId: string) {
    return `moderation:risk:evaluate:${userId}`;
  }

  async createReport(reporterUserId: string, payload: CreateReportBody) {
    const key = this.reportRateKey(reporterUserId);
    const count = await this.app.redis.incr(key);
    if (count === 1) {
      await this.app.redis.expire(key, 60 * 60);
    }
    if (count > 20) {
      throw new TooManyRequestsError("report_rate_limit_exceeded");
    }

    const report = await this.repository.createReport({
      reporterUserId,
      payload
    });

    await this.repository.logAudit({
      actorUserId: reporterUserId,
      action: "report.created",
      entityType: "report",
      entityId: report.reportId,
      payload: {
        targetType: payload.targetType,
        targetUserId: payload.targetUserId ?? null,
        targetMessageId: payload.targetMessageId ?? null,
        reason: payload.reason
      }
    });

    return {
      report
    };
  }

  async listOwnReports(reporterUserId: string, query: { status?: ModerationStatus; limit: number }) {
    return {
      items: await this.repository.listReportsForReporter(reporterUserId, query.status, query.limit)
    };
  }

  async getRiskProfile(adminUserId: string, userId: string) {
    await this.repository.logAudit({
      actorUserId: adminUserId,
      action: "risk.viewed",
      entityType: "user_risk_score",
      entityId: userId,
      payload: {}
    });

    return {
      risk: await this.repository.getUserRisk(userId)
    };
  }

  async evaluateRisk(actorUserId: string, payload: EvaluateRiskBody, isAdmin = false) {
    if (!isAdmin && actorUserId !== payload.userId) {
      throw new ForbiddenError("risk_evaluation_not_allowed");
    }

    const throttleKey = this.riskThrottleKey(payload.userId);
    const evaluationCount = await this.app.redis.incr(throttleKey);
    if (evaluationCount === 1) {
      await this.app.redis.expire(throttleKey, 60);
    }
    if (evaluationCount > 12) {
      throw new TooManyRequestsError("risk_evaluation_rate_limit_exceeded");
    }

    const signals = this.buildSignals(payload);
    const riskScore = Math.min(100, signals.reduce((total, signal) => total + signal.scoreDelta, 0));
    const reasons = signals.map((signal) => signal.signalKey);
    const riskLevel = this.toRiskLevel(riskScore);
    const reviewStatus = this.toReviewStatus(riskScore);
    const autoAction = this.toAutoAction(riskScore);

    const row = await this.repository.upsertUserRisk({
      userId: payload.userId,
      riskScore,
      riskLevel,
      reviewStatus,
      autoAction,
      reasons
    });

    await this.repository.replaceSignals({
      userId: payload.userId,
      signals
    });

    let moderationEscalation = null;
    if (autoAction === "manual_review" || autoAction === "verification_required") {
      moderationEscalation = await this.repository.createEscalation({
        userId: payload.userId,
        recommendedAction: autoAction,
        reason: `risk_score_${riskScore}`,
        source: payload.triggeredBy,
        payload: {
          reasons,
          riskLevel,
          riskScore
        }
      });
    }

    await this.repository.logAudit({
      actorUserId,
      action: "risk.evaluated",
      entityType: "user_risk_score",
      entityId: payload.userId,
      payload: {
        triggeredBy: payload.triggeredBy,
        riskScore,
        riskLevel,
        reviewStatus,
        autoAction,
        reasons
      }
    });

    return {
      risk: await this.repository.getUserRisk(row.user_id),
      moderationEscalation
    };
  }

  private buildSignals(payload: EvaluateRiskBody) {
    const signals: Array<{
      signalType:
        | "registration_speed"
        | "swipe_behavior"
        | "message_duplication"
        | "profile_text"
        | "photo_pattern"
        | "report_spike";
      signalKey: string;
      scoreDelta: number;
      severity: "low" | "medium" | "high";
      evidence: Record<string, unknown>;
    }> = [];

    if (payload.registrationDurationSeconds !== undefined && payload.registrationDurationSeconds < 45) {
      signals.push({
        signalType: "registration_speed",
        signalKey: "fast_registration",
        scoreDelta: 15,
        severity: "medium",
        evidence: { registrationDurationSeconds: payload.registrationDurationSeconds }
      });
    }

    if (
      payload.swipeRatePerMinute !== undefined &&
      payload.rightSwipeRatio !== undefined &&
      (payload.swipeRatePerMinute > 60 || payload.rightSwipeRatio > 0.92)
    ) {
      signals.push({
        signalType: "swipe_behavior",
        signalKey: "unnatural_swipe_pattern",
        scoreDelta: payload.swipeRatePerMinute > 120 ? 25 : 15,
        severity: payload.swipeRatePerMinute > 120 ? "high" : "medium",
        evidence: {
          swipeRatePerMinute: payload.swipeRatePerMinute,
          rightSwipeRatio: payload.rightSwipeRatio
        }
      });
    }

    if (payload.identicalMessagesLastHour !== undefined && payload.identicalMessagesLastHour >= 5) {
      signals.push({
        signalType: "message_duplication",
        signalKey: "duplicate_messages_spike",
        scoreDelta: payload.identicalMessagesLastHour >= 15 ? 30 : 18,
        severity: payload.identicalMessagesLastHour >= 15 ? "high" : "medium",
        evidence: { identicalMessagesLastHour: payload.identicalMessagesLastHour }
      });
    }

    if (payload.suspiciousProfileTextScore !== undefined && payload.suspiciousProfileTextScore >= 55) {
      signals.push({
        signalType: "profile_text",
        signalKey: "suspicious_profile_text",
        scoreDelta: payload.suspiciousProfileTextScore >= 80 ? 20 : 10,
        severity: payload.suspiciousProfileTextScore >= 80 ? "high" : "medium",
        evidence: { suspiciousProfileTextScore: payload.suspiciousProfileTextScore }
      });
    }

    if (payload.photoPatternScore !== undefined && payload.photoPatternScore >= 60) {
      signals.push({
        signalType: "photo_pattern",
        signalKey: "photo_pattern_anomaly",
        scoreDelta: payload.photoPatternScore >= 85 ? 25 : 12,
        severity: payload.photoPatternScore >= 85 ? "high" : "medium",
        evidence: { photoPatternScore: payload.photoPatternScore }
      });
    }

    if (payload.reportsLast24h !== undefined && payload.reportsLast24h >= 3) {
      signals.push({
        signalType: "report_spike",
        signalKey: "report_spike_detected",
        scoreDelta: payload.reportsLast24h >= 8 ? 30 : 15,
        severity: payload.reportsLast24h >= 8 ? "high" : "medium",
        evidence: { reportsLast24h: payload.reportsLast24h }
      });
    }

    return signals;
  }

  private toRiskLevel(score: number) {
    if (score >= 80) {
      return "critical" as const;
    }
    if (score >= 60) {
      return "high" as const;
    }
    if (score >= 30) {
      return "medium" as const;
    }
    return "low" as const;
  }

  private toReviewStatus(score: number) {
    if (score >= 80) {
      return "restricted" as const;
    }
    if (score >= 60) {
      return "needs_review" as const;
    }
    if (score >= 30) {
      return "watch" as const;
    }
    return "clear" as const;
  }

  private toAutoAction(score: number) {
    if (score >= 80) {
      return "manual_review" as const;
    }
    if (score >= 60) {
      return "verification_required" as const;
    }
    if (score >= 30) {
      return "watch" as const;
    }
    return "none" as const;
  }
}
