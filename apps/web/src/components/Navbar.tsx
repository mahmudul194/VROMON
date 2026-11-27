'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowRight, ArrowUpRight, Lock, LogOut, Menu, ShieldCheck, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, logoutModalOpen, openLogoutModal, closeLogoutModal } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLanding = pathname === '/';
  const isAdminRoute = pathname?.startsWith('/admin');

  const navLinks = isLanding
    ? [
        { href: '/#features', label: 'Features' },
        { href: '/#how-it-works', label: 'How it works' },
        { href: '/plan', label: 'Destinations' },
        { href: '/compare', label: 'Compare' },
        ...(user ? [{ href: '/trips', label: 'My Trips' }] : []),
      ]
    : [
        { href: '/plan', label: 'Plan' },
        { href: '/results', label: 'Results' },
        { href: '/compare', label: 'Compare' },
        ...(user ? [{ href: '/trips', label: 'My Trips' }] : []),
      ];

  useEffect(() => {
    if (!logoutModalOpen && !mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeLogoutModal();
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [logoutModalOpen, mobileOpen, closeLogoutModal]);

  const requestLogout = () => {
    setMobileOpen(false);
    openLogoutModal();
  };

  const confirmLogout = () => {
    logout();
    router.push('/logged-out');
  };

  const initial = user?.name?.trim().charAt(0).toUpperCase() || 'V';

  if (isAdminRoute) {
    return null;
  }

  return (
    <header
      className={
        isLanding
          ? 'fixed left-0 right-0 top-0 z-50 w-full px-4 pt-5 sm:px-6'
          : 'sticky top-0 z-50 w-full px-4 pt-4 sm:px-6'
      }
    >
      <nav className="glass-surface mx-auto flex h-[70px] max-w-[1180px] items-center justify-between rounded-full px-4 pl-5 shadow-[0_20px_60px_rgba(31,42,31,0.10)]">
        {/* Left: Standalone Full Horizontal Logo (no extra text) */}
        <Link href="/" className="flex shrink-0 items-center py-1">
          <img
            src="/vromon_logo.png"
            alt="VROMON"
            className="h-10 w-auto object-contain sm:h-11"
          />
        </Link>

        {/* Center Navigation Pills */}
        <div className="hidden items-center gap-1.5 md:flex">
          {navLinks.map((link) => {
            const active =
              link.href === pathname ||
              (link.href === '/#features' && pathname === '/');
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-[15px] font-medium transition-all ${
                  active
                    ? 'bg-[#E5F0E0] font-semibold text-[#2F6B2F]'
                    : 'text-[#1F2A1F] hover:bg-white/70'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right Actions */}
        <div className="hidden shrink-0 items-center gap-4 md:flex">
          {user ? (
            <div className="flex items-center gap-2.5">
              <Link
                href="/profile"
                className="flex h-11 items-center gap-2.5 rounded-full border border-[#D5E6CF] bg-[#F6FAF3] pl-3.5 pr-1.5 text-[13px] font-semibold uppercase tracking-[0.06em] text-[#1F2A1F] transition-colors hover:bg-[#E5F0E0]"
              >
                <span className="max-w-[110px] truncate">{user.name.split(' ')[0]}</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFCB3D] font-extrabold text-[#1F2A1F]">
                  {initial}
                </span>
              </Link>
              <button
                type="button"
                onClick={requestLogout}
                title="Sign out"
                aria-label="Sign out"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D5E6CF] bg-white text-[#41493E] transition-colors hover:bg-[#FFF6D6] hover:text-[#9A6B00]"
              >
                <LogOut className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="whitespace-nowrap px-3 py-2 text-[15px] font-semibold text-[#1F2A1F] hover:opacity-75"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="group inline-flex h-12 items-center gap-3.5 whitespace-nowrap rounded-full bg-[#2F6B2F] pl-5 pr-2 text-[15px] font-semibold text-white shadow-[0_8px_24px_rgba(47,107,47,0.24)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(47,107,47,0.32)]"
              >
                <span>Get started</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFCB3D] text-[#1F2A1F] transition-transform group-hover:translate-x-0.5">
                  <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                </span>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle Menu"
          aria-expanded={mobileOpen}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E5F0E0] text-[#1F2A1F] md:hidden"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* #38 Stitch Editorial Mobile Navigation Sheet */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-[#1F2A1F]/40 backdrop-blur-sm md:hidden">
          <button
            type="button"
            aria-label="Close navigation backdrop"
            onClick={() => setMobileOpen(false)}
            className="flex h-12 w-full items-center justify-center"
          >
            <span className="h-1.5 w-12 rounded-full bg-white/60" />
          </button>

          <div className="flex max-h-[90vh] w-full flex-col overflow-y-auto rounded-t-[32px] bg-white px-5 pb-7 pt-6 shadow-2xl">
            {/* Sheet Header */}
            <div className="flex items-center justify-between pb-2">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="flex items-center"
              >
                <img
                  src="/vromon_logo.png"
                  alt="VROMON"
                  className="h-10 w-auto object-contain"
                />
              </Link>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close Menu"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EAF7E6] text-[#1F2A1F] shadow-sm active:scale-95"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Numbered Magazine Editorial Navigation List */}
            <nav className="flex flex-col space-y-4 pt-6">
              {navLinks.map((link, idx) => {
                const active =
                  link.href === pathname ||
                  (link.href === '/#features' && pathname === '/');
                const num = String(idx + 1).padStart(2, '0');
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="group flex min-h-[44px] items-baseline justify-between py-1"
                  >
                    <div className="flex items-baseline gap-3.5">
                      <span
                        className={`text-[13px] font-semibold uppercase tracking-[0.06em] ${
                          active ? 'text-[#145219]' : 'text-[#145219]/45'
                        }`}
                      >
                        {num}
                      </span>
                      <span
                        className={`text-[28px] font-extrabold leading-tight tracking-tight transition-colors ${
                          active
                            ? 'text-[#145219]'
                            : 'text-[#1F2A1F] group-hover:text-[#2F6B2F]'
                        }`}
                      >
                        {link.label}
                      </span>
                    </div>
                    <span
                      className={`h-3 w-3 -translate-y-1.5 rounded-full bg-[#FFCB3D] transition-opacity ${
                        active ? 'opacity-100 shadow-sm' : 'opacity-0 group-hover:opacity-100'
                      }`}
                    />
                  </Link>
                );
              })}
            </nav>

            {/* Editorial Accent Pill Row */}
            <div className="flex items-center gap-2 overflow-x-auto pb-5 pt-6">
              <div className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#EAF7E6] px-4 py-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#FFCB3D]" />
                <span className="text-[14px] font-medium text-[#41493E]">AI Trip Engine</span>
              </div>
              <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#DFECDB] px-3.5 py-2">
                <ShieldCheck className="h-4 w-4 text-[#145219]" />
                <span className="text-[14px] font-semibold text-[#145219]">64 Districts</span>
              </div>
            </div>

            {/* Curated Journey Preview Card */}
            <Link
              href="/plan"
              onClick={() => setMobileOpen(false)}
              className="mb-6 flex items-center justify-between rounded-2xl bg-[#EAF7E6] p-3.5 transition hover:bg-[#D5E6CF]"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[#D5E6CF] shadow-sm">
                  <img
                    src="/images/destinations/sreemangal.jpg"
                    alt="Sreemangal Tea Gardens"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[#145219]">
                    Curated Journey
                  </span>
                  <span className="truncate text-[15px] font-bold text-[#1F2A1F]">
                    Tea Terraces in Sreemangal
                  </span>
                </div>
              </div>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#145219] shadow-sm">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </Link>

            {/* Bottom Actions */}
            {user ? (
              <div className="mt-auto flex flex-col gap-3">
                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex h-14 items-center justify-between rounded-full bg-[#EAF7E6] px-5 text-[15px] font-bold text-[#1F2A1F]"
                >
                  <span className="truncate">{user.name}</span>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FFCB3D] text-[14px] font-extrabold text-[#1F2A1F]">
                    {initial}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={requestLogout}
                  className="flex h-14 items-center justify-center gap-2 rounded-full border border-[#D5E6CF] bg-white text-[15px] font-bold text-[#1F2A1F]"
                >
                  <LogOut className="h-4 w-4 text-[#9A6B00]" />
                  <span>Log out</span>
                </button>
              </div>
            ) : (
              <div className="mt-auto flex flex-col gap-3">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex h-14 w-full items-center justify-center rounded-full bg-[#EAF7E6] text-[16px] font-bold text-[#1F2A1F] shadow-sm"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex h-14 w-full items-center justify-between rounded-full bg-[#2F6B2F] pl-6 pr-2.5 text-[16px] font-bold text-white shadow-lg"
                >
                  <span>Get started</span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFCB3D] text-[#1F2A1F] shadow-sm">
                    <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                  </span>
                </Link>
              </div>
            )}

            <div className="flex justify-center pt-5">
              <div className="h-1 w-28 rounded-full bg-[#D5E6CF]" />
            </div>
          </div>
        </div>
      )}

      {/* #36 (Desktop Modal) & #58 (Mobile Bottom Sheet) Logout Confirmation */}
      {logoutModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-confirm-title"
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#1F2A1F]/40 backdrop-blur-md md:items-center md:p-4"
        >
          <div className="relative flex w-full flex-col items-center rounded-t-[32px] border border-[#1F2A1F]/10 bg-white px-6 pb-5 pt-3 text-center shadow-[0_20px_60px_rgba(31,42,31,0.18)] md:max-w-[440px] md:rounded-[32px] md:p-10">
            {/* Mobile Drag Handle */}
            <div className="mb-5 mt-1 h-[5px] w-9 rounded-full bg-[#C1C9BB] md:hidden" />

            {/* Desktop Close (X) Button */}
            <button
              type="button"
              onClick={closeLogoutModal}
              aria-label="Close modal"
              className="absolute right-6 top-6 hidden h-9 w-9 items-center justify-center rounded-full text-[#41493E] transition hover:bg-[#DFECDB] hover:text-[#1F2A1F] md:flex"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Amber Door/Arrow Logout Icon */}
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#FFF6D6]">
              <LogOut className="h-8 w-8 text-[#9A6B00]" strokeWidth={1.75} />
            </div>

            <h2
              id="logout-confirm-title"
              className="text-[26px] font-bold leading-[32px] tracking-tight text-[#1F2A1F] md:text-[28px] md:leading-[34px]"
            >
              Log out of VROMON?
            </h2>

            <p className="mb-7 mt-2.5 max-w-[310px] text-[16px] leading-relaxed text-[#41493E]">
              Your saved trips and searches will be here when you come back.
            </p>

            {/* Button Stack */}
            <div className="flex w-full flex-col gap-3">
              <button
                type="button"
                onClick={confirmLogout}
                className="group relative flex h-14 w-full items-center justify-between rounded-full bg-[#2F6B2F] pl-8 pr-3 text-[16px] font-semibold text-white shadow-[0_12px_32px_rgba(47,107,47,0.22)] transition hover:bg-[#145219]"
              >
                <span className="flex-1 text-center">Log out</span>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFCB3D] text-[#1F2A1F] transition-transform group-hover:translate-x-0.5">
                  <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
                </span>
              </button>

              <button
                type="button"
                onClick={closeLogoutModal}
                className="flex h-14 w-full items-center justify-center rounded-full bg-[#EAF7E6] text-[16px] font-semibold text-[#1F2A1F] transition hover:bg-[#D5E6CF] md:border-[1.5px] md:border-[#1F2A1F] md:bg-transparent md:hover:bg-black/5"
              >
                Stay logged in
              </button>
            </div>

            {/* Mobile Reassurance Micro-Copy */}
            <div className="mt-4 flex items-center justify-center gap-1.5 text-[#557945] md:hidden">
              <Lock className="h-3.5 w-3.5" />
              <span className="text-[13px] font-semibold uppercase tracking-[0.06em]">
                Encrypted Session Data Preserved
              </span>
            </div>

            <div className="flex w-full justify-center pb-1 pt-3 md:hidden">
              <div className="h-[5px] w-[134px] rounded-full bg-[#1F2A1F]/20" />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
