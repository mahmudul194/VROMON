'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  MapPin,
  ShieldCheck,
  User,
} from 'lucide-react';
import { apiFetch, GOOGLE_OAUTH_URL } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const CITIES = [
  'Dhaka',
  'Chattogram',
  'Sylhet',
  'Rajshahi',
  'Khulna',
  'Barishal',
  'Rangpur',
  'Mymensingh',
];

function RegisterInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSession } = useAuth();

  const [step, setStep] = useState<'account' | 'otp' | 'success'>('account');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [preferredCity, setPreferredCity] = useState('Dhaka');
  const [budgetTier, setBudgetTier] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    const verifyEmail = searchParams.get('verify');
    if (verifyEmail) {
      setEmail(verifyEmail);
      setStep('otp');
      setCountdown(60);
      setInfo('Enter the 6-digit verification code sent to your email.');
    }
  }, [searchParams]);

  useEffect(() => {
    if (step !== 'otp' || countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [step, countdown]);

  const strength = useMemo(() => {
    if (!password) return { level: 0, label: 'Enter password' };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 1) return { level: 1, label: 'Weak' };
    if (score === 2) return { level: 2, label: 'Fair' };
    return { level: 3, label: 'Strong' };
  }, [password]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      setError('Please accept the VROMON data & privacy terms to continue.');
      return;
    }
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
      setCountdown(60);
      setInfo('A 6-digit verification code has been sent to your email.');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your details.');
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
      document.getElementById(`reg-otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      document.getElementById(`reg-otp-${index - 1}`)?.focus();
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

  const handleResendOtp = async () => {
    if (countdown > 0 || resending) return;
    setError('');
    setResending(true);
    try {
      await apiFetch('/auth/resend-otp', {
        method: 'POST',
        body: JSON.stringify({ email, purpose: 'REGISTER' }),
      });
      setCountdown(60);
      setInfo('A new 6-digit verification code has been emailed to you.');
    } catch (err: any) {
      setError(err.message || 'Could not resend verification code.');
    } finally {
      setResending(false);
    }
  };

  const stepIndex = step === 'account' ? 1 : step === 'otp' ? 2 : 3;

  return (
    <div className="relative mx-auto flex min-h-[calc(100vh-110px)] max-w-[1140px] items-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid w-full items-stretch gap-6 lg:grid-cols-12">
        {/* Left White Form Card (Stitch 03_register_1 / 04_register_2) */}
        <div className="flex flex-col justify-center rounded-[28px] border border-[#D5E6CF]/70 bg-white p-7 shadow-[0_18px_50px_-14px_rgba(31,42,31,0.12)] sm:p-10 lg:col-span-7">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2.5">
              <img
                src="/vromon_logo.png"
                alt="VROMON"
                className="h-9 w-9 rounded-full border border-[#D5E6CF] object-cover"
              />
              <span className="whitespace-nowrap text-base font-black tracking-tight text-[#1F2A1F]">
                VROMON
              </span>
            </Link>

            {/* 3-Step Horizontal Stepper */}
            <div className="flex items-center gap-2 text-xs font-bold">
              {[
                { n: 1, label: 'Account' },
                { n: 2, label: 'Verify' },
                { n: 3, label: 'Done' },
              ].map((s, idx) => {
                const done = stepIndex > s.n;
                const active = stepIndex === s.n;
                return (
                  <React.Fragment key={s.n}>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 transition ${
                        active
                          ? 'bg-[#2F6B2F] text-white'
                          : done
                          ? 'bg-[#eaf7e6] text-[#2F6B2F]'
                          : 'bg-[#F6FAF3] text-[#557945]'
                      }`}
                    >
                      {done ? <Check className="h-3 w-3" /> : <span>{s.n}.</span>}
                      {s.label}
                    </span>
                    {idx < 2 && <span className="h-px w-3 bg-[#D5E6CF]" />}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {info && !error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-[#D5E6CF] bg-[#eaf7e6] px-4 py-3 text-sm text-[#2F6B2F]">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{info}</span>
            </div>
          )}

          {step === 'account' && (
            <>
              <div className="mb-6">
                <h1 className="text-3xl font-extrabold tracking-tight text-[#1F2A1F]">
                  Start planning smarter
                </h1>
                <p className="mt-1 text-sm text-[#557945]">
                  Set your default hub and comfort style for instant 64-district scoring.
                </p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#557945]">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5D9253]" />
                      <input
                        type="text"
                        required
                        minLength={2}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Mahmudul Haque"
                        className="h-[50px] w-full rounded-full border border-[#D5E6CF] bg-[#eaf7e6]/75 pl-11 pr-4 text-sm font-medium text-[#1F2A1F] focus:border-[#2F6B2F] focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#557945]">
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
                        className="h-[50px] w-full rounded-full border border-[#D5E6CF] bg-[#eaf7e6]/75 pl-11 pr-4 text-sm font-medium text-[#1F2A1F] focus:border-[#2F6B2F] focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#557945]">
                      Password
                    </label>
                    <span className="text-[11px] font-bold text-[#557945]">{strength.label}</span>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5D9253]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="h-[50px] w-full rounded-full border border-[#D5E6CF] bg-[#eaf7e6]/75 pl-11 pr-12 text-sm font-medium text-[#1F2A1F] focus:border-[#2F6B2F] focus:bg-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#557945] hover:text-[#1F2A1F]"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {/* 3-Bar Password Strength Meter */}
                  <div className="mt-2 grid grid-cols-3 gap-1.5">
                    {[1, 2, 3].map((bar) => (
                      <div
                        key={bar}
                        className={`h-1.5 rounded-full transition ${
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

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#557945]">
                      Starting Hub
                    </label>
                    <div className="relative">
                      <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5D9253]" />
                      <select
                        value={preferredCity}
                        onChange={(e) => setPreferredCity(e.target.value)}
                        className="h-[50px] w-full appearance-none rounded-full border border-[#D5E6CF] bg-[#eaf7e6]/75 pl-11 pr-5 text-sm font-semibold text-[#1F2A1F] focus:border-[#2F6B2F] focus:bg-white focus:outline-none"
                      >
                        {CITIES.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#557945]">
                      Budget Comfort Style
                    </label>
                    <div className="grid h-[50px] grid-cols-3 gap-1.5 rounded-full border border-[#D5E6CF] bg-[#F6FAF3] p-1">
                      {(['Low', 'Medium', 'High'] as const).map((tier) => (
                        <button
                          key={tier}
                          type="button"
                          onClick={() => setBudgetTier(tier)}
                          className={`rounded-full text-xs font-bold transition ${
                            budgetTier === tier
                              ? 'bg-[#2F6B2F] text-white shadow-sm'
                              : 'text-[#557945] hover:text-[#1F2A1F]'
                          }`}
                        >
                          {tier}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <label className="flex cursor-pointer items-center gap-2.5 pt-1 text-xs font-medium text-[#557945]">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="h-4 w-4 rounded border-[#D5E6CF] text-[#2F6B2F] focus:ring-[#2F6B2F]"
                  />
                  <span>
                    I agree to VROMON&apos;s responsible travel advisory and verification emails.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-[54px] w-full items-center justify-between rounded-full bg-[#2F6B2F] pl-6 pr-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#145219] disabled:opacity-60"
                >
                  <span>{loading ? 'Sending verification code...' : 'Create account'}</span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFCB3D] text-[#1F2A1F]">
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowRight className="h-4 w-4" />
                    )}
                  </span>
                </button>
              </form>

              <div className="my-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-[#E5F0E0]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#557945]">
                  Or sign up with
                </span>
                <div className="h-px flex-1 bg-[#E5F0E0]" />
              </div>

              <a
                href={GOOGLE_OAUTH_URL}
                className="flex h-[50px] w-full items-center justify-center gap-3 rounded-full border border-[#D5E6CF] bg-[#F6FAF3] text-sm font-semibold text-[#1F2A1F] transition hover:bg-[#eaf7e6]"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </a>
            </>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-6 py-4">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-[#1F2A1F]">
                  Verify your email
                </h1>
                <p className="mt-1.5 text-sm text-[#557945]">
                  Enter the 6-digit code sent to{' '}
                  <span className="font-bold text-[#1F2A1F]">{email}</span>
                </p>
              </div>

              <div className="flex justify-between gap-2 sm:gap-3">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`reg-otp-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="h-14 w-12 rounded-2xl border-2 border-[#D5E6CF] bg-[#eaf7e6]/70 text-center text-xl font-extrabold text-[#1F2A1F] focus:border-[#2F6B2F] focus:bg-white focus:outline-none sm:w-14"
                  />
                ))}
              </div>

              <div className="flex items-center justify-between text-xs font-semibold text-[#557945]">
                <span>
                  {countdown > 0 ? `Resend code available in ${countdown}s` : 'Did not receive the code?'}
                </span>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={countdown > 0 || resending}
                  className="font-bold text-[#2F6B2F] hover:underline disabled:opacity-40"
                >
                  {resending ? 'Resending...' : 'Resend OTP'}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex h-[54px] w-full items-center justify-between rounded-full bg-[#2F6B2F] pl-6 pr-2.5 text-sm font-bold text-white transition hover:bg-[#145219] disabled:opacity-60"
              >
                <span>{loading ? 'Verifying...' : 'Verify & Activate Account'}</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFCB3D] text-[#1F2A1F]">
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStep('account')}
                className="text-xs font-bold text-[#557945] hover:text-[#1F2A1F]"
              >
                Use a different email address
              </button>
            </form>
          )}

          {step === 'success' && (
            <div className="py-10 text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#eaf7e6] text-[#2F6B2F]">
                <CheckCircle2 className="h-9 w-9" />
              </div>
              <h2 className="text-2xl font-extrabold text-[#1F2A1F]">Account verified!</h2>
              <p className="text-sm text-[#557945]">
                Your VROMON travel workspace is ready. Redirecting to Trip Planner...
              </p>
            </div>
          )}

          <p className="mt-6 text-center text-sm text-[#557945]">
            Already registered?{' '}
            <Link href="/login" className="font-bold text-[#2F6B2F] hover:underline">
              Log in
            </Link>
          </p>
        </div>

        {/* Right Dark Destination Showcase Panel */}
        <div className="relative hidden flex-col justify-between overflow-hidden rounded-[28px] bg-gradient-to-br from-[#1F2A1F] via-[#2F6B2F] to-[#145219] p-8 text-white shadow-[0_24px_60px_-15px_rgba(20,82,25,0.4)] lg:col-span-5 lg:flex">
          <div className="space-y-4">
            <span className="inline-block rounded-full bg-[#FFCB3D] px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#1F2A1F]">
              Why Join VROMON
            </span>
            <h2 className="text-3xl font-extrabold leading-tight tracking-tight">
              Realistic Bangladesh itineraries in under 10 seconds.
            </h2>
            <p className="text-sm leading-relaxed text-[#D5E6CF]">
              Unlike generic chatbots, VROMON calculates exact bus/train/ferry travel hours, hotel tiers, and crowd indices before recommending a single route.
            </p>
          </div>

          <div className="my-6 space-y-3">
            {[
              { title: 'Save & compare side-by-side', sub: 'Pin 3 districts to a matrix radar chart.' },
              { title: 'Shareable 30-day route links', sub: 'Send friends a live read-only expedition link.' },
              { title: 'Zero hidden local guesswork', sub: 'Transparent BDT transport + hotel + food math.' },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3.5 backdrop-blur-sm"
              >
                <p className="text-sm font-bold text-white">{item.title}</p>
                <p className="mt-0.5 text-xs text-[#D5E6CF]">{item.sub}</p>
              </div>
            ))}
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/15">
            <img
              src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=700&q=80"
              alt="Sylhet hills"
              className="h-36 w-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#2F6B2F]" />
        </div>
      }
    >
      <RegisterInner />
    </Suspense>
  );
}
