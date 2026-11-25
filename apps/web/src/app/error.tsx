'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('VROMON route error:', error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-220px)] max-w-lg flex-col items-center justify-center space-y-6 px-4 py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFCB3D]/25 text-[#1F2A1F]">
        <AlertTriangle className="h-8 w-8 text-[#c62828]" strokeWidth={1.75} />
      </div>

      <div className="space-y-2.5">
        <span className="inline-block text-[13px] font-semibold uppercase tracking-[0.06em] text-[#557945]">
          500 • Temporary Turbulence
        </span>
        <h1 className="text-[36px] font-extrabold leading-tight text-[#1F2A1F]">
          Something Went Wrong
        </h1>
        <p className="text-[16px] font-normal leading-relaxed text-[#41493E]">
          We hit an unexpected bump while loading this route. Your saved trips and preferences are
          safe. Please try again or return home.
        </p>
        {error.digest && (
          <p className="pt-1 text-[14px] font-medium text-[#557945]">
            Reference ID: {error.digest}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-[#2F6B2F] px-6 text-[14px] font-semibold text-white shadow-[0_8px_24px_rgba(47,107,47,0.20)] transition hover:bg-[#145219]"
        >
          <RotateCcw className="h-4 w-4" strokeWidth={2} />
          Try Again
        </button>
        <Link
          href="/"
          className="inline-flex h-11 items-center rounded-full border border-[#D5E6CF] bg-white px-6 text-[14px] font-semibold text-[#1F2A1F] transition hover:bg-[#F6FAF3]"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
