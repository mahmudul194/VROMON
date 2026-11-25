import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#1F2A1F] px-6 pb-10 pt-16 text-white sm:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-10 border-b border-white/15 pb-14 md:grid-cols-12">
          {/* Brand Column */}
          <div className="space-y-5 md:col-span-5">
            <div className="flex items-center gap-3">
              <img
                src="/vromon_logo.png"
                alt="VROMON Logo"
                className="h-10 w-10 rounded-full border border-white/20 object-cover"
              />
              <span className="whitespace-nowrap text-[20px] font-bold tracking-[0.08em] text-white">
                VROMON
              </span>
            </div>
            <p className="max-w-sm text-[16px] font-normal leading-relaxed text-white/75">
              Bangladesh&apos;s multi-vector AI travel feasibility engine. Precision recommendations
              calibrated for real budgets, transit hours, seasonal climates, and crowd levels.
            </p>
          </div>

          {/* Product */}
          <div className="space-y-4 md:col-span-2">
            <h4 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[#FFCB3D]">
              PRODUCT
            </h4>
            <ul className="space-y-2.5 text-[14px] text-white/75">
              <li>
                <Link href="/#features" className="transition-colors hover:text-white">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="transition-colors hover:text-white">
                  How it Works
                </Link>
              </li>
              <li>
                <Link href="/plan" className="transition-colors hover:text-white">
                  Trip Planner
                </Link>
              </li>
              <li>
                <Link href="/compare" className="transition-colors hover:text-white">
                  Compare Tool
                </Link>
              </li>
            </ul>
          </div>

          {/* Destinations */}
          <div className="space-y-4 md:col-span-2">
            <h4 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[#FFCB3D]">
              DESTINATIONS
            </h4>
            <ul className="space-y-2.5 text-[14px] text-white/75">
              <li>
                <Link href="/plan" className="transition-colors hover:text-white">
                  Sajek &amp; Bandarban
                </Link>
              </li>
              <li>
                <Link href="/plan" className="transition-colors hover:text-white">
                  Sylhet &amp; Sreemangal
                </Link>
              </li>
              <li>
                <Link href="/plan" className="transition-colors hover:text-white">
                  Cox&apos;s Bazar &amp; St. Martin
                </Link>
              </li>
              <li>
                <Link href="/plan" className="transition-colors hover:text-white">
                  Khulna &amp; Sundarbans
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Plan */}
          <div className="space-y-4 md:col-span-3">
            <h4 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[#FFCB3D]">
              ADVISORY NOTE
            </h4>
            <p className="text-[14px] font-normal leading-relaxed text-white/70">
              All fares, room rates, and weather indices are regional estimates in BDT. Verify live
              schedules before departure.
            </p>
            <Link
              href="/plan"
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[14px] font-semibold text-white transition-colors hover:bg-white/20"
            >
              <span>Launch Planner</span>
              <ArrowRight className="h-3.5 w-3.5 text-[#FFCB3D]" />
            </Link>
          </div>
        </div>

        {/* Giant Watermark */}
        <div className="pointer-events-none select-none pt-6 text-center text-[72px] font-extrabold leading-[0.85] tracking-[-0.05em] text-white opacity-[0.06] sm:text-[130px] lg:text-[180px]">
          VROMON
        </div>

        <div className="relative z-10 flex flex-col items-center justify-between gap-4 pt-6 text-[14px] text-white/55 sm:flex-row">
          <div>SE331 Software Engineering Design Capstone — Group 6</div>
          <div className="flex gap-6">
            <Link href="/plan" className="hover:text-white">
              64 Districts
            </Link>
            <Link href="/compare" className="hover:text-white">
              Compare
            </Link>
            <Link href="/login" className="hover:text-white">
              Account
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
