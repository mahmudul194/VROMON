import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-220px)] max-w-md flex-col items-center justify-center px-4 py-16 text-center">
      <div className="w-full rounded-[28px] border border-[#D5E6CF] bg-white p-8 shadow-[0_20px_60px_rgba(31,42,31,0.09)]">
        <div className="mb-6 flex justify-center">
          <img
            src="/vromon_logo.png"
            alt="VROMON"
            className="h-11 w-auto object-contain"
          />
        </div>

        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#E5F0E0] text-[#2F6B2F]">
          <Loader2 className="h-6 w-6 animate-spin" strokeWidth={2.25} />
        </div>

        <p className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[#557945]">
          Loading Route
        </p>
        <h2 className="mt-1 text-[24px] font-semibold text-[#1F2A1F]">
          Preparing Your View
        </h2>
        <p className="mt-2 text-[16px] font-normal text-[#41493E]">
          Fetching verified destination data and feasibility scores...
        </p>

        <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-[#E5F0E0]">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-[#2F6B2F]" />
        </div>
      </div>
    </div>
  );
}
