import { z } from 'zod';

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email address is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  preferred_city: z.string().optional().default('Dhaka'),
  budget_tier: z.enum(['Low', 'Medium', 'High']).optional().default('Medium'),
});

export const VerifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

export const ResendOtpSchema = z.object({
  email: z.string().email(),
  purpose: z.enum(['REGISTER', 'RESET_PASSWORD']).default('REGISTER'),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const ResetPasswordSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export const UpdateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  preferred_city: z.string().min(2).optional(),
  budget_tier: z.enum(['Low', 'Medium', 'High']).optional(),
});
