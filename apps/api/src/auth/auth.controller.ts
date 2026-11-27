import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { AuthService } from './auth.service';
import {
  ForgotPasswordSchema,
  LoginSchema,
  RegisterSchema,
  ResendOtpSchema,
  ResetPasswordSchema,
  UpdateProfileSchema,
  VerifyOtpSchema,
} from './dto/auth.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @Throttle({ default: { limit: 15, ttl: 60000 } })
  @UsePipes(new ZodValidationPipe(RegisterSchema))
  async register(@Body() body: any) {
    return this.authService.register(body);
  }

  @Post('verify-otp')
  @Throttle({ default: { limit: 15, ttl: 60000 } })
  @UsePipes(new ZodValidationPipe(VerifyOtpSchema))
  async verifyOtp(@Body() body: { email: string; otp: string }) {
    return this.authService.verifyRegisterOtp(body.email, body.otp);
  }

  @Post('resend-otp')
  @Throttle({ default: { limit: 6, ttl: 60000 } })
  @UsePipes(new ZodValidationPipe(ResendOtpSchema))
  async resendOtp(@Body() body: { email: string; purpose: 'REGISTER' | 'RESET_PASSWORD' }) {
    return this.authService.resendOtp(body.email, body.purpose);
  }

  @Post('login')
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @UsePipes(new ZodValidationPipe(LoginSchema))
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Post('forgot-password')
  @Throttle({ default: { limit: 6, ttl: 60000 } })
  @UsePipes(new ZodValidationPipe(ForgotPasswordSchema))
  async forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('verify-reset-otp')
  @UsePipes(new ZodValidationPipe(VerifyOtpSchema))
  async verifyResetOtp(@Body() body: { email: string; otp: string }) {
    return this.authService.verifyResetOtp(body.email, body.otp);
  }

  @Post('reset-password')
  @UsePipes(new ZodValidationPipe(ResetPasswordSchema))
  async resetPassword(@Body() body: { email: string; otp: string; newPassword: string }) {
    return this.authService.resetPassword(body.email, body.otp, body.newPassword);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    // Redirects to Google
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthCallback(@Req() req: any, @Res() res: Response) {
    const webOrigin = this.configService.get<string>('WEB_ORIGIN', 'http://localhost:3000');
    try {
      const result = await this.authService.handleGoogleLogin(req.user);
      const redirectUrl = `${webOrigin}/auth/callback?token=${encodeURIComponent(result.access_token)}`;
      return res.redirect(redirectUrl);
    } catch {
      return res.redirect(`${webOrigin}/login?error=google_auth_failed`);
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: any) {
    return { user: req.user };
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Req() req: any,
    @Body(new ZodValidationPipe(UpdateProfileSchema)) body: any,
  ) {
    const user = await this.authService.updateProfile(req.user.id, body);
    return { user };
  }
}
