'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  CloudSun,
  Compass,
  Eye,
  EyeOff,
  Landmark,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Mountain,
  ShieldCheck,
  Sparkles,
  Star,
  Trees,
  User,
  Utensils,
  Wallet,
  Waves,
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

const VIBE_OPTIONS = [
  { id: 'Beach', label: 'Beach', icon: Waves },
  { id: 'Hills', label: 'Hills', icon: Mountain },
  { id: 'Heritage', label: 'Heritage', icon: Landmark },
  { id: 'Adventure', label: 'Adventure', icon: Compass },
  { id: 'Food', label: 'Food', icon: Utensils },
  { id: 'Nature', label: 'Nature', icon: Trees },
  { id: 'Wildlife', label: 'Wildlife', icon: ShieldCheck },
  { id: 'Tea Gardens', label: 'Tea Gardens', icon: Sparkles },
];

function RegisterInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSession } = useAuth();

  const [step, setStep] = useState<'account' | 'preferences' | 'otp' | 'success'>('account');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(true);

  const [selectedVibes, setSelectedVibes] = useState<string[]>([
    'Hills',
    'Tea Gardens',
    'Beach',
    'Adventure',
  ]);
  const [preferredCity, setPreferredCity] = useState('Dhaka');
  const [estimatedBudget, setEstimatedBudget] = useState(15000);

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

  const budgetTier: 'Low' | 'Medium' | 'High' = useMemo(() => {
    if (estimatedBudget <= 10000) return 'Low';
    if (estimatedBudget <= 30000) return 'Medium';
    return 'High';
  }, [estimatedBudget]);

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

  const toggleVibe = (id: string) => {
    setSelectedVibes((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    );
  };

  const handleContinueToPreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!acceptedTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy.');
      return;
    }
    setStep('preferences');
  };

  const handleSubmitRegistration = async (e: React.FormEvent) => {
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
      const nextUrl = searchParams.get('next');
      const target =
        nextUrl && nextUrl.startsWith('/') && !nextUrl.startsWith('//') ? nextUrl : '/plan';
      setTimeout(() => router.push(target), 1400);
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

  const stepIndex = step === 'account' ? 1 : step === 'preferences' ? 2 : 3;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-100px)] max-w-[1440px] items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="grid w-full grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
        {/* LEFT PANEL (5 cols): Stitch Registration Card */}
        <div className="flex flex-col justify-center lg:col-span-5">
          <div className="relative flex flex-col gap-6 rounded-[32px] bg-white p-7 shadow-[0_20px_60px_rgba(31,42,31,0.08)] sm:p-10">
            {/* Top Bar + Horizontal Connecting Track Stepper (Stitch 03_register_1 / 04_register_2) */}
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between gap-2">
                <Link href="/" className="flex items-center">
                  <img
                    src="/vromon_logo.png"
                    alt="VROMON"
                    className="h-9 w-auto object-contain"
                  />
                </Link>
                <span className="flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-[0.06em] text-[#557945]">
                  <Lock className="h-3.5 w-3.5 text-[#2F6B2F]" />
                  Encrypted
                </span>
              </div>

              {/* 3-Step Horizontal Connecting Track */}
              <div className="relative flex w-full items-center justify-between pb-1 pt-1">
                <div className="absolute left-6 right-6 top-5 z-0 h-[2px] -translate-y-1/2 bg-[#d9e6d5]" />
                <div
                  className="absolute left-6 top-5 z-0 h-[2px] -translate-y-1/2 bg-[#2F6B2F] transition-all duration-300"
                  style={{
                    width: stepIndex === 1 ? '18%' : stepIndex === 2 ? '50%' : '84%',
                  }}
                />

                {[
                  { n: 1, label: 'Account' },
                  { n: 2, label: 'Preferences' },
                  { n: 3, label: 'Verify & Done' },
                ].map((s) => {
                  const done = stepIndex > s.n || step === 'success';
                  const active = stepIndex === s.n && step !== 'success';
                  return (
                    <div key={s.n} className="relative z-10 flex flex-col items-center gap-1.5">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-[14px] font-bold shadow-sm transition-colors ${
                          done || active
                            ? 'bg-[#2F6B2F] text-white'
                            : 'bg-[#dfecdb] text-[#557945]'
                        }`}
                      >
                        {done ? <Check className="h-4 w-4" /> : s.n}
                      </div>
                      <span
                        className={`text-[14px] tracking-tight ${
                          done || active
                            ? 'font-semibold text-[#2F6B2F]'
                            : 'font-normal text-[#557945]'
                        }`}
                      >
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {info && !error && (
              <div className="flex items-start gap-2.5 rounded-2xl border border-[#D5E6CF] bg-[#eaf7e6] px-4 py-3 text-[14px] text-[#145219]">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{info}</span>
              </div>
            )}

            {/* STEP 1: ACCOUNT DETAILS */}
            {step === 'account' && (
              <>
                <div className="flex flex-col gap-1">
                  <h1 className="text-[36px] md:text-[40px] font-bold leading-tight tracking-tight text-[#1F2A1F]">
                    Create your account
                  </h1>
                  <p className="text-[16px] font-normal text-[#557945]">
                    Personalized Bangladesh trip plans await.
                  </p>
                </div>

                <form onSubmit={handleContinueToPreferences} className="flex flex-col gap-4">
                  <div className="relative flex items-center">
                    <User className="pointer-events-none absolute left-4 h-5 w-5 text-[#557945]" />
                    <input
                      type="text"
                      required
                      minLength={2}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full Name"
                      className="h-14 w-full rounded-full bg-[#eaf7e6] pl-12 pr-5 text-[16px] font-normal text-[#1F2A1F] placeholder-[#557945]/60 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2F6B2F]"
                    />
                  </div>

                  <div className="relative flex items-center">
                    <Mail className="pointer-events-none absolute left-4 h-5 w-5 text-[#557945]" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email Address"
                      className="h-14 w-full rounded-full bg-[#eaf7e6] pl-12 pr-5 text-[16px] font-normal text-[#1F2A1F] placeholder-[#557945]/60 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2F6B2F]"
                    />
                  </div>

                  {/* Password + 3-Bar Meter */}
                  <div className="flex flex-col gap-1.5">
                    <div className="relative flex items-center">
                      <Lock className="pointer-events-none absolute left-4 h-5 w-5 text-[#557945]" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password (min. 6 chars)"
                        className="h-14 w-full rounded-full bg-[#eaf7e6] pl-12 pr-12 text-[16px] font-normal text-[#1F2A1F] placeholder-[#557945]/60 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2F6B2F]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label="Toggle password visibility"
                        className="absolute right-4 p-1 text-[#557945] hover:text-[#1F2A1F]"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center justify-between px-2 pt-1">
                      <div className="flex max-w-[200px] flex-1 items-center gap-1.5">
                        {[1, 2, 3].map((bar) => (
                          <div
                            key={bar}
                            className={`h-1.5 flex-1 rounded-full ${
                              strength.level >= bar
                                ? strength.level === 1
                                  ? 'bg-red-400'
                                  : strength.level === 2
                                  ? 'bg-[#FFCB3D]'
                                  : 'bg-[#2F6B2F]'
                                : 'bg-[#d9e6d5]'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[#2F6B2F]">
                        {strength.label}
                      </span>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="relative flex items-center">
                    <ShieldCheck className="pointer-events-none absolute left-4 h-5 w-5 text-[#557945]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm Password"
                      className="h-14 w-full rounded-full bg-[#eaf7e6] pl-12 pr-5 text-[16px] font-normal text-[#1F2A1F] placeholder-[#557945]/60 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2F6B2F]"
                    />
                  </div>

                  <label className="mt-1 flex cursor-pointer items-start gap-3 px-1 select-none">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded text-[#2F6B2F] accent-[#2F6B2F]"
                    />
                    <span className="text-[14px] leading-snug text-[#557945]">
                      I agree to the{' '}
                      <span className="font-semibold text-[#2F6B2F]">Terms of Service</span> &amp;{' '}
                      <span className="font-semibold text-[#2F6B2F]">Privacy Policy</span>
                    </span>
                  </label>

                  <button
                    type="submit"
                    className="group mt-2 flex h-14 w-full items-center justify-between rounded-full bg-[#2F6B2F] pl-6 pr-2 text-[16px] font-semibold text-white shadow-md transition-all hover:brightness-105"
                  >
                    <span>Continue to Preferences</span>
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFCB3D] text-[#251a00] transition-transform group-hover:translate-x-0.5">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </button>

                  <div className="relative my-1 flex items-center justify-center">
                    <div className="h-px w-full bg-[#d9e6d5]" />
                    <span className="absolute bg-white px-3 text-[13px] font-semibold uppercase tracking-[0.06em] text-[#557945]">
                      Or continue with
                    </span>
                  </div>

                  <a
                    href={GOOGLE_OAUTH_URL}
                    className="flex h-14 w-full items-center justify-center gap-3 rounded-full border border-[#d9e6d5] bg-white px-6 text-[16px] font-semibold text-[#1F2A1F] shadow-sm transition-colors hover:bg-[#eaf7e6]"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.27 21.37 7.37 24 12 24z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.27 2.63 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                        fill="#EA4335"
                      />
                    </svg>
                    <span>Sign up with Google</span>
                  </a>
                </form>
              </>
            )}

            {/* STEP 2: TRAVEL PREFERENCES (Stitch 04_register_2) */}
            {step === 'preferences' && (
              <form onSubmit={handleSubmitRegistration} className="flex flex-col gap-5">
                <div>
                  <h1 className="text-[36px] md:text-[40px] font-bold leading-tight tracking-tight text-[#1F2A1F]">
                    What do you love?
                  </h1>
                  <p className="mt-1 text-[16px] font-normal text-[#557945]">
                    Select your travel vibes for tailored Bangladeshi trip plans.
                  </p>
                </div>

                <div>
                  <div className="mb-2.5 flex items-center justify-between">
                    <span className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[#557945]">
                      Selected Vibes ({selectedVibes.length}/8)
                    </span>
                    <span className="text-[14px] font-semibold text-[#2F6B2F]">
                      AI matching enabled
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {VIBE_OPTIONS.map((vibe) => {
                      const Icon = vibe.icon;
                      const selected = selectedVibes.includes(vibe.id);
                      return (
                        <button
                          key={vibe.id}
                          type="button"
                          onClick={() => toggleVibe(vibe.id)}
                          className={`flex h-12 items-center justify-between rounded-full px-4 text-[14px] font-semibold transition-all ${
                            selected
                              ? 'bg-[#2F6B2F] text-white shadow-sm'
                              : 'bg-[#eaf7e6] text-[#1F2A1F] hover:bg-[#d9e6d5]'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <Icon
                              className={`h-4 w-4 ${
                                selected ? 'text-[#FFCB3D]' : 'text-[#2F6B2F]'
                              }`}
                            />
                            {vibe.label}
                          </span>
                          {selected && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                              <Check className="h-3 w-3 text-white" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[13px] font-semibold uppercase tracking-[0.06em] text-[#557945]">
                    Home City / Departure Point
                  </label>
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#2F6B2F]" />
                    <select
                      value={preferredCity}
                      onChange={(e) => setPreferredCity(e.target.value)}
                      className="h-14 w-full rounded-full bg-[#eaf7e6] pl-12 pr-5 text-[16px] font-semibold text-[#1F2A1F] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2F6B2F]"
                    >
                      {CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[#557945]">
                      Estimated Trip Budget
                    </span>
                    <span className="rounded-full bg-[#fff8e1] px-3 py-0.5 text-[14px] font-bold text-[#775a00]">
                      {budgetTier} Tier
                    </span>
                  </div>
                  <div className="inline-block rounded-full bg-[#2F6B2F] px-3.5 py-1 text-[14px] font-bold text-white">
                    CAP: ৳ {estimatedBudget.toLocaleString()}
                  </div>
                  <input
                    type="range"
                    min={5000}
                    max={80000}
                    step={1000}
                    value={estimatedBudget}
                    onChange={(e) => setEstimatedBudget(Number(e.target.value))}
                    className="vromon-slider w-full cursor-pointer"
                  />
                  <div className="flex justify-between text-[14px] text-[#557945]">
                    <span>৳ 5,000</span>
                    <span>BDT per traveler</span>
                    <span>৳ 80,000+</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group mt-1 flex h-14 w-full items-center justify-between rounded-full bg-[#2F6B2F] pl-6 pr-2 text-[16px] font-semibold text-white shadow-md transition-all hover:brightness-105 disabled:opacity-60"
                >
                  <span>
                    {loading ? 'Sending Verification OTP...' : 'Finish & Create Profile'}
                  </span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFCB3D] text-[#251a00] transition-transform group-hover:translate-x-0.5">
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
                  className="inline-flex items-center justify-center gap-1.5 text-[14px] font-semibold text-[#557945] hover:text-[#1F2A1F]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to account details
                </button>
              </form>
            )}

            {/* STEP 3: EMAIL OTP VERIFICATION */}
            {step === 'otp' && (
              <form onSubmit={handleVerifyOtp} className="space-y-6 py-2">
                <div>
                  <h1 className="text-[36px] md:text-[40px] font-bold leading-tight text-[#1F2A1F]">
                    Verify your email
                  </h1>
                  <p className="mt-1.5 text-[16px] text-[#557945]">
                    Enter the 6-digit code sent to{' '}
                    <span className="font-bold text-[#1F2A1F]">{email}</span>
                  </p>
                </div>

                <div className="flex justify-between gap-2">
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
                      className="h-14 w-12 rounded-2xl border-2 border-[#D5E6CF] bg-[#eaf7e6] text-center text-[20px] font-bold text-[#1F2A1F] focus:border-[#2F6B2F] focus:bg-white focus:outline-none sm:w-14"
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between text-[14px] font-medium text-[#557945]">
                  <span>
                    {countdown > 0
                      ? `Resend available in ${countdown}s`
                      : 'Did not receive the code?'}
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
                  className="group flex h-14 w-full items-center justify-between rounded-full bg-[#2F6B2F] pl-6 pr-2 text-[16px] font-semibold text-white shadow-md transition hover:brightness-105 disabled:opacity-60"
                >
                  <span>{loading ? 'Verifying...' : 'Verify & Activate Account'}</span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFCB3D] text-[#251a00]">
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowRight className="h-4 w-4" />
                    )}
                  </span>
                </button>
              </form>
            )}

            {/* SUCCESS STATE */}
            {step === 'success' && (
              <div className="space-y-4 py-10 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#eaf7e6] text-[#2F6B2F]">
                  <CheckCircle2 className="h-9 w-9" />
                </div>
                <h2 className="text-[32px] font-bold text-[#1F2A1F]">Account verified!</h2>
                <p className="text-[16px] text-[#557945]">
                  Your VROMON workspace is ready. Redirecting to Trip Planner...
                </p>
              </div>
            )}

            <div className="flex flex-col items-center gap-2 pt-1 text-center">
              <p className="text-[14px] text-[#557945]">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="ml-1 font-semibold text-[#2F6B2F] hover:underline"
                >
                  Log in
                </Link>
              </p>
              <span className="flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-[0.06em] text-[#557945]">
                <ShieldCheck className="h-4 w-4 text-[#2F6B2F]" />
                256-Bit Encrypted Registration
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL (7 cols): Stitch Curated Visual Showcase Mosaic */}
        <div className="relative hidden flex-col justify-between overflow-hidden rounded-[40px] bg-gradient-to-br from-[#1F2A1F] via-[#1A381C] to-[#2F6B2F] p-8 text-white shadow-[0_24px_80px_rgba(31,42,31,0.22)] lg:col-span-7 lg:flex lg:p-12">
          <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[#FFCB3D]/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 bottom-12 h-80 w-80 rounded-full bg-[#b7f2a9]/10 blur-3xl" />

          {/* Top Row: Standalone Logo & Pill */}
          <div className="relative z-10 flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center rounded-2xl bg-white/95 px-3.5 py-2 shadow-sm"
            >
              <img
                src="/vromon_logo.png"
                alt="VROMON"
                className="h-9 w-auto object-contain"
              />
            </Link>

            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[13px] font-semibold uppercase tracking-[0.06em] text-white backdrop-blur-md">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#FFCB3D]" />
              AI Travel Engine
            </div>
          </div>

          {/* Center: Floating Tilted White-Framed Polaroid Destination Cards */}
          <div className="relative z-10 my-8 flex flex-col gap-7 py-4">
            <div className="relative flex h-[260px] w-full items-center justify-center">
              {/* Left Tilted Card: Cox's Bazar */}
              <div className="absolute left-2 sm:left-6 w-52 sm:w-56 -rotate-6 rounded-2xl bg-white/95 p-3 text-[#1F2A1F] shadow-xl backdrop-blur-md transition-transform duration-300 hover:z-30 hover:rotate-0">
                <div className="relative mb-2.5 h-28 w-full overflow-hidden rounded-xl">
                  <img
                    src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=500&q=80"
                    alt="Cox's Bazar"
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute left-2 top-2 rounded-full bg-white/85 px-2.5 py-0.5 text-[13px] font-semibold uppercase tracking-[0.06em] text-[#1F2A1F]">
                    Coastal
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[16px] font-semibold leading-tight">Cox&apos;s Bazar</p>
                    <p className="text-[14px] text-[#557945]">Longest Sea Beach</p>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-[#e5f2e0] px-2.5 py-1 text-[14px] font-bold text-[#2F6B2F]">
                    <Star className="h-3.5 w-3.5 text-[#775a00]" />
                    91%
                  </div>
                </div>
              </div>

              {/* Right Tilted Card: Sylhet Gardens */}
              <div className="absolute right-2 sm:right-6 w-52 sm:w-56 rotate-6 rounded-2xl bg-white/95 p-3 text-[#1F2A1F] shadow-xl backdrop-blur-md transition-transform duration-300 hover:z-30 hover:rotate-0">
                <div className="relative mb-2.5 h-28 w-full overflow-hidden rounded-xl">
                  <img
                    src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=500&q=80"
                    alt="Sylhet Gardens"
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute left-2 top-2 rounded-full bg-white/85 px-2.5 py-0.5 text-[13px] font-semibold uppercase tracking-[0.06em] text-[#1F2A1F]">
                    Highlands
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[16px] font-semibold leading-tight">Sylhet Gardens</p>
                    <p className="text-[14px] text-[#557945]">Sreemangal Estates</p>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-[#e5f2e0] px-2.5 py-1 text-[14px] font-bold text-[#2F6B2F]">
                    <Star className="h-3.5 w-3.5 text-[#775a00]" />
                    94%
                  </div>
                </div>
              </div>

              {/* Center Hero Card: Sajek Valley */}
              <div className="relative z-20 w-60 sm:w-64 rotate-1 rounded-2xl bg-white p-3.5 text-[#1F2A1F] shadow-2xl transition-transform duration-300 hover:rotate-0">
                <div className="relative mb-3 h-32 w-full overflow-hidden rounded-xl">
                  <img
                    src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&q=80"
                    alt="Sajek Valley"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute left-2 top-2 flex gap-1.5">
                    <span className="rounded-full bg-[#FFCB3D] px-2.5 py-0.5 text-[13px] font-semibold uppercase tracking-[0.06em] text-[#251a00]">
                      Top Pick
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[18px] font-bold leading-tight">Sajek Valley</p>
                    <p className="text-[14px] text-[#557945]">Rangamati Hills</p>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-[#2F6B2F] px-3 py-1 text-[14px] font-bold text-white shadow-sm">
                    <Sparkles className="h-3.5 w-3.5 text-[#FFCB3D]" />
                    97%
                  </div>
                </div>
              </div>
            </div>

            {/* Frosted Feature Badges Tray */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-[14px] font-medium text-white shadow-sm backdrop-blur-md">
                <Wallet className="h-4 w-4 text-[#FFCB3D]" />
                Dynamic Budget Ceiling
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-[14px] font-medium text-white shadow-sm backdrop-blur-md">
                <CloudSun className="h-4 w-4 text-[#b7f2a9]" />
                Monsoon &amp; Crowd Predictor
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-[14px] font-medium text-white shadow-sm backdrop-blur-md">
                <ShieldCheck className="h-4 w-4 text-[#FFCB3D]" />
                Verified Local Data
              </div>
            </div>
          </div>

          {/* Bottom Quote & Avatar Stack */}
          <div className="relative z-10 flex flex-col gap-6 pt-4">
            <blockquote className="max-w-[560px] text-[32px] sm:text-[40px] font-bold leading-[1.18] tracking-tight text-white">
              &ldquo;Discover places that fit your budget and your mood.&rdquo;
            </blockquote>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-4">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d9e6d5] text-[14px] font-bold text-[#1F2A1F] ring-2 ring-[#145219]">
                    AR
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ffdf97] text-[14px] font-bold text-[#5a4400] ring-2 ring-[#145219]">
                    NH
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#b0f3a8] text-[14px] font-bold text-[#002203] ring-2 ring-[#145219]">
                    SK
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[14px] font-bold text-[#2F6B2F] ring-2 ring-[#145219]">
                    +10k
                  </div>
                </div>
                <p className="text-[14px] font-medium text-white/90">
                  Join 10,000+ travelers across Bangladesh
                </p>
              </div>

              <div className="hidden items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[13px] font-semibold uppercase tracking-[0.06em] text-white backdrop-blur-sm sm:flex">
                <MapPin className="h-4 w-4 text-[#FFCB3D]" />
                Dhaka · Sreemangal · Bandarban
              </div>
            </div>
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
