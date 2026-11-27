'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, Cloud, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoggedOutPage() {
  const { clearLoggedOutNotice } = useAuth();
  const [savedCount, setSavedCount] = useState<number>(0);

  useEffect(() => {
    clearLoggedOutNotice();
    if (typeof window !== 'undefined') {
      try {
        const cached = JSON.parse(localStorage.getItem('vromon_cached_trips') || '[]');
        if (Array.isArray(cached)) {
          setSavedCount(cached.length);
        }
      } catch {
        // ignore
      }
    }
  }, [clearLoggedOutNotice]);

  return (
    <div className="relative flex min-h-[calc(100vh-180px)] w-full flex-col items-center justify-center overflow-hidden px-4 py-12 sm:px-6">
      {/* Atmospheric Ambient Blobs (#34) */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-[480px] w-[480px] rounded-full bg-[#5D9253]/30 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-[480px] w-[480px] rounded-full bg-[#FFCB3D]/35 blur-[120px]" />

      {/* Subtle Coordinate Watermark */}
      <div className="pointer-events-none absolute left-8 top-6 hidden select-none items-center gap-2 text-[#557945]/70 lg:flex">
        <span className="text-[13px] font-semibold uppercase tracking-[0.06em]">
          Session Terminated
        </span>
        <span className="h-1.5 w-1.5 rounded-full bg-[#D5E6CF]" />
        <span className="text-[14px] font-medium">23°49&apos;N 90°24&apos;E</span>
      </div>

      {/* Centered Success Card */}
      <div className="relative z-10 flex w-full max-w-[480px] flex-col items-center rounded-[32px] border border-[#D5E6CF]/80 bg-white p-8 text-center shadow-[0_24px_60px_rgba(31,42,31,0.12)] sm:p-12">
        {/* Top Verified Icon with Amber Halo Ring */}
        <div className="relative mb-6 flex items-center justify-center">
          <div className="absolute -inset-1.5 rounded-full border border-[#FFCB3D]" />
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#2F6B2F] text-white shadow-sm">
            <Check className="h-10 w-10" strokeWidth={2.6} />
          </div>
        </div>

        <h1 className="mb-2 text-[28px] font-bold leading-[34px] tracking-tight text-[#1F2A1F] sm:text-[40px] sm:leading-[48px]">
          You&apos;ve been logged out
        </h1>
        <p className="mb-6 max-w-sm text-[16px] leading-relaxed text-[#41493E]">
          Thanks for planning with VROMON. Your curated trip plans and travel memories are
          preserved safely for your next journey.
        </p>

        {/* Destination Thumbnails Row with Overlap */}
        <div className="my-1 flex w-full flex-col items-center">
          <div className="mb-4 flex items-center justify-center -space-x-3">
            {[
              { src: '/images/destinations/cox-s-bazar.jpg', alt: "Cox's Bazar Coast" },
              { src: '/images/destinations/sajek-valley.jpg', alt: 'Sajek Valley Hills' },
              { src: '/images/destinations/sreemangal.jpg', alt: 'Sreemangal Tea Estates' },
            ].map((thumb, idx) => (
              <div
                key={thumb.alt}
                className={`relative h-[72px] w-[72px] overflow-hidden rounded-[20px] bg-[#E5F0E0] shadow-md ring-4 ring-white transition duration-200 hover:-translate-y-1 ${
                  idx === 1 ? 'z-10' : ''
                }`}
              >
                <img src={thumb.src} alt={thumb.alt} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-[#EAF7E6] px-4 py-1.5 shadow-sm">
            <Cloud className="h-4 w-4 text-[#145219]" />
            <span className="text-[14px] font-medium text-[#41493E]">
              {savedCount > 0
                ? `${savedCount} trip${savedCount === 1 ? '' : 's'} safely saved in cloud`
                : 'Trips & preferences safely saved in cloud'}
            </span>
          </div>
        </div>

        {/* Action Buttons Tray */}
        <div className="mt-8 flex w-full flex-col gap-3.5">
          <Link
            href="/login"
            className="group flex h-14 w-full items-center justify-between rounded-full bg-[#2F6B2F] pl-6 pr-2 text-[16px] font-semibold text-white shadow-[0_12px_30px_rgba(47,107,47,0.2)] transition hover:bg-[#145219]"
          >
            <span>Log in again</span>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFCB3D] text-[#1F2A1F] transition-transform duration-200 group-hover:translate-x-0.5">
              <ArrowRight className="h-5 w-5" strokeWidth={2.4} />
            </span>
          </Link>

          <Link
            href="/"
            className="group flex h-12 w-full items-center justify-center gap-2 rounded-full text-[16px] font-semibold text-[#145219] transition hover:bg-[#EAF7E6]"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to home</span>
          </Link>
        </div>
      </div>

      {/* Footer Audit Line */}
      <div className="relative z-10 mt-6 flex flex-wrap items-center justify-center gap-2">
        <div className="flex items-center gap-2 rounded-full bg-white/75 px-4 py-1.5 shadow-sm backdrop-blur-md">
          <ShieldCheck className="h-4 w-4 text-[#145219]" />
          <span className="text-[14px] text-[#41493E]">Signed out safely from this browser</span>
          <span className="h-1 w-1 rounded-full bg-[#557945]" />
          <span className="text-[14px] font-semibold text-[#145219]">Just now</span>
        </div>
      </div>
    </div>
  );
}
