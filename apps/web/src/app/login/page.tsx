'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowRight,
  Compass,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
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
    if (oauthErr) {
      setError('Google authentication could not be completed. Please try again or use email sign in.');
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
      router.push(res.user.role === 'ADMIN' ? '/admin' : '/plan');
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
    <div className="relative mx-auto flex min-h-[calc(100vh-110px)] max-w-[1100px] items-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid w-full items-stretch gap-6 lg:grid-cols-12">
        {/* Left Dark Editorial Showcase Panel (Stitch 02_login) */}
        <div className="relative hidden flex-col justify-between overflow-hidden rounded-[28px] bg-gradient-to-br from-[#235425] via-[#2F6B2F] to-[#145219] p-8 text-white shadow-[0_24px_60px_-15px_rgba(20,82,25,0.4)] lg:col-span-6 lg:flex">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#5D9253]/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-12 h-64 w-64 rounded-full bg-[#FFCB3D]/15 blur-3xl" />

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
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[13px] font-semibold uppercase tracking-[0.06em] text-[#FFCB3D]">
              64 Districts
            </span>
          </div>

          {/* 3-Card Destination Mosaic */}
          <div className="relative z-10 my-8 grid grid-cols-3 gap-3.5">
            <div className="-rotate-2 transform overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-lg transition hover:rotate-0">
              <img
                src="https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=420&q=80"
                alt="Sundarbans"
                className="h-36 w-full object-cover"
              />
              <div className="bg-[#145219]/90 px-3 py-2">
                <p className="text-[14px] font-bold text-white">Khulna</p>
                <p className="text-[14px] text-[#D5E6CF]">Sundarbans</p>
              </div>
            </div>

            <div className="translate-y-4 overflow-hidden rounded-2xl border border-[#FFCB3D]/40 bg-white/10 shadow-xl transition hover:translate-y-2">
              <img
                src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=420&q=80"
                alt="Sajek Valley"
                className="h-40 w-full object-cover"
              />
              <div className="bg-[#145219]/95 px-3 py-2">
                <p className="text-[14px] font-bold text-white">Rangamati</p>
                <p className="text-[14px] text-[#FFCB3D]">Sajek Valley</p>
              </div>
            </div>

            <div className="rotate-2 transform overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-lg transition hover:rotate-0">
              <img
                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=420&q=80"
                alt="Cox's Bazar"
                className="h-36 w-full object-cover"
              />
              <div className="bg-[#145219]/90 px-3 py-2">
                <p className="text-[14px] font-bold text-white">Cox&apos;s Bazar</p>
                <p className="text-[14px] text-[#D5E6CF]">Marine Drive</p>
              </div>
            </div>
          </div>

          <div className="relative z-10 space-y-5">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[14px] font-semibold text-white">
                <Sparkles className="h-3.5 w-3.5 text-[#FFCB3D]" />
                6-Factor AI Scoring
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[14px] font-semibold text-white">
                <ShieldCheck className="h-3.5 w-3.5 text-[#FFCB3D]" />
                Fair-Price Feasibility
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[14px] font-semibold text-white">
                <Compass className="h-3.5 w-3.5 text-[#FFCB3D]" />
                Seasonal Crowd Guard
              </span>
            </div>

            <blockquote className="text-[14px] leading-relaxed text-[#E5F0E0]">
              &ldquo;Know before you pack whether your time, transport, and budget actually fit Bangladesh&apos;s real seasonal roads.&rdquo;
            </blockquote>

            <div className="flex items-center gap-3 pt-1">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFCB3D] text-[14px] font-extrabold text-[#1F2A1F]">
                10k+
              </div>
              <p className="text-[14px] font-medium text-[#D5E6CF]">
                Feasibility checks &amp; curated routes powered by deterministic math + Gemini AI
              </p>
            </div>
          </div>
        </div>

        {/* Right White Login Card */}
        <div className="flex flex-col justify-center rounded-[28px] border border-[#D5E6CF]/70 bg-white p-7 shadow-[0_18px_50px_-14px_rgba(31,42,31,0.12)] sm:p-10 lg:col-span-6">
          <div className="mb-7 space-y-2">
            <div className="flex items-center lg:hidden">
              <img
                src="/vromon_logo.png"
                alt="VROMON"
                className="h-10 w-auto object-contain"
              />
            </div>
            <span className="inline-block rounded-full bg-[#eaf7e6] px-3 py-1 text-[13px] font-semibold uppercase tracking-[0.06em] text-[#2F6B2F]">
              Traveler Sign In
            </span>
            <h1 className="text-[36px] md:text-[40px] font-extrabold tracking-tight text-[#1F2A1F]">
              Welcome back
            </h1>
            <p className="text-[16px] text-[#557945]">
              Sign in to access saved trips, personalized AI defaults, and day-by-day plans.
            </p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  className="h-[54px] w-full rounded-full border border-[#D5E6CF] bg-[#eaf7e6]/75 pl-12 pr-5 text-[14px] font-medium text-[#1F2A1F] placeholder-[#557945]/60 focus:border-[#2F6B2F] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2F6B2F]/15"
                />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-[14px] font-bold uppercase tracking-wider text-[#557945]">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[14px] font-bold text-[#2F6B2F] hover:text-[#145219] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5D9253]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="h-[54px] w-full rounded-full border border-[#D5E6CF] bg-[#eaf7e6]/75 pl-12 pr-12 text-[14px] font-medium text-[#1F2A1F] placeholder-[#557945]/60 focus:border-[#2F6B2F] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2F6B2F]/15"
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
            </div>

            {/* Remember Me Custom Toggle Switch */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className="flex items-center gap-2.5 text-[14px] font-semibold text-[#557945]"
              >
                <span
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${
                    rememberMe ? 'bg-[#2F6B2F]' : 'bg-[#D5E6CF]'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition ${
                      rememberMe ? 'translate-x-4' : 'translate-x-1'
                    }`}
                  />
                </span>
                Keep me signed in on this device
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex h-[54px] w-full items-center justify-between rounded-full bg-[#2F6B2F] pl-6 pr-2.5 text-[14px] font-bold text-white shadow-sm transition hover:bg-[#145219] disabled:opacity-60"
            >
              <span>{loading ? 'Signing in...' : 'Log in'}</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFCB3D] text-[#1F2A1F]">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              </span>
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#E5F0E0]" />
            <span className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[#557945]">
              Or continue with
            </span>
            <div className="h-px flex-1 bg-[#E5F0E0]" />
          </div>

          <a
            href={GOOGLE_OAUTH_URL}
            className="flex h-[52px] w-full items-center justify-center gap-3 rounded-full border border-[#D5E6CF] bg-[#F6FAF3] text-[14px] font-semibold text-[#1F2A1F] transition hover:bg-[#eaf7e6]"
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

          <p className="mt-7 text-center text-[16px] text-[#557945]">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-bold text-[#2F6B2F] hover:underline">
              Create account
            </Link>
          </p>
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
