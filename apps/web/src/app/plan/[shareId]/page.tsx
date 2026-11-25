'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Calendar, Clock, MapPin, ShieldCheck } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { FeasibilityBadge } from '@/components/FeasibilityBadge';
import { ScoreRing } from '@/components/ScoreRing';

export default function SharedPlanPage() {
  const params = useParams();
  const shareId = params.shareId as string;

  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch(`/shared-plans/${shareId}`)
      .then(setPlan)
      .catch((err: any) => setError(err.message || 'Shared plan unavailable or expired.'))
      .finally(() => setLoading(false));
  }, [shareId]);

  if (loading) {
    return <div className="mx-auto max-w-4xl p-16 text-center text-sm">Loading shared itinerary...</div>;
  }

  if (error || !plan) {
    return (
      <div className="mx-auto max-w-xl p-16 text-center space-y-4">
        <h1 className="text-2xl font-extrabold text-vromon-dark">Shared Plan Unavailable</h1>
        <p className="text-sm text-vromon-muted">{error}</p>
        <Link href="/plan" className="inline-flex rounded-full bg-vromon-primary px-6 py-2.5 text-sm font-bold text-white">
          Plan Your Own Trip
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-10 space-y-8">
      <div className="rounded-[28px] bg-white p-6 sm:p-8 shadow-ambient border border-vromon-pill">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-vromon-pill px-3 py-1 text-xs font-bold text-vromon-deep">
                <ShieldCheck className="h-3.5 w-3.5" /> 30-Day Ephemeral Share
              </span>
              <FeasibilityBadge status={plan.feasibility_status} />
            </div>

            <h1 className="text-3xl font-extrabold text-vromon-dark">
              {plan.days}-Day Plan: {plan.destination_name}{' '}
              {plan.destination_name_bn ? `(${plan.destination_name_bn})` : ''}
            </h1>
            <p className="flex items-center gap-1.5 text-sm text-vromon-muted">
              <MapPin className="h-4 w-4 text-vromon-primary" />
              <span>
                {plan.district}, {plan.division} • From {plan.starting_city} • {plan.travelers}{' '}
                Traveler(s)
              </span>
            </p>
          </div>

          <ScoreRing score={plan.final_score} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3 rounded-2xl bg-vromon-leaf p-4 border border-vromon-pill text-sm">
          <div>
            <span className="text-xs font-semibold text-vromon-muted block">Target Budget</span>
            <strong className="text-vromon-dark">৳{plan.budget.toLocaleString()}</strong>
          </div>
          <div>
            <span className="text-xs font-semibold text-vromon-muted block">Estimated Total Cost</span>
            <strong className="text-vromon-deep">৳{plan.total_cost.toLocaleString()}</strong>
          </div>
          <div>
            <span className="text-xs font-semibold text-vromon-muted block">Expires On</span>
            <strong className="text-vromon-dark">
              {new Date(plan.expires_at).toLocaleDateString()}
            </strong>
          </div>
        </div>
      </div>

      {/* Days */}
      <div className="space-y-6">
        {(plan.itinerary?.days || []).map((day: any) => (
          <div
            key={day.day_number}
            className="rounded-[28px] bg-white p-6 shadow-soft border border-vromon-pill space-y-4"
          >
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-vromon-dark">
              <Calendar className="h-5 w-5 text-vromon-primary" />
              <span>
                Day {day.day_number}: {day.title}
              </span>
            </h2>
            <div className="space-y-3">
              {(day.slots || []).map((slot: any, idx: number) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-2xl bg-vromon-leaf p-4 border border-vromon-pill"
                >
                  <div>
                    <span className="rounded-full bg-vromon-amber px-2.5 py-0.5 text-[11px] font-bold text-vromon-dark">
                      {slot.time_of_day}
                    </span>
                    <h3 className="mt-1 text-sm font-bold text-vromon-dark">{slot.activity_name}</h3>
                    <p className="text-xs text-vromon-muted">{slot.description}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-bold text-vromon-deep shrink-0">
                    <Clock className="h-3.5 w-3.5" /> {slot.hours}h
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
