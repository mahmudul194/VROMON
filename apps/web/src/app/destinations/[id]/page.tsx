'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  CloudSun,
  Compass,
  GitCompare,
  Loader2,
  MapPin,
  ShieldCheck,
  Sparkles,
  Train,
  Users,
  Wallet,
} from 'lucide-react';
import {
  calculateAvailableTime,
  calculateBudgetFeasibility,
  selectOptimalTransport,
} from '@vromon/shared';
import { apiFetch } from '@/lib/api';
import { DestinationMap } from '@/components/DestinationMap';
import { ClimateChart } from '@/components/ClimateChart';
import { CostChart } from '@/components/CostChart';
import { FeasibilityBadge } from '@/components/FeasibilityBadge';
import { ScoreRing } from '@/components/ScoreRing';

const MONTH_SHORT = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function DestinationDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;

  const [dest, setDest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [travelers, setTravelers] = useState(Number(searchParams.get('travelers') || 2));
  const [days, setDays] = useState(Number(searchParams.get('days') || 2));
  const [month, setMonth] = useState(Number(searchParams.get('month') || 12));
  const [budget, setBudget] = useState(Number(searchParams.get('budget') || 10000));
  const startingCity = searchParams.get('city') || 'Dhaka';

  useEffect(() => {
    setLoading(true);
    apiFetch(`/destinations/${id}`)
      .then(setDest)
      .catch(() => setDest(null))
      .finally(() => setLoading(false));
  }, [id]);

  const optimalTransport = useMemo(() => {
    if (!dest) {
      return { mode: 'Bus' as const, fare_per_person: 650, travel_hours: 6, city_name: startingCity };
    }
    return (
      selectOptimalTransport(dest.transport_options || [], startingCity) || {
        mode: 'Bus' as const,
        fare_per_person: 650,
        travel_hours: 6,
        city_name: startingCity,
      }
    );
  }, [dest, startingCity]);

  const budgetCheck = useMemo(() => {
    if (!dest) return null;
    return calculateBudgetFeasibility({
      budget,
      travelers,
      days,
      oneWayFarePerPerson: optimalTransport.fare_per_person,
      hotelCostPerRoomNight: dest.hotel_cost_per_room_night,
      foodCostPerPersonDay: dest.food_cost_per_person_day,
      localFeesPerPerson: dest.local_fees_per_person,
    });
  }, [dest, budget, travelers, days, optimalTransport]);

  const timeCheck = useMemo(() => {
    if (!dest) return null;
    return calculateAvailableTime(days, optimalTransport.travel_hours, dest.min_hours_needed || 8);
  }, [dest, days, optimalTransport]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#2F6B2F]" />
      </div>
    );
  }

  if (!dest || !budgetCheck || !timeCheck) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 p-16 text-center">
        <h1 className="text-[36px] md:text-[40px] font-extrabold text-[#1F2A1F]">Destination not found</h1>
        <Link
          href="/plan"
          className="inline-flex rounded-full bg-[#2F6B2F] px-6 py-2.5 text-[14px] font-bold text-white"
        >
          Back to Planner
        </Link>
      </div>
    );
  }

  const conditions: any[] = dest.monthly_conditions || [];
  const activeCondition = conditions.find((c) => c.month_no === month) || conditions[0];
  const compositeScore = Math.min(
    99,
    Math.max(
      40,
      Math.round(budgetCheck.budget_score * 0.55 + timeCheck.time_score * 0.25 + ((activeCondition?.weather_rating || 4) / 5) * 20),
    ),
  );

  return (
    <div className="mx-auto max-w-[1240px] space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/plan"
          className="inline-flex items-center gap-2 rounded-full border border-[#D5E6CF] bg-white px-4 py-2 text-[14px] font-bold text-[#1F2A1F] shadow-sm hover:bg-[#eaf7e6]"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-[#2F6B2F]" />
          <span>Back to Planner</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href={`/compare?ids=${dest.destination_id}&budget=${budget}&travelers=${travelers}&days=${days}&month=${month}&city=${encodeURIComponent(startingCity)}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#D5E6CF] bg-white px-4 py-2 text-[14px] font-bold text-[#1F2A1F] hover:bg-[#eaf7e6]"
          >
            <GitCompare className="h-3.5 w-3.5 text-[#2F6B2F]" />
            Compare District
          </Link>
        </div>
      </div>

      {/* Stitch 09_detail Hero Banner */}
      <div className="overflow-hidden rounded-[28px] border border-[#D5E6CF]/70 bg-white shadow-[0_18px_50px_-14px_rgba(31,42,31,0.12)]">
        <div className="relative h-72 w-full bg-[#E5F0E0] sm:h-96">
          <img
            src={
              dest.image_url ||
              'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1400&q=80'
            }
            alt={dest.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1F2A1F]/85 via-[#1F2A1F]/25 to-transparent" />

          <div className="absolute right-5 top-5 flex items-center gap-3 rounded-2xl border border-white/20 bg-[#1F2A1F]/85 px-4 py-2.5 text-white backdrop-blur-md">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[#D5E6CF]">
                Feasibility Score
              </p>
              <p className="text-2xl font-black leading-none text-[#FFCB3D]">{compositeScore}</p>
            </div>
            <ScoreRing score={compositeScore} size={48} />
          </div>

          <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-4 text-white sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 flex flex-wrap gap-2">
                <span className="rounded-full bg-[#FFCB3D] px-3 py-1 text-[14px] font-extrabold text-[#1F2A1F]">
                  {dest.division} Division
                </span>
                <FeasibilityBadge status={budgetCheck.feasibility_status} />
                <span className="rounded-full bg-white/20 px-3 py-1 text-[14px] font-bold backdrop-blur-sm">
                  {dest.cost_level} Cost Tier
                </span>
              </div>
              <h1 className="text-[36px] md:text-[40px] font-extrabold tracking-tight sm:text-4xl">
                {dest.name} {dest.name_bn ? `(${dest.name_bn})` : ''}
              </h1>
              <p className="mt-1 flex items-center gap-1.5 text-[16px] text-[#E5F0E0]">
                <MapPin className="h-4 w-4 text-[#FFCB3D]" />
                <span>{dest.district} District, Bangladesh</span>
              </p>
            </div>
          </div>
        </div>

        {/* Sticky Sub-Nav Pill Strip */}
        <div className="flex flex-wrap items-center gap-2 border-t border-[#E5F0E0] bg-[#F6FAF3] px-6 py-3">
          {[
            { href: '#overview', label: 'Overview' },
            { href: '#budget', label: 'Budget' },
            { href: '#feasibility', label: 'Feasibility' },
            { href: '#climate', label: 'Climate & Crowd' },
            { href: '#attractions', label: 'Attractions' },
            { href: '#map', label: 'Map' },
          ].map((tab) => (
            <a
              key={tab.href}
              href={tab.href}
              className="rounded-full border border-[#D5E6CF] bg-white px-4 py-1.5 text-[14px] font-bold text-[#1F2A1F] transition hover:bg-[#2F6B2F] hover:text-white"
            >
              {tab.label}
            </a>
          ))}
        </div>
      </div>

      {/* Main 12-Col Split: Left Content + Sticky Right Curated Package */}
      <div className="grid grid-cols-1 gap-7 lg:grid-cols-12">
        <div className="space-y-7 lg:col-span-8">
          {/* Overview Card */}
          <section
            id="overview"
            className="scroll-mt-24 rounded-[26px] border border-[#D5E6CF]/70 bg-white p-6 shadow-sm sm:p-8"
          >
            <div className="mb-3 flex items-center gap-2 text-[14px] font-extrabold uppercase tracking-wider text-[#2F6B2F]">
              <Sparkles className="h-4 w-4" />
              Why {dest.name} fits this profile
            </div>
            <p className="text-[16px] leading-relaxed text-[#1F2A1F] sm:text-base">
              {dest.description}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {(dest.tags || []).map((t: string) => (
                <span
                  key={t}
                  className="rounded-full border border-[#D5E6CF] bg-[#eaf7e6]/70 px-3.5 py-1 text-[14px] font-bold text-[#2F6B2F]"
                >
                  #{t}
                </span>
              ))}
            </div>
          </section>

          {/* Budget Breakdown Card */}
          <section
            id="budget"
            className="scroll-mt-24 space-y-5 rounded-[26px] border border-[#D5E6CF]/70 bg-white p-6 shadow-sm sm:p-8"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-[#1F2A1F]">
                  Itemized Budget Breakdown
                </h2>
                <p className="mt-0.5 text-[14px] font-medium text-[#557945]">
                  Calculated for {travelers} traveler{travelers > 1 ? 's' : ''}, {days} day{days > 1 ? 's' : ''} from {startingCity} • Room rate ৳{dest.hotel_cost_per_room_night.toLocaleString()}/night
                </p>
              </div>
              <ScoreRing score={budgetCheck.budget_score} size={58} />
            </div>

            <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-12">
              <div className="md:col-span-6">
                <CostChart breakdown={budgetCheck.cost_breakdown} />
              </div>
              <div className="space-y-2.5 md:col-span-6">
                {[
                  {
                    label: `Round-trip ${optimalTransport.mode} (${travelers}x)`,
                    val: budgetCheck.cost_breakdown.round_trip_transport,
                  },
                  {
                    label: `Hotel stay (${budgetCheck.cost_breakdown.rooms_needed} room × ${budgetCheck.cost_breakdown.nights} nights)`,
                    val: budgetCheck.cost_breakdown.hotel_stay,
                  },
                  {
                    label: `Meals & local food (${days} days)`,
                    val: budgetCheck.cost_breakdown.food_total,
                  },
                  {
                    label: 'Local transit & entry fees',
                    val: budgetCheck.cost_breakdown.local_fees,
                  },
                  {
                    label: '10% safety contingency buffer',
                    val: budgetCheck.cost_breakdown.safety_buffer,
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between rounded-xl bg-[#F6FAF3] px-4 py-2.5 text-[14px] border border-[#E5F0E0]"
                  >
                    <span className="font-semibold text-[#557945]">{row.label}</span>
                    <span className="font-extrabold text-[#1F2A1F]">
                      ৳{row.val.toLocaleString()}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between rounded-xl bg-[#2F6B2F] px-4 py-3 text-[14px] text-white">
                  <span className="font-bold">Total Estimated Package</span>
                  <span className="font-black text-[#FFCB3D]">
                    ৳{budgetCheck.cost_breakdown.total_cost.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Time Feasibility + Transit Options */}
          <section
            id="feasibility"
            className="scroll-mt-24 space-y-5 rounded-[26px] border border-[#D5E6CF]/70 bg-white p-6 shadow-sm sm:p-8"
          >
            <div>
              <h2 className="text-xl font-extrabold text-[#1F2A1F]">
                Time &amp; Transit Feasibility
              </h2>
              <p className="mt-0.5 text-[14px] font-medium text-[#557945]">
                Best route from {startingCity}: {optimalTransport.mode} (৳{optimalTransport.fare_per_person}/person one-way)
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#E5F0E0] bg-[#F6FAF3] p-4">
                <span className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[#557945]">
                  Round-Trip Transit
                </span>
                <p className="mt-1 text-2xl font-black text-[#1F2A1F]">
                  {timeCheck.round_trip_hours} hrs
                </p>
              </div>
              <div className="rounded-2xl border border-[#D5E6CF] bg-[#eaf7e6] p-4">
                <span className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[#2F6B2F]">
                  Usable Explore Hours
                </span>
                <p className="mt-1 text-2xl font-black text-[#2F6B2F]">
                  {timeCheck.usable_hours} hrs
                </p>
              </div>
              <div className="rounded-2xl border border-[#E5F0E0] bg-[#F6FAF3] p-4">
                <span className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[#557945]">
                  Min. Recommended Time
                </span>
                <p className="mt-1 text-2xl font-black text-[#1F2A1F]">
                  {dest.min_hours_needed || 8} hrs
                </p>
              </div>
            </div>

            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-[14px]">
                <thead>
                  <tr className="border-b border-[#E5F0E0] text-[14px] uppercase tracking-wider text-[#557945]">
                    <th className="pb-3">Origin City</th>
                    <th className="pb-3">Mode</th>
                    <th className="pb-3">One-Way Fare</th>
                    <th className="pb-3">Transit Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5F0E0]">
                  {(dest.transport_options || []).map((tr: any, idx: number) => (
                    <tr key={idx} className="text-[#1F2A1F]">
                      <td className="py-3 font-bold">{tr.city_name}</td>
                      <td className="py-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#eaf7e6] px-2.5 py-0.5 text-[14px] font-bold text-[#2F6B2F]">
                          <Train className="h-3 w-3" /> {tr.mode}
                        </span>
                      </td>
                      <td className="py-3 font-extrabold">৳{tr.fare_per_person}</td>
                      <td className="py-3 text-[#557945]">{tr.travel_hours} hrs</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 12-Month Climate & Crowd Index */}
          <section
            id="climate"
            className="scroll-mt-24 space-y-5 rounded-[26px] border border-[#D5E6CF]/70 bg-white p-6 shadow-sm sm:p-8"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="flex items-center gap-2 text-xl font-extrabold text-[#1F2A1F]">
                  <CloudSun className="h-5 w-5 text-[#2F6B2F]" />
                  Climate and Crowd Index
                </h2>
                <p className="mt-0.5 text-[14px] text-[#557945]">
                  Click any month pill below to preview weather conditions and crowd intensity.
                </p>
              </div>
              {activeCondition && (
                <span className="rounded-full bg-[#fff8e1] px-3 py-1 text-[14px] font-bold text-[#9a6b00]">
                  {MONTH_SHORT[activeCondition.month_no]}: {activeCondition.weather_rating}/5 Weather • {activeCondition.crowd_level} Crowd
                </span>
              )}
            </div>

            {/* 12-Month Horizontal Selector Cards */}
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-12">
              {conditions.map((c: any) => {
                const isSelected = c.month_no === month;
                const isBest = c.weather_rating >= 5;
                return (
                  <button
                    key={c.month_no}
                    type="button"
                    onClick={() => setMonth(c.month_no)}
                    className={`rounded-2xl border p-2 text-center transition ${
                      isSelected
                        ? 'border-[#2F6B2F] bg-[#2F6B2F] text-white shadow-sm'
                        : isBest
                        ? 'border-[#FFCB3D] bg-[#fff8e1] text-[#1F2A1F]'
                        : 'border-[#E5F0E0] bg-[#F6FAF3] text-[#1F2A1F] hover:bg-[#eaf7e6]'
                    }`}
                  >
                    <p className="text-[14px] font-bold">{MONTH_SHORT[c.month_no]}</p>
                    <p
                      className={`mt-0.5 text-[14px] font-black ${
                        isSelected ? 'text-[#FFCB3D]' : 'text-[#2F6B2F]'
                      }`}
                    >
                      {c.weather_rating}/5
                    </p>
                    <p
                      className={`text-[14px] font-semibold uppercase ${
                        isSelected ? 'text-[#D5E6CF]' : 'text-[#557945]'
                      }`}
                    >
                      {c.crowd_level}
                    </p>
                  </button>
                );
              })}
            </div>

            {activeCondition?.weather_note && (
              <div className="rounded-2xl border border-[#D5E6CF] bg-[#eaf7e6]/70 px-4 py-3 text-[14px] font-medium text-[#1F2A1F]">
                <strong className="font-extrabold text-[#2F6B2F]">Seasonal Verdict:</strong>{' '}
                {activeCondition.weather_note}
              </div>
            )}

            <ClimateChart conditions={conditions} highlightMonth={month} />
          </section>

          {/* Verified Attractions */}
          <section
            id="attractions"
            className="scroll-mt-24 space-y-4 rounded-[26px] border border-[#D5E6CF]/70 bg-white p-6 shadow-sm sm:p-8"
          >
            <h2 className="text-xl font-extrabold text-[#1F2A1F]">
              Top Verified Attractions ({dest.attractions?.length || 0})
            </h2>
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              {(dest.attractions || []).map((a: any) => (
                <div
                  key={a.attraction_id}
                  className="flex flex-col justify-between rounded-2xl border border-[#E5F0E0] bg-[#F6FAF3] p-4"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-[14px] font-extrabold text-[#1F2A1F]">{a.name}</h3>
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-[14px] font-bold text-[#2F6B2F] border border-[#D5E6CF]">
                        <Clock className="h-3 w-3" /> {a.est_hours}h
                      </span>
                    </div>
                    {a.description && (
                      <p className="mt-1.5 text-[14px] leading-relaxed text-[#557945]">
                        {a.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Interactive Map */}
          <section
            id="map"
            className="scroll-mt-24 space-y-4 rounded-[26px] border border-[#D5E6CF]/70 bg-white p-6 shadow-sm sm:p-8"
          >
            <h2 className="text-xl font-extrabold text-[#1F2A1F]">Location &amp; Coordinates</h2>
            <DestinationMap
              latitude={dest.latitude}
              longitude={dest.longitude}
              name={dest.name}
              district={dest.district}
            />
          </section>
        </div>

        {/* Sticky Right Curated Package Sidebar */}
        <aside className="lg:col-span-4">
          <div className="sticky top-24 space-y-5 rounded-[26px] bg-gradient-to-br from-[#235425] via-[#2F6B2F] to-[#145219] p-6 text-white shadow-[0_22px_55px_-16px_rgba(20,82,25,0.45)]">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-white/15 px-3 py-1 text-[13px] font-semibold uppercase tracking-[0.06em] text-[#FFCB3D]">
                Curated Package
              </span>
              <span className="rounded-full bg-white/15 px-3 py-1 text-[14px] font-bold text-white">
                {budgetCheck.feasibility_status}
              </span>
            </div>

            <div>
              <p className="text-[14px] text-[#D5E6CF]">Estimated Group Total</p>
              <p className="mt-0.5 text-4xl font-black tracking-tight text-white">
                ৳{budgetCheck.cost_breakdown.total_cost.toLocaleString()}
              </p>
              <p className="mt-1 text-[14px] text-[#E5F0E0]">
                From {startingCity} via {optimalTransport.mode} • {timeCheck.usable_hours}h at destination
              </p>
            </div>

            {/* Interactive Controls inside Sidebar */}
            <div className="space-y-3 rounded-2xl border border-white/15 bg-white/10 p-4 text-[14px]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-semibold text-[#E5F0E0]">
                  <Wallet className="h-3.5 w-3.5 text-[#FFCB3D]" /> Your Budget
                </span>
                <span className="font-extrabold text-white">৳{budget.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min={2000}
                max={80000}
                step={500}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full cursor-pointer accent-[#FFCB3D]"
              />

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="mb-1 flex items-center gap-1 text-[14px] font-bold uppercase text-[#D5E6CF]">
                    <Calendar className="h-3 w-3" /> Days
                  </label>
                  <select
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                    className="h-9 w-full rounded-xl bg-[#145219] px-2.5 text-[14px] font-bold text-white focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 10].map((d) => (
                      <option key={d} value={d}>
                        {d} day{d > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 flex items-center gap-1 text-[14px] font-bold uppercase text-[#D5E6CF]">
                    <Users className="h-3 w-3" /> Travelers
                  </label>
                  <select
                    value={travelers}
                    onChange={(e) => setTravelers(Number(e.target.value))}
                    className="h-9 w-full rounded-xl bg-[#145219] px-2.5 text-[14px] font-bold text-white focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 8].map((t) => (
                      <option key={t} value={t}>
                        {t} {t === 1 ? 'guest' : 'guests'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-[14px] text-[#E5F0E0]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#FFCB3D]" />
                <span>Grounded strictly to database attractions</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0 text-[#FFCB3D]" />
                <span>Includes 10% emergency contingency buffer</span>
              </div>
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 shrink-0 text-[#FFCB3D]" />
                <span>Shareable 30-day public link &amp; PDF export</span>
              </div>
            </div>

            <Link
              href={`/itinerary?destId=${dest.destination_id}&days=${days}&usable=${timeCheck.usable_hours}&totalCost=${budgetCheck.cost_breakdown.total_cost}&status=${encodeURIComponent(budgetCheck.feasibility_status)}&score=${compositeScore}&budget=${budget}&travelers=${travelers}&month=${month}&city=${encodeURIComponent(startingCity)}`}
              className="flex h-12 w-full items-center justify-between rounded-full bg-[#FFCB3D] pl-6 pr-2.5 text-[14px] font-extrabold text-[#1F2A1F] shadow-md transition hover:brightness-95"
            >
              <span>Build Day-by-Day Plan</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1F2A1F] text-white">
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
