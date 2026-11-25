'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, RefreshCw, WifiOff, X } from 'lucide-react';

export function OfflineBanner() {
  const router = useRouter();
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
              No internet connection detected. Live AI recommendations will resume once you reconnect.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (typeof navigator !== 'undefined' && navigator.onLine) {
              setIsOffline(false);
              setJustReconnected(true);
              router.refresh();
            }
          }}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-[#FFCB3D] px-5 text-[14px] font-bold text-[#1F2A1F] transition hover:opacity-90"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      </div>
    </div>
  );
}
