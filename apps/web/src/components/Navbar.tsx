'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowRight, LogOut, Menu, ShieldCheck, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);

  const isLanding = pathname === '/';

  const navLinks = isLanding
    ? [
        { href: '/#features', label: 'Features' },
        { href: '/#how-it-works', label: 'How it works' },
        { href: '/plan', label: 'Destinations' },
        { href: '/compare', label: 'Compare' },
        ...(user ? [{ href: '/trips', label: 'My Trips' }] : []),
        ...(user?.role === 'ADMIN' ? [{ href: '/admin', label: 'Admin' }] : []),
      ]
    : [
        { href: '/plan', label: 'Plan' },
        { href: '/results', label: 'Results' },
        { href: '/compare', label: 'Compare' },
        ...(user ? [{ href: '/trips', label: 'My Trips' }] : []),
        ...(user?.role === 'ADMIN' ? [{ href: '/admin', label: 'Admin' }] : []),
      ];

  const requestLogout = () => {
    setMobileOpen(false);
    setConfirmLogoutOpen(true);
  };

  const confirmLogout = () => {
    setConfirmLogoutOpen(false);
    logout();
    router.push('/login');
  };

  const initial = user?.name?.trim().charAt(0).toUpperCase() || 'V';

  return (
    <header
      className={
        isLanding
          ? 'fixed top-0 left-0 right-0 z-50 w-full px-4 pt-5 sm:px-6'
          : 'sticky top-0 z-50 w-full px-4 pt-4 sm:px-6'
      }
    >
      <nav className="glass-surface mx-auto flex h-[70px] max-w-[1180px] items-center justify-between rounded-full px-4 pl-5 shadow-[0_20px_60px_rgba(31,42,31,0.10)]">
        {/* Left: Standalone Full Horizontal Logo (no extra text) */}
        <Link href="/" className="flex items-center shrink-0 py-1">
          <img
            src="/vromon_logo.png"
            alt="VROMON"
            className="h-10 sm:h-11 w-auto object-contain"
          />
        </Link>

        {/* Center Navigation Pills */}
        <div className="hidden md:flex items-center gap-1.5">
          {navLinks.map((link) => {
            const active =
              link.href === pathname ||
              (link.href === '/#features' && pathname === '/');
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 text-[15px] font-medium whitespace-nowrap transition-all ${
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
        <div className="hidden md:flex items-center gap-4 shrink-0">
          {user ? (
            <div className="flex items-center gap-2.5">
              <Link
                href="/profile"
                className="flex h-11 items-center gap-2.5 rounded-full bg-[#F6FAF3] border border-[#D5E6CF] pl-3.5 pr-1.5 text-[13px] font-semibold tracking-[0.06em] uppercase text-[#1F2A1F] hover:bg-[#E5F0E0] transition-colors"
              >
                {user.role === 'ADMIN' && (
                  <ShieldCheck className="h-3.5 w-3.5 text-[#2F6B2F]" />
                )}
                <span className="max-w-[110px] truncate">{user.name.split(' ')[0]}</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFCB3D] text-[#1F2A1F] font-extrabold">
                  {initial}
                </span>
              </Link>
              <button
                onClick={requestLogout}
                title="Sign out"
                aria-label="Sign out"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-[#D5E6CF] text-[#41493E] hover:bg-red-50 hover:text-[#c62828] transition-colors"
              >
                <LogOut className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3 py-2 text-[15px] font-semibold text-[#1F2A1F] hover:opacity-75 whitespace-nowrap"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="group inline-flex h-12 items-center gap-3.5 rounded-full bg-[#2F6B2F] pl-5 pr-2 text-[15px] font-semibold text-white shadow-[0_8px_24px_rgba(47,107,47,0.24)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(47,107,47,0.32)] whitespace-nowrap"
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
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle Menu"
          aria-expanded={mobileOpen}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E5F0E0] text-[#1F2A1F] md:hidden"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile Drawer (#38 Mobile Navigation Menu Open) */}
      {mobileOpen && (
        <div className="mx-auto mt-2.5 max-w-[1180px] rounded-[28px] border border-[#D5E6CF] bg-white p-4 shadow-[0_20px_60px_rgba(31,42,31,0.16)] md:hidden">
          <div className="flex flex-col gap-1.5">
            {navLinks.map((link) => {
              const active =
                link.href === pathname ||
                (link.href === '/#features' && pathname === '/');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex min-h-[44px] items-center rounded-2xl px-4 py-2.5 text-[15px] font-semibold transition-colors ${
                    active
                      ? 'bg-[#E5F0E0] text-[#2F6B2F]'
                      : 'text-[#1F2A1F] hover:bg-[#F6FAF3]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <hr className="my-2 border-[#E5F0E0]" />
            {user ? (
              <div className="flex flex-col gap-2">
                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex min-h-[48px] items-center justify-between rounded-2xl bg-[#F6FAF3] px-4 py-2.5 text-[14px] font-semibold text-[#1F2A1F] hover:bg-[#E5F0E0]"
                >
                  <span className="truncate">{user.name}</span>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFCB3D] text-[13px] font-extrabold text-[#1F2A1F]">
                    {initial}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={requestLogout}
                  className="flex min-h-[44px] items-center gap-2 rounded-2xl px-4 py-2.5 text-left text-[14px] font-semibold text-[#c62828] hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" strokeWidth={1.75} />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 pt-1">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex min-h-[44px] items-center justify-center rounded-full border border-[#D5E6CF] py-2.5 text-[14px] font-semibold text-[#1F2A1F]"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex min-h-[44px] items-center justify-center rounded-full bg-[#2F6B2F] py-2.5 text-[14px] font-semibold text-white"
                >
                  Get started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* #36 & #58 Logout Confirmation Modal (Desktop) & Bottom Sheet (Mobile) */}
      {confirmLogoutOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-confirm-title"
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#1F2A1F]/45 backdrop-blur-sm md:items-center md:px-4"
        >
          <div className="w-full rounded-t-[28px] border border-[#D5E6CF] bg-white p-6 shadow-[0_20px_60px_rgba(31,42,31,0.22)] md:max-w-md md:rounded-[28px] md:p-7">
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[#D5E6CF] md:hidden" />
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50 text-[#c62828]">
                <LogOut className="h-5 w-5" strokeWidth={2} />
              </div>
              <div className="space-y-1.5">
                <p className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[#557945]">
                  Account Sign Out
                </p>
                <h2
                  id="logout-confirm-title"
                  className="text-[22px] font-semibold text-[#1F2A1F]"
                >
                  Sign out of VROMON?
                </h2>
                <p className="text-[15px] font-normal text-[#41493E]">
                  You can sign back in anytime to access your saved trips and travel preferences.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2.5 md:flex-row md:justify-end">
              <button
                type="button"
                onClick={() => setConfirmLogoutOpen(false)}
                className="flex h-11 items-center justify-center rounded-full border border-[#D5E6CF] bg-[#F6FAF3] px-6 text-[14px] font-semibold text-[#1F2A1F] transition hover:bg-[#E5F0E0]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmLogout}
                className="flex h-11 items-center justify-center rounded-full bg-[#c62828] px-6 text-[14px] font-semibold text-white transition hover:opacity-95"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
