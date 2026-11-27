import React from 'react';

export default function LoadingPage() {
  return (
    <main className="relative flex min-h-[calc(100vh-160px)] w-full select-none flex-col items-center justify-between overflow-hidden px-4 py-12">
      {/* Atmospheric Fluid Ambient Blobs (#30 & #59) */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-[480px] w-[480px] rounded-full bg-[#5D9253]/30 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-36 -right-36 h-[520px] w-[520px] rounded-full bg-[#FFCB3D]/35 blur-[130px]" />

      {/* Subtle Top Brand Eyebrow */}
      <div className="relative z-10 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-[#FFCB3D]" />
        <span className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#1F511A]">
          Curated Bengal Expeditions
        </span>
      </div>

      {/* Primary Centerpiece Hub */}
      <div className="relative z-10 my-auto flex flex-col items-center justify-center py-8">
        {/* Orbital Halo Container (208px diameter) */}
        <div className="relative flex h-[208px] w-[208px] items-center justify-center">
          <svg
            className="absolute inset-0 h-full w-full animate-[spin_4s_linear_infinite]"
            fill="none"
            viewBox="0 0 208 208"
          >
            <defs>
              <linearGradient id="vromonArcGrad" x1="0%" x2="100%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="#2F6B2F" />
                <stop offset="65%" stopColor="#5D9253" />
                <stop offset="100%" stopColor="#FFCB3D" />
              </linearGradient>
            </defs>
            <circle cx="104" cy="104" r="98" stroke="#1F2A1F" strokeOpacity="0.10" strokeWidth="6" />
            <circle
              cx="104"
              cy="104"
              r="98"
              stroke="url(#vromonArcGrad)"
              strokeDasharray="461.81"
              strokeDashoffset="115.45"
              strokeLinecap="round"
              strokeWidth="6"
            />
          </svg>

          {/* Orbiting Particles */}
          <div className="pointer-events-none absolute inset-0 animate-[spin_5s_linear_infinite]">
            <div className="absolute left-[100px] top-[2px] h-2.5 w-2.5 rounded-full bg-[#FFCB3D] shadow-[0_0_12px_#FFCB3D]" />
          </div>
          <div className="pointer-events-none absolute inset-0 animate-[spin_7s_linear_infinite_reverse]">
            <div className="absolute bottom-[4px] right-[40px] h-2 w-2 rounded-full bg-[#5D9253] shadow-[0_0_8px_#5D9253]" />
          </div>

          {/* Solid Tactile Center Pod (160px diameter) */}
          <div className="relative z-10 flex h-40 w-40 items-center justify-center rounded-full bg-white shadow-xl">
            <svg
              className="h-[76px] w-[76px]"
              fill="none"
              viewBox="0 0 76 76"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="38"
                cy="38"
                r="32"
                stroke="#FFCB3D"
                strokeDasharray="2 6"
                strokeOpacity="0.85"
                strokeWidth="1"
              />
              <circle cx="38" cy="38" r="28" stroke="#2F6B2F" strokeOpacity="0.25" strokeWidth="1.5" />
              <path
                d="M38 10C38 10 46 22 46 38C46 51 38 66 38 66C38 66 30 51 30 38C30 22 38 10 38 10Z"
                fill="#2F6B2F"
              />
              <path d="M38 11V65" stroke="#FFCB3D" strokeLinecap="round" strokeWidth="1.5" />
              <path
                d="M38 24C41 22 43 19 44 17"
                stroke="#FFCB3D"
                strokeLinecap="round"
                strokeOpacity="0.85"
                strokeWidth="1.2"
              />
              <path
                d="M38 32C42 30 45 28 46 25"
                stroke="#FFCB3D"
                strokeLinecap="round"
                strokeOpacity="0.85"
                strokeWidth="1.2"
              />
              <path
                d="M38 40C42 39 45 37 46 34"
                stroke="#FFCB3D"
                strokeLinecap="round"
                strokeOpacity="0.85"
                strokeWidth="1.2"
              />
              <path
                d="M38 48C41 47 44 45 45 42"
                stroke="#FFCB3D"
                strokeLinecap="round"
                strokeOpacity="0.85"
                strokeWidth="1.2"
              />
              <path d="M38 10C34 18 30 28 30 38C30 51 38 66 38 66V10Z" fill="#145219" fillOpacity="0.3" />
              <path d="M38 38L62 38L42 41L38 38Z" fill="#2F6B2F" />
              <path d="M38 38L14 38L34 35L38 38Z" fill="#376A30" />
              <circle cx="38" cy="38" fill="#FFCB3D" r="4.5" />
              <circle cx="38" cy="38" fill="#131E14" r="2" />
            </svg>
          </div>
        </div>

        {/* Typography Stack */}
        <div className="mt-9 flex flex-col items-center text-center">
          <img src="/vromon_logo.png" alt="VROMON" className="h-10 w-auto object-contain" />
          <p className="mt-2.5 flex items-center gap-1.5 text-[16px] font-medium text-[#557945]">
            <span>Finding your perfect destination</span>
            <span className="animate-pulse font-bold">...</span>
          </p>
        </div>
      </div>

      {/* Bottom Progress Bar */}
      <div className="relative z-10 flex w-full max-w-xs flex-col items-center gap-2.5">
        <div className="relative h-1.5 w-60 overflow-hidden rounded-full bg-[#1F2A1F]/10 p-[1px]">
          <div className="h-full w-2/3 animate-pulse rounded-full bg-gradient-to-r from-[#2F6B2F] via-[#5D9253] to-[#FFCB3D]" />
        </div>
        <div className="flex w-60 items-center justify-between px-1 text-[14px]">
          <span className="text-[#557945]">64 Districts • Bangladesh</span>
          <span className="font-semibold text-[#145219]">Ready</span>
        </div>
      </div>
    </main>
  );
}
