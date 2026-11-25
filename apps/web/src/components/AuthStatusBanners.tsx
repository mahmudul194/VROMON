'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle2, Clock, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function AuthStatusBanners() {
  const { sessionExpired, loggedOutNotice, clearSessionExpired, clearLoggedOutNotice } =
    useAuth();

  useEffect(() => {
    if (!loggedOutNotice) return;
    const timer = setTimeout(() => clearLoggedOutNotice(), 4500);
    return () => clearTimeout(timer);
  }, [loggedOutNotice, clearLoggedOutNotice]);

  return (
    <>
      {/* #35 Session Expired Modal */}
      {sessionExpired && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="session-expired-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1F2A1F]/45 px-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-md rounded-[28px] border border-[#D5E6CF] bg-white p-7 text-center shadow-[0_20px_60px_rgba(31,42,31,0.20)]">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#FFCB3D]/25 text-[#1F2A1F]">
              <Clock className="h-7 w-7 text-[#2F6B2F]" strokeWidth={1.75} />
            </div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[#557945]">
              Session Expired
            </p>
            <h2
              id="session-expired-title"
              className="mt-1 text-[24px] font-semibold text-[#1F2A1F]"
            >
              Please Sign In Again
            </h2>
            <p className="mt-2 text-[16px] font-normal text-[#41493E]">
              For your account security, your login session timed out. Sign in again to save trips
              and manage preferences.
            </p>
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
              <Link
                href="/login"
                onClick={clearSessionExpired}
                className="inline-flex h-11 items-center justify-center rounded-full bg-[#2F6B2F] px-6 text-[14px] font-semibold text-white transition hover:bg-[#145219]"
              >
                Log In Again
              </Link>
              <button
                type="button"
                onClick={clearSessionExpired}
                className="inline-flex h-11 items-center justify-center rounded-full border border-[#D5E6CF] bg-[#F6FAF3] px-6 text-[14px] font-semibold text-[#1F2A1F] transition hover:bg-[#E5F0E0]"
              >
                Continue as Guest
              </button>
            </div>
          </div>
        </div>
      )}

      {/* #34 Logged Out Success Toast */}
      {loggedOutNotice && (
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
