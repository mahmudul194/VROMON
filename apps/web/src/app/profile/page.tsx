'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  KeyRound,
  Loader2,
  LogOut,
  MapPin,
  Shield,
  SlidersHorizontal,
  User,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const CITIES = [
  'Dhaka',
  'Chattogram',
  'Sylhet',
  'Rajshahi',
  'Khulna',
  'Barishal',
  'Rangpur',
  'Mymensingh',
];

export default function ProfilePage() {
  const { user, loading, refreshUser, logout } = useAuth();
  const [name, setName] = useState('');
  const [preferredCity, setPreferredCity] = useState('Dhaka');
  const [budgetTier, setBudgetTier] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [section, setSection] = useState<'profile' | 'preferences' | 'security'>('profile');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPreferredCity(user.preferred_city || 'Dhaka');
      setBudgetTier((user.budget_tier as any) || 'Medium');
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await apiFetch('/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          name,
          preferred_city: preferredCity,
          budget_tier: budgetTier,
        }),
      });
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#2F6B2F]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md space-y-4 p-16 text-center">
        <h1 className="text-2xl font-extrabold text-[#1F2A1F]">Sign in required</h1>
        <Link
          href="/login"
          className="inline-flex rounded-full bg-[#2F6B2F] px-6 py-2.5 text-sm font-bold text-white"
        >
          Log in
        </Link>
      </div>
    );
  }

  const initials = user.name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="mx-auto max-w-[1060px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-7 md:grid-cols-12">
        {/* Stitch 14_profile Left Sidebar */}
        <aside className="space-y-4 md:col-span-4">
          <div className="rounded-[26px] border border-[#D5E6CF]/70 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#2F6B2F] text-lg font-black text-[#FFCB3D]">
                {initials}
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-lg font-extrabold text-[#1F2A1F]">{user.name}</h1>
                <p className="truncate text-xs text-[#557945]">{user.email}</p>
                <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#eaf7e6] px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-[#2F6B2F]">
                  <Shield className="h-2.5 w-2.5" /> {user.role}
                </span>
              </div>
            </div>

            <nav className="mt-6 space-y-1.5">
              {[
                { id: 'profile', label: 'Public Profile', icon: User },
                { id: 'preferences', label: 'Travel & AI Defaults', icon: SlidersHorizontal },
                { id: 'security', label: 'Account Security', icon: KeyRound },
              ].map((item) => {
                const Icon = item.icon;
                const active = section === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSection(item.id as any)}
                    className={`flex w-full items-center gap-2.5 rounded-2xl px-4 py-2.5 text-xs font-bold transition ${
                      active
                        ? 'bg-[#2F6B2F] text-white shadow-sm'
                        : 'text-[#557945] hover:bg-[#F6FAF3] hover:text-[#1F2A1F]'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Right Stacked Stitch Settings Cards */}
        <div className="space-y-6 md:col-span-8">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Public Profile Card */}
            <div className="rounded-[26px] border border-[#D5E6CF]/70 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-lg font-extrabold text-[#1F2A1F]">Public Profile</h2>
              <p className="mt-0.5 text-xs text-[#557945]">
                Customize how VROMON greets and personalizes trip snapshots for you.
              </p>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#557945]">
                    Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 w-full rounded-full border border-[#D5E6CF] bg-[#eaf7e6]/70 px-5 text-sm font-medium text-[#1F2A1F] focus:border-[#2F6B2F] focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#557945]">
                    Verified Email
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="h-12 w-full rounded-full border border-[#E5F0E0] bg-[#F6FAF3] px-5 text-sm text-[#557945]"
                  />
                </div>
              </div>
            </div>

            {/* Travel & AI Preferences Card */}
            <div className="rounded-[26px] border border-[#D5E6CF]/70 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-lg font-extrabold text-[#1F2A1F]">Travel &amp; AI Preferences</h2>
              <p className="mt-0.5 text-xs text-[#557945]">
                Used as default origin hub and accommodation tier in trip evaluations.
              </p>

              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#557945]">
                    <MapPin className="h-3.5 w-3.5 text-[#2F6B2F]" />
                    Default Starting Hub
                  </label>
                  <select
                    value={preferredCity}
                    onChange={(e) => setPreferredCity(e.target.value)}
                    className="h-12 w-full rounded-full border border-[#D5E6CF] bg-[#eaf7e6]/70 px-5 text-sm font-bold text-[#1F2A1F] focus:border-[#2F6B2F] focus:bg-white focus:outline-none"
                  >
                    {CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#557945]">
                    Comfort Budget Style
                  </label>
                  <div className="grid h-12 grid-cols-3 gap-1.5 rounded-full border border-[#D5E6CF] bg-[#F6FAF3] p-1">
                    {(['Low', 'Medium', 'High'] as const).map((tier) => (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => setBudgetTier(tier)}
                        className={`rounded-full text-xs font-bold transition ${
                          budgetTier === tier
                            ? 'bg-[#2F6B2F] text-white shadow-sm'
                            : 'text-[#557945] hover:text-[#1F2A1F]'
                        }`}
                      >
                        {tier}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#E5F0E0] pt-5">
                {saved ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2F6B2F]">
                    <CheckCircle2 className="h-4 w-4" /> Changes saved to your profile
                  </span>
                ) : (
                  <span className="text-xs text-[#557945]">Preferences sync across web sessions</span>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-[#2F6B2F] px-6 text-xs font-bold text-white shadow-sm hover:bg-[#145219] disabled:opacity-60"
                >
                  {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Save Preferences
                </button>
              </div>
            </div>
          </form>

          {/* Security Card */}
          <div className="flex flex-col justify-between gap-4 rounded-[26px] border border-[#D5E6CF]/70 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:p-8">
            <div>
              <h2 className="text-lg font-extrabold text-[#1F2A1F]">Password &amp; Session</h2>
              <p className="mt-0.5 text-xs text-[#557945]">
                Reset your password via 6-digit email OTP or sign out of this browser.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href="/forgot-password"
                className="inline-flex h-10 items-center gap-1.5 rounded-full border border-[#D5E6CF] bg-[#F6FAF3] px-4 text-xs font-bold text-[#1F2A1F] hover:bg-[#eaf7e6]"
              >
                <KeyRound className="h-3.5 w-3.5 text-[#2F6B2F]" />
                Reset Password
              </Link>
              <button
                type="button"
                onClick={logout}
                className="inline-flex h-10 items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-4 text-xs font-bold text-red-700 hover:bg-red-100"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
