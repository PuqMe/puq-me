import type { FastifyInstance } from "fastify";

interface EmailTemplate {
  subject: string;
  html: string;
}

export class EmailService {
  constructor(private readonly app: FastifyInstance) {}

  private generateTemplate(templateName: string, data: Record<string, unknown>): EmailTemplate {
    const brandColor = "#a855f7";
    const backgroundColor = "#090812";

    switch (templateName) {
      case "email_verification":
        return this.emailVerificationTemplate(data as { email: string; token: string });
      case "password_reset":
        return this.passwordResetTemplate(data as { email: string; token: string });
      case "match_notification":
        return this.matchNotificationTemplate(data as { email: string; matchName: string; matchPhoto?: string });
      case "data_export_ready":
        return this.dataExportReadyTemplate(data as { email: string; downloadUrl: string });
      default:
        return { subject: "PuQ.me Notification", html: "<p>Notification from PuQ.me</p>" };
    }
  }

  private emailVerificationTemplate(data: { email: string; token: string }): EmailTemplate {
    const verificationUrl = `${this.app.config.APP_URL}/verify-email?token=${data.token}`;
    return {
      subject: "Verify your PuQ.me email",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background-color: #f5f5f5; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 20px auto; background-color: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%); color: white; padding: 40px 20px; text-align: center; }
              .header h1 { margin: 0; font-size: 28px; }
              .content { padding: 40px 20px; }
              .content p { color: #333; line-height: 1.6; margin: 0 0 20px 0; }
              .button { display: inline-block; background-color: #a855f7; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
              .footer { background-color: #f9f9f9; padding: 20px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #eee; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to PuQ.me</h1>
              </div>
              <div class="content">
                <p>Hello ${data.email},</p>
                <p>Thank you for signing up! Please verify your email address to get started.</p>
                <a href="${verificationUrl}" class="button">Verify Email</a>
                <p style="color: #999; font-size: 12px;">Or copy this link: <br><code>${verificationUrl}</code></p>
                <p>This link will expire in 24 hours.</p>
              </div>
              <div class="footer">
                <p>&copy; 2026 PuQ.me. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `
    };
  }

  private passwordResetTemplate(data: { email: string; token: string }): EmailTemplate {
    const resetUrl = `${this.app.config.APP_URL}/reset-password?token=${data.token}`;
    return {
      subject: "Reset your PuQ.me password",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background-color: #f5f5f5; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 20px auto; background-color: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%); color: white; padding: 40px 20px; text-align: center; }
              .header h1 { margin: 0; font-size: 28px; }
              .content { padding: 40px 20px; }
              .content p { color: #333; line-height: 1.6; margin: 0 0 20px 0; }
              .button { display: inline-block; background-color: #a855f7; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
              .footer { background-color: #f9f9f9; padding: 20px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #eee; }
              .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; border-radius: 4px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Reset Your Password</h1>
              </div>
              <div class="content">
                <p>Hi ${data.email},</p>
                <p>We received a request to reset your password. Click the button below to create a new password.</p>
                <a href="${resetUrl}" class="button">Reset Password</a>
                <p style="color: #999; font-size: 12px;">Or copy this link: <br><code>${resetUrl}</code></p>
                <div class="warning">
                  <strong>Security tip:</strong> If you didn't request this, you can safely ignore this email. Your password will remain unchanged.
                </div>
                <p>This link will expire in 1 hour.</p>
              </div>
              <div class="footer">
                <p>&copy; 2026 PuQ.me. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `
    };
  }

  private matchNotificationTemplate(data: { email: string; matchName: string; matchPhoto?: string }): EmailTemplate {
    const appUrl = `${this.app.config.APP_URL}/matches`;
    return {
      subject: `You have a new match on PuQ.me: ${data.matchName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background-color: #f5f5f5; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 20px auto; background-color: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%); color: white; padding: 40px 20px; text-align: center; }
              .header h1 { margin: 0; font-size: 28px; }
              .match-card { text-align: center; padding: 30px 20px; }
              .match-photo { width: 150px; height: 150px; border-radius: 50%; object-fit: cover; margin: 0 auto 20px; display: block; border: 4px solid #a855f7; }
              .match-name { font-size: 24px; color: #333; margin: 0 0 10px 0; font-weight: 600; }
              .content { padding: 0 20px 40px 20px; }
              .button { display: inline-block; background-color: #a855f7; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
              .footer { background-color: #f9f9f9; padding: 20px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #eee; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 You Have a Match!</h1>
              </div>
              <div class="match-card">
                ${data.matchPhoto ? `<img src="${data.matchPhoto}" alt="${data.matchName}" class="match-photo">` : ""}
                <p class="match-name">${data.matchName}</p>
                <p>You both liked each other! Start a conversation now.</p>
                <a href="${appUrl}" class="button">View Match</a>
              </div>
              <div class="footer">
                <p>&copy; 2026 PuQ.me. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `
    };
  }

  private dataExportReadyTemplate(data: { email: string; downloadUrl: string }): EmailTemplate {
    return {
      subject: "Your PuQ.me data export is ready",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background-color: #f5f5f5; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 20px auto; background-color: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%); color: white; padding: 40px 20px; text-align: center; }
              .header h1 { margin: 0; font-size: 28px; }
              .content { padding: 40px 20px; }
              .content p { color: #333; line-height: 1.6; margin: 0 0 20px 0; }
              .button { display: inline-block; background-color: #a855f7; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
              .footer { background-color: #f9f9f9; padding: 20px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #eee; }
              .note { background-color: #f0f0f0; padding: 12px; border-radius: 4px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Your Data Export</h1>
              </div>
              <div class="content">
                <p>Hello ${data.email},</p>
                <p>Your data export is ready to download. This includes your profile information, matches, and conversations.</p>
                <a href="${data.downloadUrl}" class="button">Download Your Data</a>
                <div class="note">
                  <strong>Note:</strong> This link will expire in 7 days. Please download your data before then.
                </div>
              </div>
              <div class="footer">
                <p>&copy; 2026 PuQ.me. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `
    };
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const template = this.generateTemplate("email_verification", { email, token });
    await this.sendEmail(email, template.subject, template.html);
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const template = this.generateTemplate("password_reset", { email, token });
    await this.sendEmail(email, template.subject, template.html);
  }

  async sendMatchNotification(email: string, matchName: string, matchPhoto?: string): Promise<void> {
    const template = this.generateTemplate("match_notification", { email, matchName, matchPhoto });
    await this.sendEmail(email, template.subject, template.html);
  }

  async sendDataExportReady(email: string, downloadUrl: string): Promise<void> {
    const template = this.generateTemplate("data_export_ready", { email, downloadUrl });
    await this.sendEmail(email, template.subject, template.html);
  }

  private async sendEmail(to: string, subject: string, html: string): Promise<void> {
    if (this.app.config.NODE_ENV === "development") {
      this.app.log.info(`[EMAIL] ${subject} -> ${to}`);
      this.app.log.debug(`[EMAIL CONTENT]\n${html}`);
      return;
    }

    try {
      const nodemailer = await import("nodemailer");

      const transporter = nodemailer.createTransport({
        host: this.app.config.SMTP_HOST,
        port: this.app.config.SMTP_PORT,
        secure: this.app.config.SMTP_PORT === 465,
        auth: {
          user: this.app.config.SMTP_USER,
          pass: this.app.config.SMTP_PASS
        }
      });

      await transporter.sendMail({
        from: this.app.config.EMAIL_FROM,
        to,
        subject,
        html
      });

      this.app.log.info(`Email sent: ${subject} -> ${to}`);
    } catch (error) {
      this.app.log.error(`Failed to send email to ${to}: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
}
