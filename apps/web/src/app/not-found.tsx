'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Compass, Navigation, Search, Sparkles } from 'lucide-react';

const ANGLES = [45, 130, 225, -45, 85, 0, 315];

export default function NotFoundPage() {
  const [angleIdx, setAngleIdx] = useState(0);
  const [spinBoost, setSpinBoost] = useState(0);

  const handleSpinCompass = () => {
    setAngleIdx((prev) => (prev + 1) % ANGLES.length);
    setSpinBoost((prev) => prev + 360);
  };

  const needleDeg = ANGLES[angleIdx] + spinBoost;

  return (
    <main className="relative flex min-h-[calc(100vh-180px)] w-full flex-col items-center justify-center overflow-hidden px-4 py-12 sm:px-6 lg:px-12">
      {/* Ambient Atmospheric Backdrops (#25 & #61) */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#145219]/5 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 -z-10 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FFCB3D]/20 blur-2xl" />

      {/* Editorial Card Sanctuary */}
      <div className="relative flex w-full max-w-4xl flex-col items-center overflow-hidden rounded-[28px] border border-[#D5E6CF]/80 bg-white/90 p-7 text-center shadow-[0_24px_60px_rgba(31,42,31,0.08)] backdrop-blur-xl sm:p-12 lg:p-16">
        <div className=" absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#2F6B2F]/40 to-transparent" />

        {/* Brand Overline */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-[#E5F2E0] px-4 py-1.5">
          <Sparkles className="h-3.5 w-3.5 text-[#2F6B2F]" />
          <span className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[#145219]">
            VROMON CURATION ENGINE
          </span>
        </div>

        {/* Central Hero 404 with Stylized Interactive Amber Compass as '0' */}
        <div className="my-1 flex select-none items-center justify-center leading-none tracking-tighter">
          <span className="text-[108px] font-extrabold text-[#145219] drop-shadow-sm sm:text-[168px] md:text-[204px]">
            4
          </span>

          <button
            type="button"
            onClick={handleSpinCompass}
            title="Click to recalibrate compass coordinates"
            aria-label="Recalibrate compass"
            className="group relative mx-2.5 flex items-center justify-center focus:outline-none sm:mx-6"
          >
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#FFCB3D]/25 p-2 transition-transform duration-500 group-hover:scale-105 sm:h-36 sm:w-36 md:h-44 md:w-44">
              <div className="relative flex h-full w-full items-center justify-center rounded-full bg-[#FFCB3D] shadow-lg">
                <svg
                  className="h-full w-full p-2"
                  fill="none"
                  viewBox="0 0 160 160"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="80"
                    cy="80"
                    r="74"
                    stroke="#775A00"
                    strokeDasharray="3 4"
                    strokeOpacity="0.5"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="66"
                    stroke="#131E14"
                    strokeOpacity="0.3"
                    strokeWidth="1.2"
                  />
                  <line stroke="#131E14" strokeLinecap="round" strokeWidth="2.5" x1="80" x2="80" y1="12" y2="24" />
                  <line stroke="#131E14" strokeLinecap="round" strokeWidth="2" x1="80" x2="80" y1="136" y2="148" />
                  <line stroke="#131E14" strokeLinecap="round" strokeWidth="2" x1="12" x2="24" y1="80" y2="80" />
                  <line stroke="#131E14" strokeLinecap="round" strokeWidth="2" x1="136" x2="148" y1="80" y2="80" />
                  <line stroke="#131E14" strokeLinecap="round" strokeOpacity="0.5" strokeWidth="1.5" x1="32" x2="40" y1="32" y2="40" />
                  <line stroke="#131E14" strokeLinecap="round" strokeOpacity="0.5" strokeWidth="1.5" x1="128" x2="120" y1="32" y2="40" />
                  <line stroke="#131E14" strokeLinecap="round" strokeOpacity="0.5" strokeWidth="1.5" x1="32" x2="40" y1="128" y2="120" />
                  <line stroke="#131E14" strokeLinecap="round" strokeOpacity="0.5" strokeWidth="1.5" x1="128" x2="120" y1="128" y2="120" />
                  <text fill="#131E14" fontSize="11" fontWeight="800" textAnchor="middle" x="80" y="36">
                    N
                  </text>
                  <text fill="#131E14" fontSize="9" fontWeight="700" textAnchor="middle" x="130" y="83">
                    E
                  </text>
                  <text fill="#131E14" fontSize="9" fontWeight="700" textAnchor="middle" x="80" y="132">
                    S
                  </text>
                  <text fill="#131E14" fontSize="9" fontWeight="700" textAnchor="middle" x="30" y="83">
                    W
                  </text>
                  <g
                    style={{
                      transform: `rotate(${needleDeg}deg)`,
                      transformOrigin: '80px 80px',
                      transition: 'transform 0.9s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    }}
                  >
                    <polygon fill="#145219" points="80,24 88,80 80,72 72,80" />
                    <polygon fill="#775A00" fillOpacity="0.75" points="80,136 88,80 80,88 72,80" />
                    <circle cx="80" cy="80" fill="#FFFFFF" r="5" stroke="#131E14" strokeWidth="1.5" />
                    <circle cx="80" cy="80" fill="#145219" r="2" />
                  </g>
                </svg>
              </div>
            </div>
          </button>

          <span className="text-[108px] font-extrabold text-[#145219] drop-shadow-sm sm:text-[168px] md:text-[204px]">
            4
          </span>
        </div>

        {/* Narrative & Headings */}
        <div className="mb-8 mt-4 flex max-w-xl flex-col items-center">
          <h1 className="mb-3 text-[28px] font-bold leading-[34px] tracking-tight text-[#1F2A1F] sm:text-[40px] sm:leading-[48px]">
            You&apos;ve wandered off the map
          </h1>
          <p className="max-w-lg text-[16px] leading-relaxed text-[#41493E] sm:text-[18px]">
            The trail ends here. The coordinates you followed don&apos;t match any registered
            route, tea estate, or coastal sanctuary in Bangladesh.
          </p>
        </div>

        {/* Action Pill Group */}
        <div className="flex w-full flex-col items-center justify-center gap-3.5 sm:w-auto sm:flex-row">
          <Link
            href="/"
            className="group flex h-14 w-full min-w-[210px] items-center justify-between rounded-full bg-[#2F6B2F] pl-6 pr-2 text-[16px] font-semibold text-white shadow-md transition hover:bg-[#145219] sm:w-auto"
          >
            <span className="flex items-center gap-2">
              <Compass className="h-4 w-4" />
              <span>Back home</span>
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFCB3D] text-[#1F2A1F] transition-transform group-hover:translate-x-0.5">
              <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
            </span>
          </Link>

          <Link
            href="/plan"
            className="flex h-14 w-full items-center justify-center gap-2.5 rounded-full border border-[#D5E6CF] bg-[#F6FAF3] px-7 text-[16px] font-semibold text-[#145219] transition hover:bg-[#E5F0E0] sm:w-auto"
          >
            <Search className="h-4 w-4" />
            <span>Search destinations</span>
          </Link>
        </div>

        {/* Suggested Detours Strip */}
        <div className="mt-10 flex w-full flex-col items-start justify-between gap-4 rounded-2xl bg-[#EAF7E6]/80 p-4 text-left sm:flex-row sm:items-center sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#145219] shadow-sm">
              <Navigation className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[#557945]">
                Suggested Detours
              </div>
              <div className="text-[14px] font-medium text-[#1F2A1F]">
                Sreemangal Tea Slopes • Cox&apos;s Bazar Coast • Sajek Valley
              </div>
            </div>
          </div>
          <Link
            href="/plan"
            className="inline-flex shrink-0 items-center gap-1 text-[13px] font-semibold uppercase tracking-[0.06em] text-[#145219] hover:text-[#2F6B2F]"
          >
            <span>Browse catalog</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Diagnostic Metadata Badge */}
      <div className="mt-7 flex items-center gap-2.5 rounded-full bg-white/80 px-5 py-2 shadow-sm backdrop-blur-md">
        <span className="h-2 w-2 animate-pulse rounded-full bg-[#ba1a1a]" />
        <span className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[#41493E]">
          Error Code: 404 • Destination Not Located
        </span>
      </div>
    </main>
  );
}
