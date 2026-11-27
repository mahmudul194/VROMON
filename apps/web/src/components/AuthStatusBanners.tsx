'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle2, Eye, EyeOff, Loader2, Lock, ShieldCheck, Timer, X } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export function SessionExpiredGatewayCard({
  onDismiss,
  standalone = false,
}: {
  onDismiss?: () => void;
  standalone?: boolean;
}) {
  const router = useRouter();
  const { lastKnownUser, setSession, clearSessionExpired } = useAuth();
  const [email, setEmail] = useState(lastKnownUser?.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [timeoutStamp, setTimeoutStamp] = useState('Just now');

  useEffect(() => {
    if (lastKnownUser?.email && !email) {
      setEmail(lastKnownUser.email);
    }
  }, [lastKnownUser, email]);

  useEffect(() => {
    const now = new Date();
    setTimeoutStamp(
      `${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} BST`,
    );
  }, []);

  const initials = (lastKnownUser?.name || email || 'VR')
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleRelogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password }),
      });
      setSession(res.access_token, res.user);
      setPassword('');
      onDismiss?.();
      if (standalone) {
        router.push('/plan');
      }
    } catch (err: any) {
      setError(err?.message || 'Incorrect password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative z-10 flex w-full max-w-[480px] flex-col items-center">
      <div className="relative flex w-full flex-col items-center rounded-[32px] border border-[#D5E6CF]/80 bg-white p-8 text-center shadow-[0_24px_60px_rgba(31,42,31,0.14)] sm:p-11">
        {!standalone && onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Continue as guest"
            className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full text-[#41493E] transition hover:bg-[#E5F0E0] hover:text-[#1F2A1F]"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Top Expiration Badge (#35) */}
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-[#FFF6D6]">
          <div className="absolute inset-0 scale-95 rounded-full border border-[#FFCB3D]/40" />
          <Timer className="h-11 w-11 text-[#9A6B00]" strokeWidth={1.6} />
          <div className="absolute bottom-1 right-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#FFCB3D] text-[#1F2A1F] shadow-sm">
            <Lock className="h-3.5 w-3.5" strokeWidth={2.2} />
          </div>
        </div>

        <h1
          id="session-expired-title"
          className="mb-2 mt-6 text-[28px] font-bold leading-[34px] tracking-tight text-[#1F2A1F] sm:text-[36px] sm:leading-[42px]"
        >
          Your session expired
        </h1>
        <p className="mb-6 max-w-sm text-[15px] leading-relaxed text-[#41493E]">
          For your security, we signed you out after inactivity across your Bengal travel session.
        </p>

        {/* Account Inset Pod */}
        {lastKnownUser?.email ? (
          <div className="mb-5 flex w-full items-center justify-between gap-3 rounded-[20px] bg-[#EAF7E6] p-3.5">
            <div className="flex min-w-0 items-center gap-3 text-left">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2F6B2F] text-[14px] font-bold text-white shadow-sm">
                {initials}
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[#557945]">
                  Continue as
                </span>
                <span className="truncate text-[15px] font-semibold text-[#1F2A1F]">
                  {lastKnownUser.email}
                </span>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3 py-1 shadow-sm">
              <ShieldCheck className="h-4 w-4 text-[#145219]" />
              <span className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[#145219]">
                Cached
              </span>
            </div>
          </div>
        ) : (
          <div className="mb-3.5 w-full">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your account email"
              aria-label="Account email"
              className="h-14 w-full rounded-full border border-[#D5E6CF] bg-[#F9FCF8] px-5 text-[15px] text-[#1F2A1F] placeholder:text-[#557945]/70 focus:border-[#2F6B2F] focus:bg-white focus:outline-none"
            />
          </div>
        )}

        {error && (
          <div className="mb-3.5 w-full rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-left text-[14px] font-medium text-[#ba1a1a]">
            {error}
          </div>
        )}

        {/* Password Re-Auth Form */}
        <form onSubmit={handleRelogin} className="flex w-full flex-col gap-3.5">
          <div className="flex h-14 w-full items-center rounded-full border border-[#D5E6CF] bg-[#F9FCF8] px-5 shadow-sm transition focus-within:border-[#2F6B2F] focus-within:bg-white">
            <Lock className="mr-3 h-4 w-4 shrink-0 text-[#557945]" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              aria-label="Account password"
              className="w-full bg-transparent text-[15px] text-[#1F2A1F] outline-none placeholder:text-[#557945]/70"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label="Toggle password visibility"
              className="ml-2 flex shrink-0 items-center justify-center text-[#557945] hover:text-[#1F2A1F]"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="group flex h-14 w-full items-center justify-between rounded-full bg-[#145219] py-2 pl-6 pr-2.5 text-[16px] font-semibold text-white shadow-[0_12px_30px_rgba(20,82,25,0.22)] transition hover:bg-[#2F6B2F] disabled:opacity-65"
          >
            <span className="flex items-center gap-2">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>Log back in</span>
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFCB3D] text-[#1F2A1F] shadow-sm transition-transform group-hover:translate-x-0.5">
              <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
            </span>
          </button>
        </form>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/login"
            onClick={clearSessionExpired}
            className="text-[14px] font-semibold text-[#145219] underline-offset-4 hover:underline"
          >
            Not you? Switch account
          </Link>
          {!standalone && onDismiss && (
            <>
              <span className="text-[#D5E6CF]">|</span>
              <button
                type="button"
                onClick={onDismiss}
                className="text-[14px] font-semibold text-[#557945] hover:text-[#1F2A1F]"
              >
                Continue as guest
              </button>
            </>
          )}
        </div>
      </div>

      {/* Security Telemetry Metadata */}
      <div className="mt-5 flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-[14px] font-medium text-[#557945] shadow-sm backdrop-blur-md">
        <ShieldCheck className="h-4 w-4 text-[#145219]" />
        <span>256-bit encrypted</span>
        <span>•</span>
        <span>Session timed out at {timeoutStamp}</span>
      </div>
    </div>
  );
}

export function AuthStatusBanners() {
  const pathname = usePathname();
  const { sessionExpired, loggedOutNotice, clearSessionExpired, clearLoggedOutNotice } =
    useAuth();

  useEffect(() => {
    if (!loggedOutNotice) return;
    const timer = setTimeout(() => clearLoggedOutNotice(), 4500);
    return () => clearTimeout(timer);
  }, [loggedOutNotice, clearLoggedOutNotice]);

  const onDedicatedLoggedOut = pathname === '/logged-out';
  const onDedicatedExpired = pathname === '/session-expired';

  return (
    <>
      {/* #35 Session Expired Modal Overlay */}
      {sessionExpired && !onDedicatedExpired && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="session-expired-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1F2A1F]/45 px-4 backdrop-blur-md"
        >
          <SessionExpiredGatewayCard onDismiss={clearSessionExpired} />
        </div>
      )}

      {/* Subtle Toast if not on dedicated /logged-out page */}
      {loggedOutNotice && !onDedicatedLoggedOut && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 left-4 right-4 z-50 mx-auto flex max-w-md items-center justify-between gap-3 rounded-full border border-[#D5E6CF] bg-[#1F2A1F] px-5 py-3.5 text-white shadow-[0_20px_60px_rgba(31,42,31,0.22)]"
        >
          <div className="flex items-center gap-2.5 text-[14px] font-semibold">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#FFCB3D]" />
            <span>You have been signed out safely.</span>
          </div>
          <button
            type="button"
            onClick={clearLoggedOutNotice}
            aria-label="Dismiss sign-out notice"
            className="rounded-full p-1 text-white/80 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </>
  );
}
