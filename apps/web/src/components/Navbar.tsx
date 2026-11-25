'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowRight, Compass, LogOut, Menu, ShieldCheck, User, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/plan', label: 'Plan Trip' },
    { href: '/compare', label: 'Compare' },
    ...(user ? [{ href: '/trips', label: 'My Trips' }] : []),
    ...(user?.role === 'ADMIN' ? [{ href: '/admin', label: 'Admin' }] : []),
  ];

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full px-4 pt-3 sm:px-6 lg:px-10">
      <nav className="glass-surface mx-auto flex max-w-7xl items-center justify-between rounded-full px-4 py-2.5 shadow-soft sm:px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <img
            src="/vromon_logo.png"
            alt="VROMON Logo"
            className="h-9 w-9 rounded-full object-cover border border-vromon-pill"
          />
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-tight text-vromon-deep leading-none">
              VROMON
            </span>
            <span className="text-[11px] font-medium tracking-wider uppercase text-vromon-olive leading-tight">
              Travel Planner
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? 'bg-vromon-pill text-vromon-deep'
                    : 'text-vromon-muted hover:bg-vromon-leaf hover:text-vromon-dark'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Desktop Right Actions */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {user ? (
            <>
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-full bg-vromon-leaf border border-vromon-border/60 px-3.5 py-2 text-sm font-medium text-vromon-dark hover:bg-vromon-pill transition-colors"
              >
                {user.role === 'ADMIN' ? (
                  <ShieldCheck className="h-4 w-4 text-vromon-primary" strokeWidth={1.75} />
                ) : (
                  <User className="h-4 w-4 text-vromon-primary" strokeWidth={1.75} />
                )}
                <span className="max-w-[130px] truncate">{user.name}</span>
              </Link>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-vromon-border/70 bg-white text-vromon-muted hover:bg-red-50 hover:text-vromon-danger transition-colors"
              >
                <LogOut className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full px-4 py-2 text-sm font-semibold text-vromon-dark hover:bg-vromon-pill transition-colors"
            >
              Sign In
            </Link>
          )}

          <Link
            href="/plan"
            className="group inline-flex h-11 items-center gap-3 rounded-full bg-vromon-primary pl-5 pr-2 text-sm font-semibold text-white transition-all hover:bg-vromon-deep shadow-sm"
          >
            <span>Plan trip</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-vromon-amber text-vromon-dark transition-transform group-hover:translate-x-0.5">
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.2} />
            </span>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle Menu"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-vromon-leaf text-vromon-dark md:hidden"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="mx-auto mt-2 max-w-7xl rounded-3xl bg-white p-5 shadow-ambient border border-vromon-border/40 md:hidden">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
                  pathname === link.href
                    ? 'bg-vromon-pill text-vromon-deep'
                    : 'text-vromon-dark hover:bg-vromon-leaf'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <hr className="my-2 border-vromon-pill" />
            {user ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-vromon-dark hover:bg-vromon-leaf"
                >
                  <User className="h-4 w-4 text-vromon-primary" />
                  <span>{user.name} (Profile)</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-vromon-danger hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="rounded-2xl bg-vromon-pill px-4 py-3 text-center text-sm font-semibold text-vromon-deep"
              >
                Sign In / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
