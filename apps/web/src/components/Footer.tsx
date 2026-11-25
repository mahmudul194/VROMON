import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-20 bg-vromon-dark text-[#e7f5e3]">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/vromon_logo.png"
                alt="VROMON Logo"
                className="h-10 w-10 rounded-full object-cover border border-white/20"
              />
              <div>
                <p className="text-lg font-extrabold tracking-tight text-white">VROMON</p>
                <p className="text-xs uppercase tracking-widest text-[#95d68e]">
                  Bangladesh Smart Travel Advisor
                </p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-[#c1c9bb] max-w-sm">
              Feasibility-first trip recommendations across all 64 districts of Bangladesh. Powered
              by deterministic cost math, seasonal climate awareness, and grounded AI.
            </p>
          </div>

          <div className="md:col-span-3 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-vromon-amber">
              Platform
            </p>
            <ul className="space-y-2.5 text-sm text-[#c1c9bb]">
              <li>
                <Link href="/plan" className="hover:text-white transition-colors">
                  Plan a Trip
                </Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-white transition-colors">
                  Compare Destinations
                </Link>
              </li>
              <li>
                <Link href="/trips" className="hover:text-white transition-colors">
                  My Saved Trips
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Sign In / Register
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-vromon-amber">
              Advisory Notice
            </p>
            <p className="text-xs leading-relaxed text-[#c1c9bb]">
              All transport fares, accommodation rates, and weather indices are regional planning
              estimates in BDT. Verify live schedules and pricing before departure.
            </p>
            <p className="pt-2 text-xs text-[#71796d]">
              SE331 Software Engineering Design Capstone — Group 6
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
