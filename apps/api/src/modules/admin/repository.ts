import type { FastifyInstance } from "fastify";
import { NotFoundError } from "../../common/errors.js";

type ReportRow = {
  report_id: string;
  target_type: "user" | "profile" | "message";
  target_user_id: string | null;
  target_message_id: string | null;
  reason: string;
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

export class AdminRepository {
  constructor(private readonly app: FastifyInstance) {}

  async getDashboardStats() {
    const result = await this.app.db.query<{
      open_reports: number;
      flagged_chats: number;
      high_risk_users: number;
    }>(
      `select
         (select count(*)::int from reports where status in ('open', 'in_review')) as open_reports,
         (select count(*)::int from reports where target_type = 'message' and status in ('open', 'in_review')) as flagged_chats,
         (select count(*)::int from users where status in ('suspended', 'banned')) as high_risk_users`
    );

    return {
      openReports: Number(result.rows[0]?.open_reports ?? 0),
      flaggedChats: Number(result.rows[0]?.flagged_chats ?? 0),
      highRiskUsers: Number(result.rows[0]?.high_risk_users ?? 0)
    };
  }

  async updateUserStatus(userId: string, status: string) {
    const result = await this.app.db.query<{ id: string; status: string }>(
      `update users
       set status = $2,
           updated_at = now()
       where id = $1::bigint
       returning id::text, status`,
      [userId, status]
    );

    const row = result.rows[0];
    if (!row) {
      throw new NotFoundError("admin_user_not_found");
    }

    return {
      userId: row.id,
      status: row.status
    };
  }

  private async loadReportNotes(reportIds: string[]) {
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
      const current = byReport.get(row.report_id) ?? [];
      current.push(row);
      byReport.set(row.report_id, current);
    }
    return byReport;
  }

  private async mapReports(rows: ReportRow[]) {
    const notesByReport = await this.loadReportNotes(rows.map((row) => row.report_id));

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

  async listReports(query: { status?: string; targetType?: string; limit: number }) {
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
       where ($1::text is null or status = $1::text)
         and ($2::text is null or target_type = $2::text)
       order by created_at desc
       limit $3`,
      [query.status ?? null, query.targetType ?? null, query.limit]
    );

    return this.mapReports(result.rows);
  }

  async getReport(reportId: string) {
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
       where id = $1::bigint
       limit 1`,
      [reportId]
    );

    const report = (await this.mapReports(result.rows))[0];
    if (!report) {
      throw new NotFoundError("admin_report_not_found");
    }
    return report;
  }

  async updateReport(reportId: string, adminUserId: string, input: { status: string; resolution?: string }) {
    const result = await this.app.db.query<ReportRow>(
      `update reports
       set status = $2,
           resolution = $3,
           assigned_admin_user_id = $4::bigint,
           updated_at = now()
       where id = $1::bigint
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
      [reportId, input.status, input.resolution ?? null, adminUserId]
    );

    const report = (await this.mapReports(result.rows))[0];
    if (!report) {
      throw new NotFoundError("admin_report_not_found");
    }
    return report;
  }

  async addReportNote(reportId: string, adminUserId: string, note: string) {
    const noteResult = await this.app.db.query<ReportNoteRow>(
      `insert into report_admin_notes (report_id, admin_user_id, note, created_at)
       values ($1::bigint, $2::bigint, $3, now())
       returning
         id::text as note_id,
         report_id::text,
         admin_user_id::text,
         note,
         created_at::text`,
      [reportId, adminUserId, note]
    );

    if (!noteResult.rows[0]) {
      throw new NotFoundError("admin_report_not_found");
    }

    return {
      noteId: noteResult.rows[0].note_id,
      reportId: noteResult.rows[0].report_id,
      adminUserId: noteResult.rows[0].admin_user_id,
      note: noteResult.rows[0].note,
      createdAt: noteResult.rows[0].created_at
    };
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
}
