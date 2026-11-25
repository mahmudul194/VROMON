import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('MAIL_HOST', 'smtp.gmail.com');
    const port = Number(this.configService.get<string>('MAIL_PORT', '465'));
    const user = this.configService.get<string>('MAIL_USER');
    const pass = this.configService.get<string>('MAIL_PASS');

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: user && pass ? { user, pass } : undefined,
    });
  }

  async sendOtpEmail(to: string, otpCode: string, purpose: 'REGISTER' | 'RESET_PASSWORD'): Promise<boolean> {
    const from = this.configService.get<string>('MAIL_FROM', 'VROMON <mahmudulhaquerifat@gmail.com>');
    const subject =
      purpose === 'REGISTER'
        ? 'VROMON — Verify Your Email Address'
        : 'VROMON — Password Reset Verification Code';

    const title =
      purpose === 'REGISTER' ? 'Verify your VROMON account' : 'Reset your VROMON password';

    const subtitle =
      purpose === 'REGISTER'
        ? 'Enter this 6-digit verification code to complete your registration. This code expires in 10 minutes.'
        : 'Enter this 6-digit code to set a new password. If you did not request this, you can safely ignore this email.';

    const html = `
      <div style="font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f0fdec; padding: 40px 20px; color: #131e14;">
        <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 24px; padding: 36px; border: 1px solid #d5e6cf;">
          <div style="margin-bottom: 24px;">
            <span style="display: inline-block; background: #2f6b2f; color: #ffffff; font-weight: 700; font-size: 13px; letter-spacing: 0.08em; padding: 6px 14px; border-radius: 9999px;">VROMON</span>
          </div>
          <h1 style="font-size: 24px; font-weight: 700; margin: 0 0 12px; color: #1f2a1f;">${title}</h1>
          <p style="font-size: 15px; line-height: 24px; color: #41493e; margin: 0 0 28px;">${subtitle}</p>
          <div style="background: #f6faf3; border: 1.5px solid #5d9253; border-radius: 16px; padding: 20px; text-align: center; margin-bottom: 28px;">
            <span style="font-size: 32px; font-weight: 800; letter-spacing: 10px; color: #145219;">${otpCode}</span>
          </div>
          <p style="font-size: 13px; color: #71796d; margin: 0;">Bangladesh Smart Trip Feasibility & Risk-Aware Travel Recommender</p>
        </div>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from,
        to,
        subject,
        html,
      });
      this.logger.log(`OTP email sent to ${to} (${purpose})`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send OTP email to ${to}:`, error);
      return false;
    }
  }
}
