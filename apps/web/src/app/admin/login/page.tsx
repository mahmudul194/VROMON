'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Database,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { adminApiFetch } from '@/lib/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const existing = localStorage.getItem('vromon_admin_token');
    if (!existing) return;
    adminApiFetch<{ user: { role: string } }>('/auth/me')
      .then((res) => {
        if (res?.user?.role === 'ADMIN') {
          router.replace('/admin');
        }
      })
      .catch(() => {
        localStorage.removeItem('vromon_admin_token');
        localStorage.removeItem('vromon_admin_user');
      });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await adminApiFetch('/auth/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password }),
      });
      localStorage.setItem('vromon_admin_token', res.access_token);
      localStorage.setItem('vromon_admin_user', JSON.stringify(res.user));
      router.push('/admin');
    } catch (err: any) {
      setError(
        err?.message || 'Invalid administrator credentials. Please verify your email and password.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#E5F0E0] px-4 py-12 sm:px-6">
      {/* Ambient Background Blobs */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-[480px] w-[480px] rounded-full bg-[#5D9253]/30 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-[480px] w-[480px] rounded-full bg-[#FFCB3D]/35 blur-[120px]" />

      {/* Top Back Link */}
      <div className="relative z-10 mb-6 flex w-full max-w-[480px] items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-[#D5E6CF] bg-white/90 px-4 py-2 text-[14px] font-semibold text-[#1F2A1F] shadow-sm transition hover:bg-[#EAF7E6]"
        >
          <ArrowLeft className="h-4 w-4 text-[#2F6B2F]" />
          <span>Public Website</span>
        </Link>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#145219] px-3.5 py-1.5 text-[13px] font-semibold uppercase tracking-[0.06em] text-[#FFCB3D]">
          <ShieldCheck className="h-3.5 w-3.5" />
          Admin Console
        </span>
      </div>

      {/* Main Dedicated Admin Portal Card */}
      <div className="relative z-10 w-full max-w-[480px] rounded-[32px] border border-[#D5E6CF] bg-white p-8 shadow-[0_24px_60px_rgba(31,42,31,0.14)] sm:p-11">
        <div className="mb-7 flex flex-col items-center text-center">
          <img
            src="/vromon_logo.png"
            alt="VROMON"
            className="mb-5 h-10 w-auto object-contain"
          />

          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[#EAF7E6] px-3.5 py-1 text-[13px] font-semibold uppercase tracking-[0.06em] text-[#145219]">
            <Database className="h-3.5 w-3.5" />
            Operations &amp; Catalog Control
          </div>

          <h1 className="text-[32px] font-bold leading-tight tracking-tight text-[#1F2A1F] sm:text-[36px]">
            Administrator Sign In
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-[#41493E]">
            Sign in with your pre-provisioned administrator account to manage all 64 districts,
            rates, and query telemetry.
          </p>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-medium text-[#ba1a1a]">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold uppercase tracking-[0.06em] text-[#557945]">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#557945]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@vromon.bd"
                className="h-14 w-full rounded-full border border-[#D5E6CF] bg-[#F6FAF3] pl-11 pr-5 text-[15px] font-medium text-[#1F2A1F] focus:border-[#2F6B2F] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-semibold uppercase tracking-[0.06em] text-[#557945]">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#557945]" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter administrator password"
                className="h-14 w-full rounded-full border border-[#D5E6CF] bg-[#F6FAF3] pl-11 pr-12 text-[15px] font-medium text-[#1F2A1F] focus:border-[#2F6B2F] focus:bg-white focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label="Toggle password visibility"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#557945] hover:text-[#1F2A1F]"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group mt-2 flex h-14 w-full items-center justify-between rounded-full bg-[#145219] pl-6 pr-2.5 text-[16px] font-semibold text-white shadow-[0_12px_30px_rgba(20,82,25,0.24)] transition hover:bg-[#2F6B2F] disabled:opacity-65"
          >
            <span className="flex items-center gap-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{loading ? 'Verifying credentials...' : 'Enter Admin Console'}</span>
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFCB3D] text-[#1F2A1F] transition-transform group-hover:translate-x-0.5">
              <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
            </span>
          </button>
        </form>

        {/* Provisioning Notice (No Public Registration) */}
        <div className="mt-6 rounded-2xl bg-[#EAF7E6]/80 p-3.5 text-center">
          <p className="text-[14px] leading-relaxed text-[#41493E]">
            <span className="font-semibold text-[#145219]">Pre-provisioned accounts only:</span>{' '}
            Public registration is disabled for the Admin Console.
          </p>
        </div>
      </div>
    </div>
  );
}
