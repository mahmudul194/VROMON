'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Activity, ChevronDown, RotateCcw, Wrench } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [checkingHealth, setCheckingHealth] = useState(false);
  const [apiHealth, setApiHealth] = useState<'unchecked' | 'online' | 'degraded'>('unchecked');
  const [timestamp, setTimestamp] = useState('Synchronized Just now');

  useEffect(() => {
    console.error('VROMON route error:', error);
    const now = new Date();
    setTimestamp(
      `${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} GMT+6`,
    );
  }, [error]);

  const handleCheckStatus = async () => {
    setDetailsOpen(true);
    setCheckingHealth(true);
    try {
      const res = await fetch(`${API_BASE}/health`);
      setApiHealth(res.ok ? 'online' : 'degraded');
    } catch {
      setApiHealth('degraded');
    } finally {
      setCheckingHealth(false);
    }
  };

  const errorCode = error.digest || 'ERR_VRM_500_CLUSTER_DHAKA';

  return (
    <main className="flex min-h-[calc(100vh-180px)] w-full flex-col items-center justify-center px-4 py-12 sm:px-6">
      {/* Central Editorial Card (#26) */}
      <div className="relative flex w-full max-w-xl flex-col items-center overflow-hidden rounded-[28px] border border-[#D5E6CF]/80 bg-white p-8 text-center shadow-2xl sm:p-12">
        <div className="pointer-events-none absolute -right-24 -top-24 h-60 w-60 rounded-full bg-[#FFCB3D]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-60 w-60 rounded-full bg-[#145219]/10 blur-3xl" />

        {/* Bespoke Server Stack + Amber Spark Beacon Illustration */}
        <div className="relative mb-6 flex h-32 w-32 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full bg-[#DFECDB]/60 opacity-25" />
          <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-[#EAF7E6] shadow-inner">
            <svg
              className="h-16 w-16"
              fill="none"
              viewBox="0 0 64 64"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect fill="#145219" fillOpacity="0.12" height="12" rx="4" width="40" x="12" y="38" />
              <circle cx="18" cy="44" fill="#145219" r="1.75" />
              <circle cx="24" cy="44" fill="#145219" r="1.75" />
              <line stroke="#145219" strokeLinecap="round" strokeWidth="1.5" x1="38" x2="46" y1="44" y2="44" />
              <rect fill="#145219" fillOpacity="0.2" height="12" rx="4" width="40" x="12" y="24" />
              <circle cx="18" cy="30" fill="#145219" r="1.75" />
              <circle cx="24" cy="30" fill="#145219" r="1.75" />
              <line stroke="#145219" strokeLinecap="round" strokeWidth="1.5" x1="38" x2="46" y1="30" y2="30" />
              <rect fill="#145219" height="12" rx="4" width="40" x="12" y="10" />
              <circle cx="18" cy="16" fill="#FFCB3D" r="1.75" />
              <circle cx="24" cy="16" fill="#FFCB3D" r="1.75" />
              <line stroke="#FFFFFF" strokeLinecap="round" strokeOpacity="0.7" strokeWidth="1.5" x1="38" x2="46" y1="16" y2="16" />
              <path
                className="animate-pulse drop-shadow-md"
                d="M30 6L23 23H35L29 38"
                stroke="#FFCB3D"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
              />
            </svg>
            <div className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#FFCB3D] text-[#1F2A1F] shadow-md">
              <Wrench className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Status Eyebrow Badge */}
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#FFDF97] px-3.5 py-1.5 text-[#251A00]">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#775A00]" />
          <span className="text-[13px] font-semibold uppercase tracking-[0.06em]">
            500 • Internal System Error
          </span>
        </div>

        <h1 className="mb-3 text-[28px] font-bold leading-[34px] tracking-tight text-[#1F2A1F] sm:text-[40px] sm:leading-[48px]">
          Something broke on our side
        </h1>

        <p className="mx-auto mb-8 max-w-md text-[16px] leading-relaxed text-[#41493E]">
          Our trip planning engines hit an unexpected roadblock while generating your route.
          Your saved trips and preferences remain completely safe.
        </p>

        {/* Interactive Call-to-Actions */}
        <div className="mb-7 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
          <button
            type="button"
            onClick={() => reset()}
            className="flex h-14 w-full items-center justify-between gap-3 rounded-full bg-[#145219] py-2 pl-6 pr-2 text-[16px] font-semibold text-white shadow-md transition hover:bg-[#2F6B2F] sm:w-auto"
          >
            <span>Try again</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFCB3D] text-[#1F2A1F]">
              <RotateCcw className="h-4 w-4" strokeWidth={2.2} />
            </span>
          </button>

          <button
            type="button"
            onClick={handleCheckStatus}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#DFECDB] px-6 text-[16px] font-semibold text-[#1F2A1F] transition hover:bg-[#D5E6CF] sm:w-auto"
          >
            <Activity className="h-4 w-4 text-[#145219]" />
            <span>{checkingHealth ? 'Checking API...' : 'Check system status'}</span>
          </button>
        </div>

        {/* Diagnostic Details Drawer / Accordion */}
        <div className="w-full rounded-2xl bg-[#EAF7E6] p-4 text-left">
          <button
            type="button"
            onClick={() => setDetailsOpen((o) => !o)}
            className="flex w-full items-center justify-between text-left"
          >
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#775A00]" />
              <span className="text-[14px] font-semibold text-[#41493E]">
                Telemetry Diagnostics
              </span>
            </span>
            <ChevronDown
              className={`h-4 w-4 text-[#41493E] transition-transform duration-200 ${
                detailsOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {detailsOpen && (
            <div className="mt-3 space-y-2 rounded-xl bg-white/80 p-3.5 text-[14px] text-[#41493E]">
              <div className="flex items-center justify-between">
                <span className="text-[#557945]">Error Code:</span>
                <span className="font-semibold text-[#ba1a1a]">{errorCode}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#557945]">API Gateway Health:</span>
                <span
                  className={`font-semibold ${
                    apiHealth === 'online'
                      ? 'text-[#145219]'
                      : apiHealth === 'degraded'
                      ? 'text-[#ba1a1a]'
                      : 'text-[#41493E]'
                  }`}
                >
                  {apiHealth === 'online'
                    ? 'Operational (200 OK)'
                    : apiHealth === 'degraded'
                    ? 'Unreachable / Restarting'
                    : 'Click Check system status'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#557945]">Timestamp:</span>
                <span>{timestamp}</span>
              </div>
            </div>
          )}
        </div>

        <p className="mt-5 text-[14px] text-[#557945]">
          Ref: <span className="font-semibold text-[#1F2A1F]">{errorCode}</span> •{' '}
          <Link href="/" className="font-semibold text-[#145219] underline underline-offset-4">
            Return Home
          </Link>
        </p>
      </div>
    </main>
  );
}
