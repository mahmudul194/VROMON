'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bookmark, CheckCircle2, Compass, Lightbulb, RefreshCw, WifiOff, X } from 'lucide-react';

export function OfflineDispatchCard({ onRetry }: { onRetry?: () => void }) {
  const router = useRouter();
  const [statusText, setStatusText] = useState('Status: Waiting for connection...');
  const [spinning, setSpinning] = useState(false);
  const [cachedTripsSummary, setCachedTripsSummary] = useState<string>(
    'Saved routes cached locally',
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const cached = JSON.parse(localStorage.getItem('vromon_cached_trips') || '[]');
      if (Array.isArray(cached) && cached.length > 0) {
        const names = cached
          .map((t: any) => t?.destination?.name || t?.recommendation_snapshot?.name || t?.title)
          .filter(Boolean)
          .slice(0, 2);
        setCachedTripsSummary(
          `${names.join(', ')} (${cached.length} Active)`,
        );
      }
    } catch {
      // ignore
    }
  }, []);

  const handleRetry = () => {
    setSpinning(true);
    setStatusText('Attempting reconnection...');
    setTimeout(() => setSpinning(false), 700);

    setTimeout(() => {
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        setStatusText('Reconnected! Loading destinations...');
        onRetry?.();
        router.refresh();
      } else {
        setStatusText('Connection unavailable. Check Wi-Fi or mobile data...');
        setTimeout(() => setStatusText('Status: Waiting for connection...'), 3000);
      }
    }, 800);
  };

  return (
    <div className="relative w-full max-w-lg">
      <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-[#B0F3A8]/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-[#FFDF97]/40 blur-3xl" />

      <div className="relative flex flex-col items-center rounded-[28px] border border-[#D5E6CF]/80 bg-white p-8 text-center shadow-xl sm:p-11">
        {/* Eyebrow */}
        <div className="mb-7 flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-[#FFCB3D]" />
          <span className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[#41493E]">
            Curator Dispatch
          </span>
          <span className="inline-block h-2 w-2 rounded-full bg-[#FFCB3D]" />
        </div>

        {/* Custom 1.5px Stylized Wi-Fi Off Vector with Amber Strikethrough (#27) */}
        <div className="relative mb-6">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#E5F2E0]">
            <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#DFECDB]">
              <svg
                className="h-12 w-12 text-[#145219]"
                fill="none"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7 16C16.5 8.5 31.5 8.5 41 16"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="1.75"
                />
                <path
                  d="M12 21.5C18.8 16 29.2 16 36 21.5"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="1.75"
                />
                <path
                  d="M17 27C21.2 23.5 26.8 23.5 31 27"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="1.75"
                />
                <circle cx="24" cy="33.5" fill="currentColor" r="2.2" />
                <path
                  d="M9 39L39 9"
                  stroke="#FFCB3D"
                  strokeLinecap="round"
                  strokeWidth="2.5"
                />
              </svg>
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#775A00] shadow-md">
            <WifiOff className="h-3.5 w-3.5" />
          </div>
        </div>

        <h1 className="mb-3 text-[28px] font-bold leading-[34px] tracking-tight text-[#1F2A1F] sm:text-[40px] sm:leading-[48px]">
          You&apos;re offline
        </h1>
        <p className="mb-6 max-w-sm text-[16px] leading-relaxed text-[#41493E]">
          It looks like your internet connection dropped. Check your network or Wi-Fi settings to
          continue planning your trip.
        </p>

        {/* Status Indicator Pill */}
        <div className="mb-7 inline-flex items-center gap-2.5 rounded-full bg-[#EAF7E6] px-4 py-2 shadow-sm">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FFCB3D] opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#775A00]" />
          </span>
          <span className="text-[14px] font-medium text-[#1F2A1F]">{statusText}</span>
        </div>

        {/* Action Buttons */}
        <div className="mb-7 flex w-full flex-col gap-3.5">
          <button
            type="button"
            onClick={handleRetry}
            className="flex h-14 w-full items-center justify-between rounded-full bg-[#2F6B2F] pl-6 pr-2 text-[16px] font-semibold text-white shadow-md transition hover:bg-[#145219]"
          >
            <span>Retry Connection</span>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFCB3D] text-[#1F2A1F]">
              <RefreshCw
                className={`h-5 w-5 transition-transform duration-700 ${
                  spinning ? 'rotate-[360deg]' : ''
                }`}
              />
            </span>
          </button>

          <Link
            href="/trips"
            className="flex h-12 w-full items-center justify-center gap-2.5 rounded-full bg-[#EAF7E6] px-6 text-[16px] font-semibold text-[#1F2A1F] transition hover:bg-[#D5E6CF]"
          >
            <Bookmark className="h-4 w-4 text-[#145219]" />
            <span>View saved offline trips</span>
          </Link>
        </div>

        {/* Cached Dossiers Strip */}
        <div className="mb-5 flex w-full items-center justify-between gap-3 rounded-2xl bg-[#EAF7E6]/75 p-4 text-left">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#D9E6D5] text-[#145219]">
              <Compass className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[#557945]">
                Cached Dossiers
              </div>
              <div className="truncate text-[14px] font-semibold text-[#1F2A1F]">
                {cachedTripsSummary}
              </div>
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-[#B0F3A8]/60 px-3 py-1 text-[13px] font-semibold uppercase tracking-[0.06em] text-[#145219]">
            Available
          </span>
        </div>

        {/* Helpful Tip */}
        <div className="flex items-center justify-center gap-2 text-[#41493E]">
          <Lightbulb className="h-4 w-4 shrink-0 text-[#775A00]" />
          <p className="text-left text-[14px] sm:text-center">
            <span className="font-semibold text-[#1F2A1F]">Tip:</span> Saved trip plans can still
            be viewed in offline mode.
          </p>
        </div>
      </div>

      {/* Coordinate Watermark */}
      <div className="mt-4 flex items-center justify-between px-4 text-[13px] font-semibold uppercase tracking-[0.06em] text-[#557945]/70">
        <span>LAT 23.6850° N</span>
        <span>DISCONNECTED</span>
        <span>LON 90.3563° E</span>
      </div>
    </div>
  );
}

export function OfflineBanner() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOffline, setIsOffline] = useState(false);
  const [justReconnected, setJustReconnected] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOffline = () => {
      setIsOffline(true);
      setJustReconnected(false);
    };

    const handleOnline = () => {
      setIsOffline(false);
      setJustReconnected(true);
    };

    setIsOffline(!navigator.onLine);

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  useEffect(() => {
    if (!justReconnected) return;
    const timer = setTimeout(() => setJustReconnected(false), 4000);
    return () => clearTimeout(timer);
  }, [justReconnected]);

  if (!isOffline && !justReconnected) return null;
  if (pathname === '/offline' && isOffline) return null;

  if (justReconnected) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="fixed bottom-4 left-4 right-4 z-50 mx-auto flex max-w-md items-center justify-between gap-3 rounded-full border border-[#2F6B2F]/20 bg-[#2F6B2F] px-5 py-3 text-white shadow-[0_20px_60px_rgba(31,42,31,0.18)]"
      >
        <div className="flex items-center gap-2.5 text-[14px] font-semibold">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-[#FFCB3D]" />
          <span>Back online. Live planning is ready.</span>
        </div>
        <button
          type="button"
          onClick={() => setJustReconnected(false)}
          aria-label="Dismiss online notice"
          className="rounded-full p-1 text-white/80 hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="sticky top-[86px] z-40 mx-auto mt-3 max-w-[1180px] px-4 sm:px-6"
    >
      <div className="flex flex-col gap-3 rounded-[24px] border border-[#FFCB3D] bg-[#1F2A1F] px-5 py-4 text-white shadow-[0_20px_60px_rgba(31,42,31,0.22)] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3.5 sm:items-center">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFCB3D] text-[#1F2A1F]">
            <WifiOff className="h-5 w-5" strokeWidth={2} />
          </div>
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[#FFCB3D]">
              You&apos;re Offline
            </p>
            <p className="text-[14px] font-normal text-white/90">
              No internet connection detected. View saved offline trips or retry once reconnected.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/trips"
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 text-[14px] font-semibold text-white transition hover:bg-white/20"
          >
            <Bookmark className="h-3.5 w-3.5 text-[#FFCB3D]" />
            <span>Saved Trips</span>
          </Link>
          <button
            type="button"
            onClick={() => {
              if (typeof navigator !== 'undefined' && navigator.onLine) {
                setIsOffline(false);
                setJustReconnected(true);
                router.refresh();
              } else {
                router.push('/offline');
              }
            }}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-[#FFCB3D] px-5 text-[14px] font-bold text-[#1F2A1F] transition hover:opacity-90"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}
