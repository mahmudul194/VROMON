'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<'request' | 'otp' | 'reset' | 'done'>('request');
  const [email, setEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (step !== 'otp' || countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [step, countdown]);

  const strength = useMemo(() => {
    if (!newPassword) return { level: 0, label: 'Enter password' };
    let score = 0;
    if (newPassword.length >= 8) score++;
    if (/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword)) score++;
    if (/[0-9]/.test(newPassword) || /[^A-Za-z0-9]/.test(newPassword)) score++;
    if (score <= 1) return { level: 1, label: 'Weak' };
    if (score === 2) return { level: 2, label: 'Fair' };
    return { level: 3, label: 'Strong' };
  }, [newPassword]);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setStep('otp');
      setCountdown(60);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset code.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otpDigits];
    if (value.length > 1) {
      value
        .slice(0, 6)
        .split('')
        .forEach((ch, idx) => {
          if (index + idx < 6) next[index + idx] = ch;
        });
      setOtpDigits(next);
      return;
    }
    next[index] = value;
    setOtpDigits(next);
    if (value && index < 5) {
      document.getElementById(`reset-otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      document.getElementById(`reset-otp-${index - 1}`)?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = otpDigits.join('');
    if (otp.length !== 6) {
      setError('Please enter the 6-digit recovery code.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await apiFetch('/auth/verify-reset-otp', {
        method: 'POST',
        body: JSON.stringify({ email, otp }),
      });
      setStep('reset');
    } catch (err: any) {
      setError(err.message || 'Invalid or expired recovery code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resending) return;
    setError('');
    setResending(true);
    try {
      await apiFetch('/auth/resend-otp', {
        method: 'POST',
        body: JSON.stringify({ email, purpose: 'RESET_PASSWORD' }),
      });
      setCountdown(60);
    } catch (err: any) {
      setError(err.message || 'Could not resend code.');
    } finally {
      setResending(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmPassword && newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    const otp = otpDigits.join('');
    setError('');
    setLoading(true);
    try {
      await apiFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, otp, newPassword }),
      });
      setStep('done');
    } catch (err: any) {
      setError(err.message || 'Could not reset password.');
    } finally {
      setLoading(false);
    }
  };

  const stepNum = step === 'request' ? 1 : step === 'otp' ? 2 : step === 'reset' ? 3 : 4;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-120px)] max-w-[490px] items-center px-4 pb-12 pt-16">
      {/* Stitch 05_forgot_a / 06_forgot_b Centered Floating-Icon Card */}
      <div className="relative w-full rounded-[28px] border border-[#D5E6CF]/70 bg-white px-7 pb-8 pt-12 shadow-[0_20px_55px_-16px_rgba(31,42,31,0.14)] sm:px-9">
        {/* Floating Dark Green Lock+Key Circle */}
        <div className="absolute -top-8 left-1/2 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full border-4 border-[#E5F0E0] bg-[#2F6B2F] text-[#FFCB3D] shadow-md">
          {step === 'done' ? <CheckCircle2 className="h-7 w-7" /> : <KeyRound className="h-7 w-7" />}
        </div>

        <div className="mb-6 text-center">
          <span className="inline-block rounded-full bg-[#eaf7e6] px-3.5 py-1 text-[13px] font-semibold uppercase tracking-[0.06em] text-[#2F6B2F]">
            Password Recovery
          </span>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === 'request' && (
          <form onSubmit={handleRequestCode} className="space-y-5">
            <div className="text-center">
              <h1 className="text-[36px] md:text-[40px] font-extrabold tracking-tight text-[#1F2A1F]">
                Forgot your password?
              </h1>
              <p className="mt-1.5 text-[16px] text-[#557945]">
                Enter your registered email and we will send a 6-digit recovery code.
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-[14px] font-bold uppercase tracking-wider text-[#557945]">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5D9253]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-[54px] w-full rounded-full border border-[#D5E6CF] bg-[#eaf7e6]/75 pl-12 pr-5 text-[14px] font-medium text-[#1F2A1F] focus:border-[#2F6B2F] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex h-[54px] w-full items-center justify-between rounded-full bg-[#2F6B2F] pl-6 pr-2.5 text-[14px] font-bold text-white transition hover:bg-[#145219] disabled:opacity-60"
            >
              <span>{loading ? 'Sending code...' : 'Send Reset OTP'}</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFCB3D] text-[#1F2A1F]">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              </span>
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="text-center">
              <h1 className="text-[36px] md:text-[40px] font-extrabold tracking-tight text-[#1F2A1F]">
                Enter recovery code
              </h1>
              <p className="mt-1.5 text-[16px] text-[#557945]">
                Check <span className="font-bold text-[#1F2A1F]">{email}</span> for the 6-digit OTP.
              </p>
            </div>

            <div className="flex justify-between gap-2">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  id={`reset-otp-${idx}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className="h-14 w-11 rounded-2xl border-2 border-[#D5E6CF] bg-[#eaf7e6]/75 text-center text-lg font-extrabold text-[#1F2A1F] focus:border-[#2F6B2F] focus:bg-white focus:outline-none sm:w-12"
                />
              ))}
            </div>

            <div className="flex items-center justify-between text-[14px] font-semibold text-[#557945]">
              <span>
                {countdown > 0 ? `Resend in ${countdown}s` : 'Need another code?'}
              </span>
              <button
                type="button"
                onClick={handleResend}
                disabled={countdown > 0 || resending}
                className="font-bold text-[#2F6B2F] hover:underline disabled:opacity-40"
              >
                {resending ? 'Resending...' : 'Resend OTP'}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex h-[54px] w-full items-center justify-between rounded-full bg-[#2F6B2F] pl-6 pr-2.5 text-[14px] font-bold text-white transition hover:bg-[#145219] disabled:opacity-60"
            >
              <span>{loading ? 'Verifying...' : 'Verify OTP'}</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFCB3D] text-[#1F2A1F]">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              </span>
            </button>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="text-center">
              <h1 className="text-[36px] md:text-[40px] font-extrabold tracking-tight text-[#1F2A1F]">
                Create new password
              </h1>
              <p className="mt-1 text-[16px] text-[#557945]">
                Choose a strong password for your VROMON account.
              </p>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-[14px] font-bold uppercase tracking-wider text-[#557945]">
                  New Password
                </label>
                <span className="text-[14px] font-bold text-[#557945]">{strength.label}</span>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5D9253]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="h-[52px] w-full rounded-full border border-[#D5E6CF] bg-[#eaf7e6]/75 pl-12 pr-12 text-[14px] font-medium text-[#1F2A1F] focus:border-[#2F6B2F] focus:bg-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#557945]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-1.5">
                {[1, 2, 3].map((bar) => (
                  <div
                    key={bar}
                    className={`h-1.5 rounded-full ${
                      strength.level >= bar
                        ? strength.level === 1
                          ? 'bg-red-400'
                          : strength.level === 2
                          ? 'bg-[#FFCB3D]'
                          : 'bg-[#2F6B2F]'
                        : 'bg-[#E5F0E0]'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[14px] font-bold uppercase tracking-wider text-[#557945]">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5D9253]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="h-[52px] w-full rounded-full border border-[#D5E6CF] bg-[#eaf7e6]/75 pl-12 pr-5 text-[14px] font-medium text-[#1F2A1F] focus:border-[#2F6B2F] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex h-[54px] w-full items-center justify-between rounded-full bg-[#2F6B2F] pl-6 pr-2.5 text-[14px] font-bold text-white transition hover:bg-[#145219] disabled:opacity-60"
            >
              <span>{loading ? 'Updating...' : 'Update Password'}</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFCB3D] text-[#1F2A1F]">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              </span>
            </button>
          </form>
        )}

        {step === 'done' && (
          <div className="space-y-5 py-2 text-center">
            <h1 className="text-[36px] md:text-[40px] font-extrabold text-[#1F2A1F]">Password updated</h1>
            <p className="text-[16px] text-[#557945]">
              Your account password has been updated cleanly. You can sign in now.
            </p>
            <Link
              href="/login"
              className="flex h-[54px] w-full items-center justify-between rounded-full bg-[#2F6B2F] pl-6 pr-2.5 text-[14px] font-bold text-white hover:bg-[#145219]"
            >
              <span>Return to Log in</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFCB3D] text-[#1F2A1F]">
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
        )}

        {/* 4-Dot Step Indicator + Back Link */}
        <div className="mt-7 flex items-center justify-between border-t border-[#E5F0E0] pt-5">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-[14px] font-bold text-[#557945] hover:text-[#1F2A1F]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Sign in
          </Link>

          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4].map((dot) => (
              <span
                key={dot}
                className={`h-2 rounded-full transition-all ${
                  stepNum === dot
                    ? 'w-5 bg-[#2F6B2F]'
                    : stepNum > dot
                    ? 'w-2 bg-[#5D9253]'
                    : 'w-2 bg-[#D5E6CF]'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
