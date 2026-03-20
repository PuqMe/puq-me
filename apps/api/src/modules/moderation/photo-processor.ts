import type { FastifyInstance } from "fastify";
import { createHash } from "node:crypto";

export interface ModerationResult {
  photoId: string;
  status: "approved" | "flagged" | "rejected";
  riskScore: number;
  reason?: string;
  timestamp: Date;
}

export class PhotoModerationProcessor {
  private processedHashes: Set<string> = new Set();

  constructor(private readonly app: FastifyInstance) {}

  private calculatePhotoHash(photoData: Buffer): string {
    return createHash("sha256").update(photoData).digest("hex");
  }

  private evaluateRiskScore(photoData: Buffer): number {
    const hash = this.calculatePhotoHash(photoData);

    // Check for duplicate
    if (this.processedHashes.has(hash)) {
      return 0.95; // High risk for duplicate
    }

    // Placeholder NSFW detection heuristic
    // In production, this would use an AI model like OpenAI Vision or ImageNet-based classifier
    const dataString = photoData.toString("utf-8", 0, Math.min(100, photoData.length));
    let score = 0;

    // Simple heuristics based on file characteristics
    if (photoData.length < 5000) {
      score += 0.1; // Very small files might be suspicious
    }

    if (photoData.length > 50_000_000) {
      score += 0.05; // Very large files might indicate processing issues
    }

    // Check for suspicious byte patterns (placeholder)
    const suspiciousPatterns = [0xff, 0xd8, 0xff]; // JPEG header
    let matchCount = 0;
    for (let i = 0; i < Math.min(10, photoData.length); i++) {
      if (photoData[i] === suspiciousPatterns[i % suspiciousPatterns.length]) {
        matchCount++;
      }
    }

    // If file doesn't start with proper image header
    if (matchCount === 0 && photoData.length > 0) {
      score += 0.3;
    }

    // Clamp score between 0 and 1
    return Math.min(1, Math.max(0, score));
  }

  async processQueue(): Promise<ModerationResult[]> {
    const results: ModerationResult[] = [];

    try {
      this.app.log.info("Starting photo moderation queue processing");

      // Query photos pending moderation
      const query = `
        SELECT id, data, created_at
        FROM photos
        WHERE moderation_status = 'pending'
        ORDER BY created_at ASC
        LIMIT 100
      `;

      const result = await this.app.db.query<{
        id: string;
        data: Buffer;
        created_at: string;
      }>(query);

      for (const row of result.rows) {
        try {
          const moderationResult = await this.evaluatePhoto(row.id, row.data);
          results.push(moderationResult);
          await this.autoModerate(row.id, moderationResult);
        } catch (error) {
          this.app.log.error(`Error processing photo ${row.id}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      this.app.log.info(`Processed ${results.length} photos from moderation queue`);
    } catch (error) {
      this.app.log.error(`Photo moderation queue processing failed: ${error instanceof Error ? error.message : String(error)}`);
    }

    return results;
  }

  async evaluatePhoto(photoId: string, photoData: Buffer): Promise<ModerationResult> {
    const riskScore = this.evaluateRiskScore(photoData);

    let status: "approved" | "flagged" | "rejected";
    let reason: string | undefined;

    if (riskScore < 0.3) {
      status = "approved";
    } else if (riskScore < 0.7) {
      status = "flagged";
      reason = "Moderate risk detected - manual review recommended";
    } else {
      status = "rejected";
      reason = "High risk content detected";
    }

    const result: ModerationResult = {
      photoId,
      status,
      riskScore: Math.round(riskScore * 100) / 100,
      reason,
      timestamp: new Date()
    };

    this.app.log.info(`Photo evaluation: ${photoId} - status=${status}, risk=${result.riskScore}`);

    return result;
  }

  async autoModerate(photoId: string, moderationResult: ModerationResult): Promise<void> {
    try {
      let moderationStatus: "approved" | "flagged" | "rejected";
      let reviewedAt: Date | null = null;
      let reviewedBy: string | null = null;

      if (moderationResult.status === "approved") {
        moderationStatus = "approved";
        reviewedAt = new Date();
        reviewedBy = "system_auto";
      } else if (moderationResult.status === "rejected") {
        moderationStatus = "rejected";
        reviewedAt = new Date();
        reviewedBy = "system_auto";
      } else {
        // Keep as pending for manual review
        moderationStatus = "pending";
      }

      const updateQuery = `
        UPDATE photos
        SET moderation_status = $1,
            risk_score = $2,
            reviewed_at = $3,
            reviewed_by = $4,
            updated_at = now()
        WHERE id = $5
      `;

      await this.app.db.query(updateQuery, [
        moderationStatus,
        moderationResult.riskScore,
        reviewedAt?.toISOString() ?? null,
        reviewedBy,
        photoId
      ]);

      if (moderationResult.status === "rejected") {
        this.app.log.warn(`Photo rejected during auto-moderation: ${photoId} (reason: ${moderationResult.reason})`);
      }
    } catch (error) {
      this.app.log.error(`Auto-moderation failed for photo ${photoId}: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
}
