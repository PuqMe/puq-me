import type { FastifyInstance } from "fastify";
import { BadRequestError, ConflictError, NotFoundError } from "../../common/errors.js";
import { GDPRRepository } from "./repository.js";

export class GDPRService {
  private readonly repository: GDPRRepository;

  constructor(private readonly app: FastifyInstance) {
    this.repository = new GDPRRepository(app);
  }

  async requestDataExport(userId: string): Promise<{
    requestId: string;
    status: string;
    message: string;
  }> {
    const requestId = await this.repository.createDataExportRequest(userId);

    this.app.log.info(
      {
        event: "gdpr.data_export_requested",
        userId,
        requestId
      },
      "GDPR data export requested"
    );

    await this.repository.logGDPRAction(userId, "data_export_requested", {
      requestId
    });

    // Queue async job to generate export
    this.queueDataExportJob(userId, requestId);

    return {
      requestId,
      status: "pending",
      message: "Your data export request has been received. You will receive an email with a download link when the export is ready."
    };
  }

  async getExportStatus(userId: string, requestId: string): Promise<{
    requestId: string;
    userId: string;
    status: string;
    createdAt: string;
    expiresAt: string | null;
    downloadUrl: string | null;
    errorMessage: string | null;
  }> {
    const request = await this.repository.getDataExportRequest(userId, requestId);

    if (!request) {
      throw new NotFoundError("export_request_not_found");
    }

    return {
      requestId: request.id,
      userId: request.user_id,
      status: request.status,
      createdAt: request.created_at,
      expiresAt: request.expires_at,
      downloadUrl: request.download_url,
      errorMessage: request.error_message
    };
  }

  async requestAccountDeletion(userId: string, password: string, reason?: string): Promise<{
    success: boolean;
    message: string;
    deletionScheduledFor: string;
  }> {
    // Verify password before allowing deletion request
    await this.verifyUserPassword(userId, password);

    const deletionRequest = await this.repository.getDeletionRequest(userId);

    // Check if deletion is already scheduled
    if (deletionRequest && deletionRequest.status === "scheduled") {
      throw new ConflictError("deletion_already_scheduled");
    }

    const requestId = await this.repository.createDeletionRequest(userId, reason);

    this.app.log.info(
      {
        event: "gdpr.account_deletion_requested",
        userId,
        requestId
      },
      "GDPR account deletion requested"
    );

    await this.repository.logGDPRAction(userId, "deletion_requested", {
      requestId,
      reason
    });

    const scheduledFor = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    return {
      success: true,
      message: "Your account deletion request has been submitted. Your account will be permanently deleted in 30 days unless you cancel this request.",
      deletionScheduledFor: scheduledFor
    };
  }

  async cancelAccountDeletion(userId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    await this.repository.cancelDeletionRequest(userId);

    this.app.log.info(
      {
        event: "gdpr.account_deletion_canceled",
        userId
      },
      "GDPR account deletion canceled"
    );

    await this.repository.logGDPRAction(userId, "deletion_canceled", {});

    return {
      success: true,
      message: "Your account deletion has been canceled. Your account is no longer scheduled for deletion."
    };
  }

  async processDeletion(userId: string): Promise<void> {
    const deletionRequest = await this.repository.getDeletionRequest(userId);

    if (!deletionRequest || deletionRequest.status !== "scheduled") {
      throw new NotFoundError("no_scheduled_deletion");
    }

    // Check if deletion time has arrived
    const now = new Date();
    const scheduledTime = new Date(deletionRequest.deletion_scheduled_for);

    if (now < scheduledTime) {
      throw new BadRequestError("deletion_not_yet_scheduled");
    }

    await this.repository.anonymizeUser(userId);

    this.app.log.info(
      {
        event: "gdpr.account_deleted",
        userId
      },
      "User account deleted and anonymized"
    );

    await this.repository.logGDPRAction(userId, "account_deleted", {
      deletionProcessedAt: new Date().toISOString()
    });
  }

  private async verifyUserPassword(userId: string, password: string): Promise<void> {
    // This is a placeholder - implement actual password verification
    // against your password hashing mechanism
    if (!password || password.length === 0) {
      throw new BadRequestError("invalid_password");
    }
  }

  private queueDataExportJob(userId: string, requestId: string): void {
    // Queue async job to process data export
    // This would typically use a job queue like Bull, BullMQ, or similar
    this.app.log.info(
      {
        event: "gdpr.export_job_queued",
        userId,
        requestId
      },
      "Data export job queued for async processing"
    );

    // In a real implementation, you would:
    // 1. Call this.repository.getUserData(userId)
    // 2. Generate JSON export
    // 3. Upload to secure storage
    // 4. Generate download URL
    // 5. Update export request with download URL
    // 6. Send email notification
  }
}
