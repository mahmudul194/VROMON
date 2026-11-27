'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowRight,
  CloudSun,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  Star,
  Wallet,
} from 'lucide-react';
import { apiFetch, GOOGLE_OAUTH_URL } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSession } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const oauthErr = searchParams.get('error');
    if (oauthErr === 'google_not_configured') {
      setError(
        'Google OAuth credentials are not configured yet. Please sign in with email and password or add GOOGLE_CLIENT_ID in .env.',
      );
    } else if (oauthErr) {
      setError('Google sign-in could not be completed. Please try again or use email sign in.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setSession(res.access_token, res.user);
      const nextUrl = searchParams.get('next');
      if (nextUrl && nextUrl.startsWith('/') && !nextUrl.startsWith('//')) {
        router.push(nextUrl);
      } else {
        router.push(res.user.role === 'ADMIN' ? '/admin' : '/plan');
      }
    } catch (err: any) {
      if (err.data?.requiresVerification) {
        router.push(`/register?verify=${encodeURIComponent(email)}`);
        return;
      }
      setError(err.message || 'Invalid credentials. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-100px)] max-w-[1440px] items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="flex w-full flex-col items-stretch justify-center gap-6 lg:min-h-[780px] lg:flex-row">
        {/* LEFT PANEL: Stitch Dark Visual Storytelling & Algorithmic Showcase */}
        <div className="relative hidden w-full flex-col justify-between overflow-hidden rounded-[40px] bg-gradient-to-br from-[#283328] via-[#145219] to-[#2F6B2F] p-8 shadow-2xl lg:flex lg:w-1/2 lg:p-12">
          <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[#95d68e]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-[#FFCB3D]/20 blur-3xl" />

          {/* Top Branding Row */}
          <div className="relative z-10 flex items-center justify-between gap-4">
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

            <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 backdrop-blur-md">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#FFCB3D]" />
              <span className="text-[13px] font-semibold uppercase tracking-[0.06em] text-white">
                AI Travel Engine
              </span>
            </div>
          </div>

          {/* Center: Overlapping 3-Card Destination Collage */}
          <div className="relative z-10 my-auto flex items-center justify-center py-6">
            <div className="relative flex h-[340px] w-full max-w-[480px] items-center justify-center">
              {/* Card 1: Left Tilt (Cox's Bazar) */}
              <div className="absolute left-0 sm:left-2 h-[285px] w-[215px] sm:w-[235px] -translate-y-2 -rotate-6 transform overflow-hidden rounded-2xl bg-[#283328] shadow-2xl transition-all duration-300 hover:z-30 hover:scale-105 hover:rotate-0">
                <img
                  src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80"
                  alt="Cox's Bazar"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1F2A1F]/90 via-[#1F2A1F]/30 to-transparent" />
                <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 shadow-sm">
                  <Star className="h-3.5 w-3.5 text-[#2F6B2F]" />
                  <span className="text-[14px] font-bold text-[#2F6B2F]">91%</span>
                </div>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="block text-[13px] font-semibold uppercase tracking-[0.06em] text-[#ffdf97]">
                    Sea Basin
                  </span>
                  <p className="text-[24px] font-semibold leading-tight">Cox&apos;s Bazar</p>
                </div>
              </div>

              {/* Card 3: Right Tilt (Sylhet Green) */}
              <div className="absolute right-0 sm:right-2 h-[285px] w-[215px] sm:w-[235px] -translate-y-2 rotate-6 transform overflow-hidden rounded-2xl bg-[#283328] shadow-2xl transition-all duration-300 hover:z-30 hover:scale-105 hover:rotate-0">
                <img
                  src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80"
                  alt="Sylhet Green"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1F2A1F]/90 via-[#1F2A1F]/30 to-transparent" />
                <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 shadow-sm">
                  <Star className="h-3.5 w-3.5 text-[#2F6B2F]" />
                  <span className="text-[14px] font-bold text-[#2F6B2F]">94%</span>
                </div>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="block text-[13px] font-semibold uppercase tracking-[0.06em] text-[#b0f3a8]">
                    Tea Hills
                  </span>
                  <p className="text-[24px] font-semibold leading-tight">Sylhet Green</p>
                </div>
              </div>

              {/* Card 2: Center Hero Card (Sajek Valley) */}
              <div className="relative z-20 h-[320px] w-[245px] sm:w-[265px] overflow-hidden rounded-2xl border-2 border-white/25 bg-[#1F2A1F] shadow-2xl transition-all duration-300 hover:scale-105">
                <img
                  src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=700&q=80"
                  alt="Sajek Valley"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1F2A1F]/95 via-[#1F2A1F]/25 to-transparent" />
                <div className="absolute inset-x-3 top-3 flex items-center justify-between">
                  <span className="rounded-full bg-[#FFCB3D] px-2.5 py-1 text-[13px] font-semibold uppercase tracking-[0.06em] text-[#251a00] shadow-sm">
                    Top Pick
                  </span>
                  <div className="flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-[14px] font-bold text-[#145219] shadow-sm">
                    <Sparkles className="h-3.5 w-3.5 text-[#2F6B2F]" />
                    97%
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-1 text-white">
                  <span className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[#ffdf97]">
                    Hills &amp; Clouds
                  </span>
                  <h3 className="text-[24px] font-semibold leading-tight">Sajek Valley</h3>
                  <div className="mt-2 flex items-center justify-between border-t border-white/15 pt-2 text-[14px]">
                    <span className="text-white/80">Estimated Cost</span>
                    <span className="font-bold text-[#FFCB3D]">৳ 14,000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Badges Tray */}
          <div className="relative z-10 mb-5 flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[14px] text-white backdrop-blur-md">
              <Wallet className="h-4 w-4 text-[#FFCB3D]" />
              Dynamic Budget Ceiling
            </span>
            <span className="flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[14px] text-white backdrop-blur-md">
              <CloudSun className="h-4 w-4 text-[#b0f3a8]" />
              Monsoon &amp; Crowd Predictor
            </span>
            <span className="flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[14px] text-white backdrop-blur-md">
              <ShieldCheck className="h-4 w-4 text-[#ffdf97]" />
              Verified 64-District Data
            </span>
          </div>

          {/* Bottom Narrative & Traveler Social Proof */}
          <div className="relative z-10 flex flex-col gap-5 pt-2">
            <h2 className="text-[32px] sm:text-[40px] font-bold leading-[1.15] tracking-tight text-white">
              &ldquo;Your next adventure starts with a sentence.&rdquo;
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3 overflow-hidden">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFCB3D] text-[14px] font-bold text-[#251a00] shadow-md">
                  TH
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#b0f3a8] text-[14px] font-bold text-[#145219] shadow-md">
                  NF
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d9e6d5] text-[14px] font-bold text-[#1F2A1F] shadow-md">
                  AC
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[14px] font-bold text-[#145219] shadow-md">
                  +10k
                </div>
              </div>
              <p className="text-[14px] font-medium text-white/90">
                Join 10,000+ travelers across Bangladesh
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Centered Elevated White Form Card (460px, Stitch 02_login) */}
        <div className="flex w-full flex-col items-center justify-center p-2 sm:p-6 lg:w-1/2">
          <div className="flex w-full max-w-[460px] flex-col rounded-[32px] bg-white p-8 shadow-[0_20px_60px_rgba(31,42,31,0.08)] sm:p-11">
            <div className="mb-6 flex items-center lg:hidden">
              <img
                src="/vromon_logo.png"
                alt="VROMON"
                className="h-10 w-auto object-contain"
              />
            </div>

            <div className="mb-7 flex flex-col">
              <h1 className="text-[36px] md:text-[40px] font-bold leading-tight tracking-tight text-[#1F2A1F]">
                Welcome back
              </h1>
              <p className="mt-1 text-[16px] md:text-[18px] font-normal text-[#557945]">
                Log in to continue planning your trip.
              </p>
            </div>

            {error && (
              <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Email Address */}
              <div className="flex flex-col gap-1.5">
                <span className="ml-4 text-[13px] font-semibold uppercase tracking-[0.06em] text-[#145219]">
                  Email Address
                </span>
                <div className="flex h-[56px] w-full items-center rounded-full bg-[#eaf7e6] px-5 transition-all duration-200 focus-within:bg-white focus-within:shadow-[0_0_0_3px_#2F6B2F]">
                  <Mail className="mr-3 h-5 w-5 shrink-0 text-[#557945]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full bg-transparent text-[16px] font-normal text-[#1F2A1F] placeholder-[#557945]/60 focus:outline-none"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <span className="ml-4 text-[13px] font-semibold uppercase tracking-[0.06em] text-[#145219]">
                  Password
                </span>
                <div className="flex h-[56px] w-full items-center rounded-full bg-[#eaf7e6] px-5 transition-all duration-200 focus-within:bg-white focus-within:shadow-[0_0_0_3px_#2F6B2F]">
                  <Lock className="mr-3 h-5 w-5 shrink-0 text-[#557945]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-transparent text-[16px] font-normal text-[#1F2A1F] placeholder-[#557945]/60 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="p-1 text-[#557945] transition-colors hover:text-[#145219]"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Custom 54x32 Switch + Forgot Password */}
              <div className="mt-1 flex items-center justify-between px-1">
                <button
                  type="button"
                  onClick={() => setRememberMe(!rememberMe)}
                  className="flex cursor-pointer items-center gap-3 select-none"
                >
                  <span
                    className={`relative flex h-[32px] w-[54px] items-center rounded-full p-1 transition-colors duration-200 ${
                      rememberMe ? 'bg-[#2F6B2F]' : 'bg-[#d9e6d5]'
                    }`}
                  >
                    <span
                      className={`h-[24px] w-[24px] transform rounded-full shadow-sm transition-transform duration-200 ${
                        rememberMe
                          ? 'translate-x-[22px] bg-[#FFCB3D]'
                          : 'translate-x-0 bg-white'
                      }`}
                    />
                  </span>
                  <span className="text-[14px] font-medium text-[#1F2A1F]">Remember me</span>
                </button>

                <Link
                  href="/forgot-password"
                  className="text-[14px] font-bold text-[#145219] transition-colors hover:text-[#2F6B2F]"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Primary Submit Pill */}
              <button
                type="submit"
                disabled={loading}
                className="group mt-2 flex h-[56px] w-full items-center justify-between rounded-full bg-[#2F6B2F] pl-7 pr-3 text-white shadow-lg transition-all duration-200 hover:brightness-105 active:scale-[0.99] disabled:opacity-60"
              >
                <span className="text-[16px] font-semibold">
                  {loading ? 'Signing in...' : 'Log in'}
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFCB3D] text-[#251a00] transition-transform duration-200 group-hover:translate-x-0.5">
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                </span>
              </button>
            </form>

            {/* Editorial Divider */}
            <div className="relative my-7 flex items-center">
              <div className="h-px flex-grow bg-[#D5E6CF]" />
              <span className="mx-4 text-[14px] text-[#557945]">or continue with</span>
              <div className="h-px flex-grow bg-[#D5E6CF]" />
            </div>

            {/* Google Sign-In Button (no fake Facebook) */}
            <a
              href={GOOGLE_OAUTH_URL}
              className="flex h-[52px] w-full items-center justify-center gap-3 rounded-full bg-[#eaf7e6] px-4 text-[15px] font-semibold text-[#1F2A1F] transition-all hover:bg-[#d9e6d5]"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
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
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </a>

            <div className="mt-7 pt-2 text-center">
              <p className="text-[14px] text-[#557945]">
                New to VROMON?{' '}
                <Link
                  href="/register"
                  className="ml-1 font-bold text-[#145219] transition-colors hover:text-[#2F6B2F] hover:underline"
                >
                  Create account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#2F6B2F]" />
        </div>
      }
    >
      <LoginInner />
    </Suspense>
  );
}
