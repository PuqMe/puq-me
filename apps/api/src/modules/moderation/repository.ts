import type { FastifyInstance } from "fastify";
import { BadRequestError, NotFoundError } from "../../common/errors.js";
import type { CreateReportBody, EvaluateRiskBody } from "./schema.js";

type ReportRow = {
  report_id: string;
  target_type: "user" | "profile" | "message";
  target_user_id: string | null;
  target_message_id: string | null;
  reason: "spam" | "fake_profile" | "scam" | "harassment" | "sexual_content" | "underage_concern" | "other";
  details: string | null;
  status: "open" | "in_review" | "resolved" | "rejected";
  resolution: string | null;
  reporter_user_id: string;
  assigned_admin_user_id: string | null;
  created_at: string;
  updated_at: string;
};

type ReportNoteRow = {
  note_id: string;
  report_id: string;
  admin_user_id: string;
  note: string;
  created_at: string;
};

type UserRiskRow = {
  user_id: string;
  risk_score: string;
  risk_level: "low" | "medium" | "high" | "critical";
  review_status: "clear" | "watch" | "needs_review" | "restricted";
  auto_action: "none" | "watch" | "throttle" | "verification_required" | "manual_review";
  reasons: string[];
  last_evaluated_at: string | null;
  updated_at: string;
};

type UserRiskSignalRow = {
  signal_id: string;
  signal_type:
    | "registration_speed"
    | "swipe_behavior"
    | "message_duplication"
    | "profile_text"
    | "photo_pattern"
    | "report_spike";
  signal_key: string;
  score_delta: string;
  severity: "low" | "medium" | "high";
  evidence: Record<string, unknown>;
  occurred_at: string;
};

type ModerationEscalationRow = {
  escalation_id: string;
  status: "open" | "acknowledged" | "resolved";
  recommended_action: "none" | "watch" | "throttle" | "verification_required" | "manual_review";
};

export class ModerationRepository {
  constructor(private readonly app: FastifyInstance) {}

  private mapRisk(row: UserRiskRow, signalRows: UserRiskSignalRow[]) {
    return {
      userId: row.user_id,
      riskScore: Number(row.risk_score),
      riskLevel: row.risk_level,
      reviewStatus: row.review_status,
      autoAction: row.auto_action,
      reasons: row.reasons ?? [],
      lastEvaluatedAt: row.last_evaluated_at,
      updatedAt: row.updated_at,
      signals: signalRows.map((signal) => ({
        signalId: signal.signal_id,
        signalType: signal.signal_type,
        signalKey: signal.signal_key,
        scoreDelta: Number(signal.score_delta),
        severity: signal.severity,
        evidence: signal.evidence,
        occurredAt: signal.occurred_at
      }))
    };
  }

  private async loadNotes(reportIds: string[]) {
    if (reportIds.length === 0) {
      return new Map<string, ReportNoteRow[]>();
    }

    const result = await this.app.db.query<ReportNoteRow>(
      `select
         id::text as note_id,
         report_id::text,
         admin_user_id::text,
         note,
         created_at::text
       from report_admin_notes
       where report_id = any($1::bigint[])
       order by created_at asc`,
      [reportIds]
    );

    const byReport = new Map<string, ReportNoteRow[]>();
    for (const row of result.rows) {
      const existing = byReport.get(row.report_id) ?? [];
      existing.push(row);
      byReport.set(row.report_id, existing);
    }
    return byReport;
  }

  private async mapReports(rows: ReportRow[]) {
    const notesByReport = await this.loadNotes(rows.map((row) => row.report_id));

    return rows.map((row) => ({
      reportId: row.report_id,
      targetType: row.target_type,
      targetUserId: row.target_user_id,
      targetMessageId: row.target_message_id,
      reason: row.reason,
      details: row.details,
      status: row.status,
      resolution: row.resolution,
      reporterUserId: row.reporter_user_id,
      assignedAdminUserId: row.assigned_admin_user_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      notes: (notesByReport.get(row.report_id) ?? []).map((note) => ({
        noteId: note.note_id,
        reportId: note.report_id,
        adminUserId: note.admin_user_id,
        note: note.note,
        createdAt: note.created_at
      }))
    }));
  }

  async ensureTargetExists(input: CreateReportBody) {
    if (input.targetType === "message") {
      const result = await this.app.db.query<{ exists: boolean }>(
        `select exists(select 1 from messages where id = $1::bigint) as exists`,
        [input.targetMessageId]
      );

      if (!result.rows[0]?.exists) {
        throw new NotFoundError("report_target_message_not_found");
      }

      return;
    }

    const result = await this.app.db.query<{ exists: boolean }>(
      `select exists(
         select 1
         from users
         where id = $1::bigint
           and deleted_at is null
       ) as exists`,
      [input.targetUserId]
    );

    if (!result.rows[0]?.exists) {
      throw new NotFoundError("report_target_user_not_found");
    }
  }

  async createReport(input: {
    reporterUserId: string;
    payload: CreateReportBody;
  }) {
    await this.ensureTargetExists(input.payload);

    if (
      (input.payload.targetType === "user" || input.payload.targetType === "profile") &&
      input.reporterUserId === input.payload.targetUserId
    ) {
      throw new BadRequestError("cannot_report_self");
    }

    const result = await this.app.db.query<ReportRow>(
      `insert into reports (
         reporter_user_id,
         target_type,
         target_user_id,
         target_message_id,
         reason,
         details,
         status,
         created_at,
         updated_at
       )
       values ($1, $2, $3, $4, $5, $6, 'open', now(), now())
       returning
         id::text as report_id,
         target_type,
         target_user_id::text,
         target_message_id::text,
         reason,
         details,
         status,
         resolution,
         reporter_user_id::text,
         assigned_admin_user_id::text,
         created_at::text,
         updated_at::text`,
      [
        input.reporterUserId,
        input.payload.targetType,
        input.payload.targetUserId ?? null,
        input.payload.targetMessageId ?? null,
        input.payload.reason,
        input.payload.details ?? null
      ]
    );

    const [report] = await this.mapReports(result.rows);
    return report;
  }

  async listReportsForReporter(reporterUserId: string, status?: string, limit = 20) {
    const result = await this.app.db.query<ReportRow>(
      `select
         id::text as report_id,
         target_type,
         target_user_id::text,
         target_message_id::text,
         reason,
         details,
         status,
         resolution,
         reporter_user_id::text,
         assigned_admin_user_id::text,
         created_at::text,
         updated_at::text
       from reports
       where reporter_user_id = $1::bigint
         and ($2::text is null or status = $2::text)
       order by created_at desc
       limit $3`,
      [reporterUserId, status ?? null, limit]
    );

    return this.mapReports(result.rows);
  }

  async logAudit(input: {
    actorUserId: string;
    action: string;
    entityType: string;
    entityId: string;
    payload?: Record<string, unknown>;
  }) {
    await this.app.db.query(
      `insert into moderation_audit_logs (
         actor_user_id,
         action,
         entity_type,
         entity_id,
         payload,
         created_at
       )
       values ($1, $2, $3, $4, $5::jsonb, now())`,
      [input.actorUserId, input.action, input.entityType, input.entityId, JSON.stringify(input.payload ?? {})]
    );
  }

  async getUserRisk(userId: string) {
    const riskResult = await this.app.db.query<UserRiskRow>(
      `select
         user_id::text,
         risk_score::text,
         risk_level,
         review_status,
         auto_action,
         reasons,
         last_evaluated_at::text,
         updated_at::text
       from user_risk_scores
       where user_id = $1::bigint
       limit 1`,
      [userId]
    );

    const row = riskResult.rows[0];
    if (!row) {
      throw new NotFoundError("risk_profile_not_found");
    }

    const signalResult = await this.app.db.query<UserRiskSignalRow>(
      `select
         id::text as signal_id,
         signal_type,
         signal_key,
         score_delta::text,
         severity,
         evidence,
         occurred_at::text
       from user_risk_signals
       where user_id = $1::bigint
       order by occurred_at desc
       limit 20`,
      [userId]
    );

    return this.mapRisk(row, signalResult.rows);
  }

  async upsertUserRisk(input: {
    userId: string;
    riskScore: number;
    riskLevel: "low" | "medium" | "high" | "critical";
    reviewStatus: "clear" | "watch" | "needs_review" | "restricted";
    autoAction: "none" | "watch" | "throttle" | "verification_required" | "manual_review";
    reasons: string[];
  }) {
    const result = await this.app.db.query<UserRiskRow>(
      `insert into user_risk_scores (
         user_id,
         risk_score,
         risk_level,
         review_status,
         auto_action,
         reasons,
         last_evaluated_at,
         created_at,
         updated_at
       )
       values ($1::bigint, $2, $3, $4, $5, $6::text[], now(), now(), now())
       on conflict (user_id)
       do update set
         risk_score = excluded.risk_score,
         risk_level = excluded.risk_level,
         review_status = excluded.review_status,
         auto_action = excluded.auto_action,
         reasons = excluded.reasons,
         last_evaluated_at = now(),
         updated_at = now()
       returning
         user_id::text,
         risk_score::text,
         risk_level,
         review_status,
         auto_action,
         reasons,
         last_evaluated_at::text,
         updated_at::text`,
      [input.userId, input.riskScore, input.riskLevel, input.reviewStatus, input.autoAction, input.reasons]
    );

    return result.rows[0];
  }

  async replaceSignals(input: {
    userId: string;
    signals: Array<{
      signalType: UserRiskSignalRow["signal_type"];
      signalKey: string;
      scoreDelta: number;
      severity: UserRiskSignalRow["severity"];
      evidence: Record<string, unknown>;
    }>;
  }) {
    await this.app.db.query(
      `delete from user_risk_signals
       where user_id = $1::bigint
         and occurred_at >= now() - interval '24 hours'`,
      [input.userId]
    );

    for (const signal of input.signals) {
      await this.app.db.query(
        `insert into user_risk_signals (
           user_id,
           signal_type,
           signal_key,
           score_delta,
           severity,
           evidence,
           occurred_at,
           created_at
         )
         values ($1::bigint, $2, $3, $4, $5, $6::jsonb, now(), now())`,
        [
          input.userId,
          signal.signalType,
          signal.signalKey,
          signal.scoreDelta,
          signal.severity,
          JSON.stringify(signal.evidence)
        ]
      );
    }
  }

  async createEscalation(input: {
    userId: string;
    recommendedAction: "none" | "watch" | "throttle" | "verification_required" | "manual_review";
    reason: string;
    source: EvaluateRiskBody["triggeredBy"];
    payload: Record<string, unknown>;
  }) {
    const result = await this.app.db.query<ModerationEscalationRow>(
      `insert into moderation_escalations (
         user_id,
         source,
         reason,
         status,
         recommended_action,
         payload,
         created_at,
         updated_at
       )
       values ($1::bigint, $2, $3, 'open', $4, $5::jsonb, now(), now())
       returning
         id::text as escalation_id,
         status,
         recommended_action`,
      [input.userId, input.source, input.reason, input.recommendedAction, JSON.stringify(input.payload)]
    );

    return {
      escalationId: result.rows[0].escalation_id,
      status: result.rows[0].status,
      recommendedAction: result.rows[0].recommended_action
    };
  }
}
