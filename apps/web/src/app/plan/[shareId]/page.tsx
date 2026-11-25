'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowRight, Calendar, Clock, Loader2, MapPin, ShieldCheck, Sparkles } from 'lucide-react';
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
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#2F6B2F]" />
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="mx-auto max-w-xl space-y-4 p-16 text-center">
        <h1 className="text-[36px] md:text-[40px] font-extrabold text-[#1F2A1F]">Shared Plan Unavailable</h1>
        <p className="text-[16px] text-[#557945]">{error}</p>
        <Link
          href="/plan"
          className="inline-flex rounded-full bg-[#2F6B2F] px-6 py-2.5 text-[14px] font-bold text-white"
        >
          Plan Your Own Trip
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1160px] space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Stitch 13_shared Hero Card */}
      <div className="overflow-hidden rounded-[28px] border border-[#D5E6CF]/70 bg-white shadow-[0_18px_50px_-14px_rgba(31,42,31,0.12)]">
        <div className="bg-gradient-to-r from-[#235425] via-[#2F6B2F] to-[#145219] p-7 text-white sm:p-9">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-[13px] font-semibold uppercase tracking-[0.06em] text-[#FFCB3D]">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  30-Day Read-Only Expedition
                </span>
                <FeasibilityBadge status={plan.feasibility_status} />
              </div>

              <h1 className="text-[36px] md:text-[40px] font-extrabold tracking-tight sm:text-4xl">
                {plan.days} Days in {plan.destination_name}{' '}
                {plan.destination_name_bn ? `(${plan.destination_name_bn})` : ''}
              </h1>

              <p className="flex items-center gap-1.5 text-[16px] text-[#E5F0E0]">
                <MapPin className="h-4 w-4 text-[#FFCB3D]" />
                <span>
                  {plan.district}, {plan.division} • From {plan.starting_city} • {plan.travelers}{' '}
                  Traveler{plan.travelers > 1 ? 's' : ''}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-3 self-start rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm sm:self-auto">
              <ScoreRing score={plan.final_score} size={64} />
              <div>
                <p className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[#D5E6CF]">
                  Match Score
                </p>
                <p className="text-lg font-black text-[#FFCB3D]">{plan.final_score} / 100</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 bg-[#F6FAF3] p-5 text-[14px] sm:grid-cols-3">
          <div className="rounded-2xl border border-[#E5F0E0] bg-white p-4">
            <span className="block text-[14px] font-bold text-[#557945]">Target Budget Cap</span>
            <strong className="mt-1 block text-lg font-black text-[#1F2A1F]">
              ৳{Number(plan.budget).toLocaleString()}
            </strong>
          </div>
          <div className="rounded-2xl border border-[#E5F0E0] bg-white p-4">
            <span className="block text-[14px] font-bold text-[#557945]">Estimated Total Cost</span>
            <strong className="mt-1 block text-lg font-black text-[#2F6B2F]">
              ৳{Number(plan.total_cost).toLocaleString()}
            </strong>
          </div>
          <div className="rounded-2xl border border-[#E5F0E0] bg-white p-4">
            <span className="block text-[14px] font-bold text-[#557945]">Link Active Until</span>
            <strong className="mt-1 block text-lg font-black text-[#1F2A1F]">
              {new Date(plan.expires_at).toLocaleDateString()}
            </strong>
          </div>
        </div>
      </div>

      {/* Main Split: Day Cards + Sticky Right Summary & CTA */}
      <div className="grid grid-cols-1 gap-7 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          {(plan.itinerary?.days || []).map((day: any) => (
            <div
              key={day.day_number}
              className="overflow-hidden rounded-[26px] border border-[#D5E6CF]/70 bg-white shadow-sm"
            >
              <div className="flex items-center justify-between bg-[#2F6B2F] px-6 py-4 text-white">
                <div className="flex items-center gap-2.5">
                  <span className="rounded-full bg-[#FFCB3D] px-3 py-0.5 text-[14px] font-black text-[#1F2A1F]">
                    DAY {day.day_number}
                  </span>
                  <h2 className="text-base font-extrabold">{day.title}</h2>
                </div>
                <Calendar className="h-4 w-4 text-[#D5E6CF]" />
              </div>

              <div className="space-y-3 p-6">
                {(day.slots || []).map((slot: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex flex-col justify-between gap-2 rounded-2xl border border-[#E5F0E0] bg-[#F6FAF3] p-4 sm:flex-row sm:items-start"
                  >
                    <div className="space-y-1">
                      <span className="inline-block rounded-full border border-[#D5E6CF] bg-white px-2.5 py-0.5 text-[14px] font-extrabold uppercase text-[#2F6B2F]">
                        {slot.time_of_day}
                      </span>
                      <h3 className="text-[14px] font-extrabold text-[#1F2A1F]">
                        {slot.activity_name}
                      </h3>
                      {slot.description && (
                        <p className="text-[14px] leading-relaxed text-[#557945]">{slot.description}</p>
                      )}
                    </div>

                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#D5E6CF] bg-white px-3 py-1 text-[14px] font-bold text-[#1F2A1F]">
                      <Clock className="h-3 w-3 text-[#2F6B2F]" />
                      {slot.hours}h
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <aside className="space-y-6 lg:col-span-4">
          <div className="sticky top-24 space-y-5">
            {plan.reason_text && (
              <div className="rounded-[26px] border border-[#D5E6CF] bg-white p-6 shadow-sm">
                <div className="mb-2 flex items-center gap-1.5 text-[14px] font-extrabold uppercase tracking-wider text-[#2F6B2F]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Route Summary
                </div>
                <p className="text-[16px] leading-relaxed text-[#1F2A1F]">{plan.reason_text}</p>
              </div>
            )}

            <div className="rounded-[26px] bg-gradient-to-br from-[#235425] to-[#145219] p-6 text-white shadow-md">
              <h3 className="text-xl font-extrabold">Want to customize this trip?</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-[#D5E6CF]">
                Adjust starting city, group headcount, travel month, and live budget in the interactive VROMON planner.
              </p>
              <Link
                href="/plan"
                className="mt-5 flex h-12 w-full items-center justify-between rounded-full bg-[#FFCB3D] pl-5 pr-2 text-[14px] font-extrabold text-[#1F2A1F] hover:brightness-95"
              >
                <span>Open VROMON Planner</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1F2A1F] text-white">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
