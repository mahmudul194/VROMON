'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowRight, CheckCircle2, Loader2, Lock, Mail } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<'request' | 'otp' | 'reset' | 'done'>('request');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    } catch (err: any) {
      setError(err.message || 'Failed to send reset code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiFetch('/auth/verify-reset-otp', {
        method: 'POST',
        body: JSON.stringify({ email, otp }),
      });
      setStep('reset');
    } catch (err: any) {
      setError(err.message || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
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

  return (
    <div className="mx-auto flex min-h-[calc(100vh-160px)] max-w-md items-center px-4 py-12">
      <div className="w-full rounded-[28px] bg-white p-7 sm:p-9 shadow-ambient border border-vromon-pill">
        {error && (
          <div className="mb-5 flex items-start gap-2 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-vromon-danger">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {step === 'request' && (
          <form onSubmit={handleRequestCode} className="space-y-5">
            <div className="text-center">
              <h1 className="text-2xl font-extrabold text-vromon-dark">Reset Password</h1>
              <p className="mt-1 text-sm text-vromon-muted">
                We will send a 6-digit reset OTP to your registered email.
              </p>
            </div>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-vromon-olive" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-12 w-full rounded-full border border-vromon-border/70 bg-vromon-leaf pl-11 pr-4 text-sm text-vromon-dark focus:border-vromon-primary focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-vromon-primary text-sm font-semibold text-white hover:bg-vromon-deep"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>Send Reset Code</span>
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="text-center">
              <h1 className="text-2xl font-extrabold text-vromon-dark">Enter Reset OTP</h1>
              <p className="mt-1 text-sm text-vromon-muted">
                Check your email <strong>{email}</strong> for the 6-digit code.
              </p>
            </div>
            <input
              type="text"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="h-14 w-full rounded-2xl border-2 border-vromon-border bg-vromon-leaf text-center text-2xl font-extrabold tracking-[0.5em] text-vromon-dark focus:border-vromon-primary focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-vromon-primary text-sm font-semibold text-white hover:bg-vromon-deep"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>Verify OTP</span>
            </button>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div className="text-center">
              <h1 className="text-2xl font-extrabold text-vromon-dark">Set New Password</h1>
              <p className="mt-1 text-sm text-vromon-muted">Choose a strong new password.</p>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-vromon-olive" />
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password (min 6 chars)"
                className="h-12 w-full rounded-full border border-vromon-border/70 bg-vromon-leaf pl-11 pr-4 text-sm text-vromon-dark focus:border-vromon-primary focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-vromon-primary text-sm font-semibold text-white hover:bg-vromon-deep"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>Update Password</span>
            </button>
          </form>
        )}

        {step === 'done' && (
          <div className="py-6 text-center space-y-4">
            <CheckCircle2 className="mx-auto h-12 w-12 text-vromon-accent" />
            <h2 className="text-2xl font-extrabold text-vromon-dark">Password Updated</h2>
            <p className="text-sm text-vromon-muted">
              Your password has been securely updated.
            </p>
            <Link
              href="/login"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-vromon-primary px-6 text-sm font-semibold text-white hover:bg-vromon-deep"
            >
              <span>Go to Sign In</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
