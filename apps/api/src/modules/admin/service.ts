import type { FastifyInstance } from "fastify";
import { AdminRepository } from "./repository.js";

export class AdminService {
  private readonly repository: AdminRepository;

  constructor(app: FastifyInstance) {
    this.repository = new AdminRepository(app);
  }

  getDashboardStats() {
    return this.repository.getDashboardStats();
  }

  updateUserStatus(userId: string, status: string) {
    return this.repository.updateUserStatus(userId, status);
  }

  listReports(query: { status?: string; targetType?: string; limit: number }) {
    return this.repository.listReports(query);
  }

  getReport(reportId: string) {
    return this.repository.getReport(reportId);
  }

  async updateReport(reportId: string, adminUserId: string, input: { status: string; resolution?: string }) {
    const report = await this.repository.updateReport(reportId, adminUserId, input);
    await this.repository.logAudit({
      actorUserId: adminUserId,
      action: "report.status_updated",
      entityType: "report",
      entityId: reportId,
      payload: input
    });
    return report;
  }

  async addReportNote(reportId: string, adminUserId: string, note: string) {
    const created = await this.repository.addReportNote(reportId, adminUserId, note);
    await this.repository.logAudit({
      actorUserId: adminUserId,
      action: "report.note_added",
      entityType: "report",
      entityId: reportId,
      payload: {
        noteId: created.noteId
      }
    });
    return created;
  }
}
