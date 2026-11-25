'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bookmark, MapPin, Trash2 } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { FeasibilityBadge } from '@/components/FeasibilityBadge';

export default function TripsPage() {
  const { user, loading: authLoading } = useAuth();
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (authLoading || loading) {
    return <div className="mx-auto max-w-5xl p-16 text-center text-sm">Loading saved trips...</div>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-xl p-16 text-center space-y-4">
        <Bookmark className="mx-auto h-10 w-10 text-vromon-olive" />
        <h1 className="text-2xl font-extrabold text-vromon-dark">Sign in to view My Trips</h1>
        <p className="text-sm text-vromon-muted">
          Save evaluated trip recommendations to compare and revisit anytime.
        </p>
        <Link href="/login" className="inline-flex rounded-full bg-vromon-primary px-6 py-2.5 text-sm font-bold text-white">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-vromon-dark">My Saved Trips</h1>
          <p className="text-sm text-vromon-muted">
            Trip plans saved by {user.name}
          </p>
        </div>
        <Link href="/plan" className="rounded-full bg-vromon-primary px-5 py-2.5 text-xs font-bold text-white hover:bg-vromon-deep">
          Plan New Trip
        </Link>
      </div>

      {trips.length === 0 ? (
        <div className="rounded-[28px] bg-white p-12 text-center shadow-soft border border-vromon-pill space-y-3">
          <p className="text-base font-bold text-vromon-dark">No saved trips yet</p>
          <p className="text-sm text-vromon-muted">
            Search for a trip and click Save on any recommendation card.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => {
            const snap = trip.recommendation_snapshot || {};
            return (
              <div
                key={trip.id}
                className="flex flex-col justify-between overflow-hidden rounded-[26px] bg-white shadow-soft border border-vromon-pill"
              >
                <div className="relative h-44 bg-vromon-pill">
                  <img
                    src={trip.destination?.image_url || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80'}
                    alt={trip.title}
                    className="h-full w-full object-cover"
                  />
                  {snap.feasibility_status && (
                    <div className="absolute top-3 left-3">
                      <FeasibilityBadge status={snap.feasibility_status} />
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col justify-between p-5 space-y-4">
                  <div>
                    <h3 className="text-lg font-extrabold text-vromon-dark">{trip.title}</h3>
                    <p className="mt-1 flex items-center gap-1 text-xs text-vromon-muted">
                      <MapPin className="h-3.5 w-3.5 text-vromon-primary" />
                      <span>
                        {trip.destination?.district}, {trip.destination?.division?.name}
                      </span>
                    </p>
                    {snap.cost_breakdown?.total_cost && (
                      <p className="mt-2 text-sm font-extrabold text-vromon-deep">
                        Est. Cost: ৳{snap.cost_breakdown.total_cost.toLocaleString()}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-vromon-pill pt-3">
                    <Link
                      href={`/destinations/${trip.destination_id}`}
                      className="text-xs font-bold text-vromon-primary hover:underline"
                    >
                      Open Details
                    </Link>
                    <button
                      onClick={() => handleDelete(trip.id)}
                      className="rounded-full p-2 text-vromon-muted hover:bg-red-50 hover:text-vromon-danger"
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
