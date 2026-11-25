'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, ArrowRight, CheckCircle2, Loader2, Lock, Mail, User } from 'lucide-react';
import { apiFetch, GOOGLE_OAUTH_URL } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

function RegisterInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSession } = useAuth();

  const [step, setStep] = useState<'account' | 'otp' | 'success'>('account');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [preferredCity, setPreferredCity] = useState('Dhaka');
  const [budgetTier, setBudgetTier] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    const verifyEmail = searchParams.get('verify');
    if (verifyEmail) {
      setEmail(verifyEmail);
      setStep('otp');
      setInfo('Enter the 6-digit verification code sent to your email.');
    }
  }, [searchParams]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name,
          email,
          password,
          preferred_city: preferredCity,
          budget_tier: budgetTier,
        }),
      });
      setStep('otp');
      setInfo('A 6-digit verification code has been sent to your email.');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otpDigits];
    if (value.length > 1) {
      const chars = value.slice(0, 6).split('');
      chars.forEach((ch, idx) => {
        if (index + idx < 6) next[index + idx] = ch;
      });
      setOtpDigits(next);
      return;
    }
    next[index] = value;
    setOtpDigits(next);
    if (value && index < 5) {
      document.getElementById(`otp-cell-${index + 1}`)?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpDigits.join('');
    if (code.length !== 6) {
      setError('Please enter all 6 digits.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await apiFetch('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, otp: code }),
      });
      setSession(res.access_token, res.user);
      setStep('success');
      setTimeout(() => router.push('/plan'), 1400);
    } catch (err: any) {
      setError(err.message || 'Invalid verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setInfo('');
    try {
      await apiFetch('/auth/resend-otp', {
        method: 'POST',
        body: JSON.stringify({ email, purpose: 'REGISTER' }),
      });
      setInfo('A fresh 6-digit code was sent to your inbox.');
    } catch (err: any) {
      setError(err.message || 'Could not resend OTP.');
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-160px)] max-w-lg items-center px-4 py-12">
      <div className="w-full rounded-[28px] bg-white p-7 sm:p-9 shadow-ambient border border-vromon-pill">
        {/* Progress Pill */}
        <div className="mb-6 flex items-center justify-center gap-2">
          {['Account & Preferences', 'Email OTP', 'Ready'].map((label, idx) => {
            const currentIdx = step === 'account' ? 0 : step === 'otp' ? 1 : 2;
            const active = idx <= currentIdx;
            return (
              <span
                key={label}
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  active ? 'bg-vromon-primary text-white' : 'bg-vromon-pill text-vromon-muted'
                }`}
              >
                {idx + 1}. {label}
              </span>
            );
          })}
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-2.5 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-vromon-danger">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {info && (
          <div className="mb-5 rounded-2xl bg-vromon-leaf border border-vromon-accent/40 px-4 py-3 text-sm font-medium text-vromon-deep">
            {info}
          </div>
        )}

        {step === 'account' && (
          <>
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-extrabold text-vromon-dark">Create your account</h1>
              <p className="mt-1 text-sm text-vromon-muted">
                First-time registration verifies your email with a 6-digit OTP.
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-vromon-muted">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-vromon-olive" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Md. Mahmudul Hoque"
                    className="h-12 w-full rounded-full border border-vromon-border/70 bg-vromon-leaf pl-11 pr-4 text-sm text-vromon-dark focus:border-vromon-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-vromon-muted">
                  Email Address
                </label>
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
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-vromon-muted">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-vromon-olive" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="h-12 w-full rounded-full border border-vromon-border/70 bg-vromon-leaf pl-11 pr-4 text-sm text-vromon-dark focus:border-vromon-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-vromon-muted">
                    Origin City
                  </label>
                  <select
                    value={preferredCity}
                    onChange={(e) => setPreferredCity(e.target.value)}
                    className="h-12 w-full rounded-full border border-vromon-border/70 bg-vromon-leaf px-4 text-sm font-medium text-vromon-dark focus:border-vromon-primary focus:outline-none"
                  >
                    {['Dhaka', 'Chattogram', 'Sylhet', 'Rajshahi', 'Khulna', 'Barishal'].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-vromon-muted">
                    Style
                  </label>
                  <select
                    value={budgetTier}
                    onChange={(e) => setBudgetTier(e.target.value as any)}
                    className="h-12 w-full rounded-full border border-vromon-border/70 bg-vromon-leaf px-4 text-sm font-medium text-vromon-dark focus:border-vromon-primary focus:outline-none"
                  >
                    <option value="Low">Budget Saver</option>
                    <option value="Medium">Balanced</option>
                    <option value="High">Comfort</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group flex h-12 w-full items-center justify-between rounded-full bg-vromon-primary pl-6 pr-2.5 text-sm font-semibold text-white hover:bg-vromon-deep disabled:opacity-60"
              >
                <span>{loading ? 'Sending OTP...' : 'Send Verification Code'}</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-vromon-amber text-vromon-dark">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                </span>
              </button>
            </form>

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-vromon-pill" />
              <span className="text-xs font-semibold text-vromon-muted">OR</span>
              <div className="h-px flex-1 bg-vromon-pill" />
            </div>

            <a
              href={GOOGLE_OAUTH_URL}
              className="flex h-12 w-full items-center justify-center rounded-full border border-vromon-dark/20 bg-white text-sm font-semibold text-vromon-dark hover:bg-vromon-leaf"
            >
              Sign up with Google
            </a>

            <p className="mt-5 text-center text-sm text-vromon-muted">
              Already registered?{' '}
              <Link href="/login" className="font-bold text-vromon-primary hover:underline">
                Sign In
              </Link>
            </p>
          </>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-6 text-center">
            <div>
              <h1 className="text-2xl font-extrabold text-vromon-dark">Verify your email</h1>
              <p className="mt-1 text-sm text-vromon-muted">
                Enter the 6-digit code sent to <strong className="text-vromon-dark">{email}</strong>
              </p>
            </div>

            <div className="flex justify-center gap-2 sm:gap-3">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-cell-${idx}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  className="h-14 w-11 sm:w-13 rounded-2xl border-2 border-vromon-border bg-vromon-leaf text-center text-xl font-extrabold text-vromon-dark focus:border-vromon-primary focus:bg-white focus:outline-none"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-vromon-primary text-sm font-semibold text-white hover:bg-vromon-deep disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>Verify & Activate Account</span>
            </button>

            <button
              type="button"
              onClick={handleResend}
              className="text-xs font-bold text-vromon-primary hover:underline"
            >
              Resend verification code
            </button>
          </form>
        )}

        {step === 'success' && (
          <div className="py-8 text-center space-y-4">
            <CheckCircle2 className="mx-auto h-14 w-14 text-vromon-accent" />
            <h2 className="text-2xl font-extrabold text-vromon-dark">Account Verified</h2>
            <p className="text-sm text-vromon-muted">
              Welcome to VROMON. Redirecting you to the trip planner...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <RegisterInner />
    </Suspense>
  );
}
