import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { OtpPurpose, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { PrismaService } from '../database/prisma.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  private generateSixDigitOtp(): string {
    return String(crypto.randomInt(100000, 999999));
  }

  private signAccessToken(user: { id: string; email: string; role: string }) {
    return this.jwtService.sign(
      { sub: user.id, email: user.email, role: user.role },
      {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET', 'fallback-secret'),
        expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '1d'),
      },
    );
  }

  private sanitizeUser(user: any) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar_url: user.avatar_url,
      preferred_city: user.preferred_city,
      budget_tier: user.budget_tier,
      is_verified: user.is_verified,
    };
  }

  private async issueAndSendOtp(email: string, purpose: OtpPurpose) {
    const rawOtp = this.generateSixDigitOtp();
    const codeHash = await bcrypt.hash(rawOtp, 8);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Invalidate previous unverified OTPs for same purpose
    await this.prisma.otp_verification.deleteMany({
      where: { email, purpose, verified: false },
    });

    await this.prisma.otp_verification.create({
      data: {
        email,
        code_hash: codeHash,
        purpose,
        expires_at: expiresAt,
      },
    });

    await this.mailService.sendOtpEmail(email, rawOtp, purpose);
  }

  async register(data: {
    name: string;
    email: string;
    password: string;
    preferred_city?: string;
    budget_tier?: string;
  }) {
    const email = data.email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });

    if (existing && existing.is_verified) {
      throw new ConflictException('An account with this email already exists. Please sign in.');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    if (existing && !existing.is_verified) {
      await this.prisma.user.update({
        where: { email },
        data: {
          name: data.name.trim(),
          password_hash: passwordHash,
          preferred_city: data.preferred_city || 'Dhaka',
          budget_tier: data.budget_tier || 'Medium',
        },
      });
    } else {
      await this.prisma.user.create({
        data: {
          email,
          name: data.name.trim(),
          password_hash: passwordHash,
          role: UserRole.TRAVELER,
          is_verified: false,
          preferred_city: data.preferred_city || 'Dhaka',
          budget_tier: data.budget_tier || 'Medium',
        },
      });
    }

    await this.issueAndSendOtp(email, OtpPurpose.REGISTER);

    return {
      message: 'Verification code sent to your email address.',
      email,
      requiresVerification: true,
    };
  }

  async verifyRegisterOtp(emailRaw: string, otp: string) {
    const email = emailRaw.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new BadRequestException('No account found for this email.');
    }

    const record = await this.prisma.otp_verification.findFirst({
      where: { email, purpose: OtpPurpose.REGISTER, verified: false },
      orderBy: { created_at: 'desc' },
    });

    if (!record) {
      throw new BadRequestException('No pending OTP found. Please request a new code.');
    }

    if (record.expires_at < new Date()) {
      throw new BadRequestException('Verification code has expired. Please request a new one.');
    }

    if (record.attempts >= 5) {
      throw new ForbiddenException('Too many incorrect attempts. Please request a new code.');
    }

    const isMatch = await bcrypt.compare(otp.trim(), record.code_hash);
    if (!isMatch) {
      await this.prisma.otp_verification.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } },
      });
      throw new BadRequestException('Invalid verification code. Please check and try again.');
    }

    await this.prisma.$transaction([
      this.prisma.otp_verification.update({
        where: { id: record.id },
        data: { verified: true },
      }),
      this.prisma.user.update({
        where: { id: user.id },
        data: { is_verified: true },
      }),
    ]);

    const verifiedUser = await this.prisma.user.findUnique({ where: { id: user.id } });
    const accessToken = this.signAccessToken(verifiedUser!);

    return {
      message: 'Email verified successfully.',
      access_token: accessToken,
      user: this.sanitizeUser(verifiedUser),
    };
  }

  async resendOtp(emailRaw: string, purpose: 'REGISTER' | 'RESET_PASSWORD') {
    const email = emailRaw.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new BadRequestException('Account not found for this email.');
    }
    await this.issueAndSendOtp(email, purpose as OtpPurpose);
    return { message: 'A new verification code has been sent to your email.' };
  }

  async login(emailRaw: string, password: string) {
    const email = emailRaw.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || !user.password_hash) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    if (!user.is_verified) {
      await this.issueAndSendOtp(email, OtpPurpose.REGISTER);
      throw new ForbiddenException({
        message: 'Email not verified yet. A fresh 6-digit OTP has been sent to your inbox.',
        requiresVerification: true,
        email,
      });
    }

    const accessToken = this.signAccessToken(user);
    return {
      access_token: accessToken,
      user: this.sanitizeUser(user),
    };
  }

  async handleGoogleLogin(googleUser: {
    googleId: string;
    email: string;
    name: string;
    avatarUrl: string | null;
  }) {
    if (!googleUser?.email) {
      throw new UnauthorizedException('Google account email is unavailable.');
    }

    const email = googleUser.email.trim().toLowerCase();
    let user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          name: googleUser.name,
          google_id: googleUser.googleId,
          avatar_url: googleUser.avatarUrl,
          is_verified: true,
          role: UserRole.TRAVELER,
          preferred_city: 'Dhaka',
        },
      });
    } else if (!user.google_id || !user.is_verified) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          google_id: googleUser.googleId,
          avatar_url: user.avatar_url || googleUser.avatarUrl,
          is_verified: true,
        },
      });
    }

    const accessToken = this.signAccessToken(user);
    return {
      access_token: accessToken,
      user: this.sanitizeUser(user),
    };
  }

  async forgotPassword(emailRaw: string) {
    const email = emailRaw.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Avoid user enumeration leaks while staying helpful
      return { message: 'If this email is registered, a password reset OTP has been sent.' };
    }

    await this.issueAndSendOtp(email, OtpPurpose.RESET_PASSWORD);
    return { message: 'Password reset code sent to your email address.' };
  }

  async verifyResetOtp(emailRaw: string, otp: string) {
    const email = emailRaw.trim().toLowerCase();
    const record = await this.prisma.otp_verification.findFirst({
      where: { email, purpose: OtpPurpose.RESET_PASSWORD, verified: false },
      orderBy: { created_at: 'desc' },
    });

    if (!record || record.expires_at < new Date()) {
      throw new BadRequestException('Reset code is invalid or expired.');
    }
    if (record.attempts >= 5) {
      throw new ForbiddenException('Too many attempts. Please request a new code.');
    }

    const isMatch = await bcrypt.compare(otp.trim(), record.code_hash);
    if (!isMatch) {
      await this.prisma.otp_verification.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } },
      });
      throw new BadRequestException('Invalid verification code.');
    }

    return { valid: true, message: 'Code verified. You can now set a new password.' };
  }

  async resetPassword(emailRaw: string, otp: string, newPassword: string) {
    const email = emailRaw.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new BadRequestException('Account not found.');
    }

    const record = await this.prisma.otp_verification.findFirst({
      where: { email, purpose: OtpPurpose.RESET_PASSWORD, verified: false },
      orderBy: { created_at: 'desc' },
    });

    if (!record || record.expires_at < new Date()) {
      throw new BadRequestException('Reset code is invalid or expired.');
    }

    const isMatch = await bcrypt.compare(otp.trim(), record.code_hash);
    if (!isMatch) {
      throw new BadRequestException('Invalid verification code.');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.$transaction([
      this.prisma.otp_verification.update({
        where: { id: record.id },
        data: { verified: true },
      }),
      this.prisma.user.update({
        where: { id: user.id },
        data: { password_hash: passwordHash, is_verified: true },
      }),
    ]);

    return { message: 'Password updated successfully. You can now sign in.' };
  }

  async updateProfile(
    userId: string,
    data: { name?: string; preferred_city?: string; budget_tier?: string },
  ) {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name ? { name: data.name.trim() } : {}),
        ...(data.preferred_city ? { preferred_city: data.preferred_city } : {}),
        ...(data.budget_tier ? { budget_tier: data.budget_tier } : {}),
      },
    });
    return this.sanitizeUser(updated);
  }
}
