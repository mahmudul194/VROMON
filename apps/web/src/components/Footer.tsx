import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#1F2A1F] text-white pt-16 pb-10 px-6 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-10 border-b border-white/15 pb-14 md:grid-cols-12">
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-5">
            <div className="flex items-center gap-3">
              <img
                src="/vromon_logo.png"
                alt="VROMON Logo"
                className="h-10 w-10 rounded-full object-cover border border-white/20"
              />
              <span className="text-xl font-extrabold tracking-[0.08em] text-white whitespace-nowrap">
                VROMON
              </span>
            </div>
            <p className="max-w-sm text-[15px] leading-relaxed text-white/70">
              Bangladesh&apos;s multi-vector AI travel feasibility engine. Precision recommendations
              calibrated for real budgets, transit hours, seasonal climates, and crowd levels.
            </p>
          </div>

          {/* Product */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.12em] text-[#FFCB3D]">
              PRODUCT
            </h4>
            <ul className="space-y-2.5 text-sm text-white/75">
              <li>
                <Link href="/#features" className="hover:text-white transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-white transition-colors">
                  How it Works
                </Link>
              </li>
              <li>
                <Link href="/plan" className="hover:text-white transition-colors">
                  Trip Planner
                </Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-white transition-colors">
                  Compare Tool
                </Link>
              </li>
            </ul>
          </div>

          {/* Destinations */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.12em] text-[#FFCB3D]">
              DESTINATIONS
            </h4>
            <ul className="space-y-2.5 text-sm text-white/75">
              <li>
                <Link href="/plan" className="hover:text-white transition-colors">
                  Sajek &amp; Bandarban
                </Link>
              </li>
              <li>
                <Link href="/plan" className="hover:text-white transition-colors">
                  Sylhet &amp; Sreemangal
                </Link>
              </li>
              <li>
                <Link href="/plan" className="hover:text-white transition-colors">
                  Cox&apos;s Bazar &amp; St. Martin
                </Link>
              </li>
              <li>
                <Link href="/plan" className="hover:text-white transition-colors">
                  Khulna &amp; Sundarbans
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Plan */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.12em] text-[#FFCB3D]">
              ADVISORY NOTE
            </h4>
            <p className="text-xs leading-relaxed text-white/65">
              All fares, room rates, and weather indices are regional estimates in BDT. Verify live
              schedules before departure.
            </p>
            <Link
              href="/plan"
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20 transition-colors"
            >
              <span>Launch Planner</span>
              <ArrowRight className="h-3.5 w-3.5 text-[#FFCB3D]" />
            </Link>
          </div>
        </div>

        {/* Giant Watermark */}
        <div className="pointer-events-none select-none pt-6 text-center text-[72px] sm:text-[130px] lg:text-[180px] font-black leading-[0.85] tracking-[-0.05em] text-white opacity-[0.06]">
          VROMON
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 text-xs text-white/50">
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
