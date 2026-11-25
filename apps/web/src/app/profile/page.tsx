'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Loader2, Shield, User } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function ProfilePage() {
  const { user, loading, refreshUser } = useAuth();
  const [name, setName] = useState('');
  const [preferredCity, setPreferredCity] = useState('Dhaka');
  const [budgetTier, setBudgetTier] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-16 text-center text-sm">Loading profile...</div>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md p-16 text-center space-y-4">
        <h1 className="text-2xl font-extrabold text-vromon-dark">Sign in required</h1>
        <Link href="/login" className="inline-flex rounded-full bg-vromon-primary px-6 py-2.5 text-sm font-bold text-white">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="rounded-[28px] bg-white p-7 sm:p-9 shadow-ambient border border-vromon-pill space-y-6">
        <div className="flex items-center gap-4 border-b border-vromon-pill pb-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-vromon-pill text-vromon-deep">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-vromon-dark">{user.name}</h1>
            <p className="text-sm text-vromon-muted">{user.email}</p>
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-vromon-leaf px-2.5 py-0.5 text-xs font-bold text-vromon-primary">
              <Shield className="h-3 w-3" /> {user.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-vromon-muted">
              Display Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 w-full rounded-full border border-vromon-border/70 bg-vromon-leaf px-4 text-sm text-vromon-dark"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-vromon-muted">
                Default Starting City
              </label>
              <select
                value={preferredCity}
                onChange={(e) => setPreferredCity(e.target.value)}
                className="h-11 w-full rounded-full border border-vromon-border/70 bg-vromon-leaf px-4 text-sm font-semibold text-vromon-dark"
              >
                {['Dhaka', 'Chattogram', 'Sylhet', 'Rajshahi', 'Khulna', 'Barishal', 'Rangpur', 'Mymensingh'].map(
                  (c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-vromon-muted">
                Preferred Budget Tier
              </label>
              <select
                value={budgetTier}
                onChange={(e) => setBudgetTier(e.target.value as any)}
                className="h-11 w-full rounded-full border border-vromon-border/70 bg-vromon-leaf px-4 text-sm font-semibold text-vromon-dark"
              >
                <option value="Low">Budget Saver</option>
                <option value="Medium">Balanced</option>
                <option value="High">Comfort</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            {saved ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-vromon-accent">
                <CheckCircle2 className="h-4 w-4" /> Preferences saved
              </span>
            ) : (
              <span />
            )}
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-vromon-primary px-6 text-sm font-semibold text-white hover:bg-vromon-deep"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
