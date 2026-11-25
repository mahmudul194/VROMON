'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Bookmark, Compass, Loader2, MapPin, Plus, Trash2 } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { FeasibilityBadge } from '@/components/FeasibilityBadge';
import { ScoreRing } from '@/components/ScoreRing';

export default function TripsPage() {
  const { user, loading: authLoading } = useAuth();
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('All');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    apiFetch<any[]>('/trips')
      .then(setTrips)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const handleDelete = async (id: string) => {
    await apiFetch(`/trips/${id}`, { method: 'DELETE' });
    setTrips((prev) => prev.filter((t) => t.id !== id));
  };

  const metrics = useMemo(() => {
    const fitsCount = trips.filter((t) => t.recommendation_snapshot?.feasibility_status === 'Fits').length;
    const costs = trips
      .map((t) => Number(t.recommendation_snapshot?.cost_breakdown?.total_cost || 0))
      .filter((n) => n > 0);
    const avgCost = costs.length ? Math.round(costs.reduce((a, b) => a + b, 0) / costs.length) : 0;
    return { total: trips.length, fitsCount, avgCost };
  }, [trips]);

  const filteredTrips = useMemo(() => {
    if (statusFilter === 'All') return trips;
    return trips.filter((t) => t.recommendation_snapshot?.feasibility_status === statusFilter);
  }, [trips, statusFilter]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#2F6B2F]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-xl space-y-4 p-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#eaf7e6] text-[#2F6B2F]">
          <Bookmark className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#1F2A1F]">Sign in to view Saved Trips</h1>
        <p className="text-sm text-[#557945]">
          Save evaluated trip recommendations to compare budgets and revisit routes anytime.
        </p>
        <Link
          href="/login"
          className="inline-flex rounded-full bg-[#2F6B2F] px-6 py-2.5 text-sm font-bold text-white"
        >
          Log in
        </Link>
      </div>
    );
  }

  const firstName = user.name.split(' ')[0] || 'Traveler';

  return (
    <div className="mx-auto max-w-[1220px] space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header (No Waving Emoji) */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="inline-block rounded-full bg-[#eaf7e6] px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#2F6B2F]">
            Expedition Registry
          </span>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#1F2A1F] sm:text-4xl">
            Hi {firstName}, your saved trips
          </h1>
          <p className="mt-1 text-sm text-[#557945]">
            Reopen any evaluated Bangladesh route, adjust parameters, or launch day-by-day plans.
          </p>
        </div>

        <Link
          href="/plan"
          className="inline-flex h-11 items-center gap-2 self-start rounded-full bg-[#2F6B2F] px-5 text-xs font-bold text-white shadow-sm hover:bg-[#145219] sm:self-auto"
        >
          <Plus className="h-4 w-4 text-[#FFCB3D]" />
          Plan New Trip
        </Link>
      </div>

      {/* Stitch 12_trips 3 KPI Cards (Dark, Amber, White) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-[24px] bg-gradient-to-br from-[#235425] to-[#145219] p-6 text-white shadow-md">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#D5E6CF]">
            Saved Expeditions
          </p>
          <p className="mt-2 text-4xl font-black text-white">{metrics.total}</p>
          <p className="mt-1 text-xs text-[#D5E6CF]">Synced across your traveler account</p>
        </div>

        <div className="rounded-[24px] bg-[#FFCB3D] p-6 text-[#1F2A1F] shadow-sm">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#1F2A1F]/75">
            Fits Budget Tier
          </p>
          <p className="mt-2 text-4xl font-black">{metrics.fitsCount}</p>
          <p className="mt-1 text-xs font-semibold text-[#1F2A1F]/80">
            Routes comfortably inside target ceiling
          </p>
        </div>

        <div className="rounded-[24px] border border-[#D5E6CF] bg-white p-6 shadow-sm">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#557945]">
            Avg Estimated Budget
          </p>
          <p className="mt-2 text-4xl font-black text-[#2F6B2F]">
            ৳{metrics.avgCost.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-[#557945]">Includes transport, rooms, meals &amp; buffer</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {['All', 'Fits', 'Tight', 'Over budget'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setStatusFilter(tab)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
              statusFilter === tab
                ? 'bg-[#2F6B2F] text-white shadow-sm'
                : 'border border-[#D5E6CF] bg-white text-[#557945] hover:bg-[#eaf7e6]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Saved Trips Grid */}
      {filteredTrips.length === 0 ? (
        <div className="space-y-4 rounded-[28px] border border-[#D5E6CF] bg-white p-12 text-center shadow-sm">
          <Compass className="mx-auto h-10 w-10 text-[#5D9253]" />
          <p className="text-lg font-extrabold text-[#1F2A1F]">No trips in this view yet</p>
          <p className="mx-auto max-w-md text-sm text-[#557945]">
            Run an evaluation in Trip Planner and click Save on any destination card.
          </p>
          <Link
            href="/plan"
            className="inline-flex items-center gap-2 rounded-full bg-[#2F6B2F] px-5 py-2.5 text-xs font-bold text-white"
          >
            Start Planning <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTrips.map((trip) => {
            const snap = trip.recommendation_snapshot || {};
            const qp = trip.query_params || {};
            const score = snap.scores?.final_score;
            const totalCost = snap.cost_breakdown?.total_cost;
            return (
              <div
                key={trip.id}
                className="flex flex-col justify-between overflow-hidden rounded-[26px] border border-[#D5E6CF]/70 bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="relative h-44 bg-[#E5F0E0]">
                  <img
                    src={
                      trip.destination?.image_url ||
                      snap.image_url ||
                      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80'
                    }
                    alt={trip.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1F2A1F]/70 via-transparent to-transparent" />
                  {snap.feasibility_status && (
                    <div className="absolute left-3.5 top-3.5">
                      <FeasibilityBadge status={snap.feasibility_status} />
                    </div>
                  )}
                  {typeof score === 'number' && (
                    <div className="absolute right-3.5 top-3.5 rounded-2xl bg-white/95 p-1 shadow">
                      <ScoreRing score={score} size={46} />
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col justify-between space-y-4 p-5">
                  <div>
                    <h3 className="text-lg font-extrabold text-[#1F2A1F]">{trip.title}</h3>
                    <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-[#557945]">
                      <MapPin className="h-3.5 w-3.5 text-[#2F6B2F]" />
                      <span>
                        {trip.destination?.district || snap.district},{' '}
                        {trip.destination?.division?.name || snap.division}
                      </span>
                    </p>
                    {totalCost && (
                      <p className="mt-2 text-sm font-black text-[#2F6B2F]">
                        Est. Total: ৳{Number(totalCost).toLocaleString()}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-[#E5F0E0] pt-3.5">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/destinations/${trip.destination_id}`}
                        className="rounded-full bg-[#eaf7e6] px-3.5 py-1.5 text-xs font-bold text-[#2F6B2F] hover:bg-[#D5E6CF]"
                      >
                        Details
                      </Link>
                      {totalCost && (
                        <Link
                          href={`/itinerary?destId=${trip.destination_id}&days=${qp.days || 2}&usable=${snap.usable_hours || 14}&totalCost=${totalCost}&status=${encodeURIComponent(snap.feasibility_status || 'Fits')}&score=${score || 85}&budget=${qp.budget || totalCost}&travelers=${qp.travelers || 2}&month=${qp.travel_month || 12}&city=${encodeURIComponent(qp.starting_city || 'Dhaka')}`}
                          className="rounded-full bg-[#2F6B2F] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#145219]"
                        >
                          Itinerary
                        </Link>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(trip.id)}
                      aria-label="Delete saved trip"
                      className="rounded-full p-2 text-[#557945] hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
