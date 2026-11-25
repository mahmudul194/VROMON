'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertTriangle,
  ArrowRight,
  Bookmark,
  Check,
  Clock,
  CloudSun,
  Compass,
  GitCompare,
  Loader2,
  MapPin,
  SlidersHorizontal,
  Sparkles,
  Train,
  X,
} from 'lucide-react';
import { recalculateForBudgetSlider, RecommendationItem } from '@vromon/shared';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { FeasibilityBadge } from '@/components/FeasibilityBadge';
import { ScoreRing } from '@/components/ScoreRing';

const MONTH_NAMES = [
  '',
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function ResultsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const initialQuery = useMemo(
    () => ({
      wishes:
        searchParams.get('wishes') ||
        'quiet hill place with tea gardens, good in winter, under 15000 taka for two people',
      budget: Number(searchParams.get('budget') || 15000),
      travelers: Number(searchParams.get('travelers') || 2),
      days: Number(searchParams.get('days') || 3),
      travel_month: Number(searchParams.get('travel_month') || 12),
      starting_city: searchParams.get('starting_city') || 'Dhaka',
      has_holiday: searchParams.get('has_holiday') === 'true',
    }),
    [searchParams],
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [baseResults, setBaseResults] = useState<RecommendationItem[]>([]);
  const [effectiveQuery, setEffectiveQuery] = useState(initialQuery);
  const [sliderBudget, setSliderBudget] = useState(initialQuery.budget);
  const [divisionFilter, setDivisionFilter] = useState('All');
  const [crowdFilter, setCrowdFilter] = useState<'All' | 'Low' | 'Medium' | 'High'>('All');
  const [transportFilter, setTransportFilter] = useState<'All' | 'Bus' | 'Train' | 'Launch'>('All');
  const [statusFilters, setStatusFilters] = useState<string[]>([
    'Fits',
    'Tight',
    'Over budget',
    'Discard',
  ]);
  const [sortBy, setSortBy] = useState<'score' | 'cost' | 'time'>('score');
  const [compareIds, setCompareIds] = useState<number[]>([]);
  const [savedIds, setSavedIds] = useState<number[]>([]);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    setError('');
    apiFetch('/recommendations', {
      method: 'POST',
      body: JSON.stringify(initialQuery),
    })
      .then((res) => {
        setBaseResults(res.recommendations || []);
        if (res.query) {
          setEffectiveQuery(res.query);
          setSliderBudget(res.query.budget);
        }
        setLatencyMs(res.latency_ms ?? null);
      })
      .catch((err: any) => {
        setError(err.message || 'Unable to compute recommendations.');
      })
      .finally(() => setLoading(false));
  }, [initialQuery]);

  // Client-side instant (<1ms) What-If Budget Slider recalculation
  const liveResults = useMemo(() => {
    return baseResults
      .map((item) => recalculateForBudgetSlider(item, sliderBudget))
      .filter((item) => divisionFilter === 'All' || item.division === divisionFilter)
      .filter((item) => crowdFilter === 'All' || item.effective_crowd === crowdFilter)
      .filter(
        (item) => transportFilter === 'All' || item.selected_transport.mode === transportFilter,
      )
      .filter((item) => statusFilters.includes(item.feasibility_status))
      .sort((a, b) => {
        if (sortBy === 'cost') return a.cost_breakdown.total_cost - b.cost_breakdown.total_cost;
        if (sortBy === 'time') return b.usable_hours - a.usable_hours;
        return b.scores.final_score - a.scores.final_score;
      });
  }, [baseResults, sliderBudget, divisionFilter, crowdFilter, transportFilter, statusFilters, sortBy]);

  const divisions = useMemo(
    () => ['All', ...Array.from(new Set(baseResults.map((r) => r.division)))],
    [baseResults],
  );

  const alternativeEscapes = useMemo(() => {
    const map = new Map<number, { destination_id: number; name: string; reason: string }>();
    liveResults.forEach((r) => {
      if (r.alternative_suggestion && !map.has(r.alternative_suggestion.destination_id)) {
        map.set(r.alternative_suggestion.destination_id, r.alternative_suggestion);
      }
    });
    return Array.from(map.values()).slice(0, 3);
  }, [liveResults]);

  const toggleStatusFilter = (status: string) => {
    setStatusFilters((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status],
    );
  };

  const toggleCompare = (id: number) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return [...prev.slice(1), id];
      return [...prev, id];
    });
  };

  const handleSaveTrip = async (item: RecommendationItem) => {
    if (!user) {
      router.push('/login');
      return;
    }
    try {
      await apiFetch('/trips', {
        method: 'POST',
        body: JSON.stringify({
          destination_id: item.destination_id,
          title: `${effectiveQuery.days}-Day Trip to ${item.name}`,
          query_params: effectiveQuery,
          recommendation_snapshot: item,
        }),
      });
      setSavedIds((prev) => [...prev, item.destination_id]);
    } catch {
      // Ignore duplicate click
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="space-y-4 rounded-[28px] border border-[#D5E6CF] bg-white p-10 text-center shadow-sm">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#2F6B2F]" />
          <h2 className="text-2xl font-extrabold text-[#1F2A1F]">
            Evaluating 64 districts across feasibility factors
          </h2>
          <p className="mx-auto max-w-lg text-[16px] text-[#557945]">
            Running LangChain intent extraction, round-trip transit fares, hotel calculations,
            weather checks, and semantic vector scoring...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1260px] px-4 py-8 pb-28 sm:px-6 lg:px-8">
      {/* Top Stitch 08_results Header & Pill Bar */}
      <div className="mb-8 flex flex-col gap-4 rounded-[26px] border border-[#D5E6CF]/70 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-extrabold tracking-tight text-[#1F2A1F] sm:text-[36px] md:text-[40px]">
              {liveResults.length} place{liveResults.length === 1 ? '' : 's'} match your trip
            </h1>
            {latencyMs !== null && (
              <span className="rounded-full bg-[#eaf7e6] px-3 py-1 text-[14px] font-bold text-[#2F6B2F]">
                {(latencyMs / 1000).toFixed(2)}s
              </span>
            )}
          </div>
          <p className="line-clamp-1 text-[16px] font-medium text-[#557945]">
            &ldquo;{effectiveQuery.wishes}&rdquo;
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[14px] font-bold text-[#1F2A1F]">
            <span className="rounded-full bg-[#F6FAF3] px-3 py-1 border border-[#E5F0E0]">
              From {effectiveQuery.starting_city}
            </span>
            <span className="rounded-full bg-[#F6FAF3] px-3 py-1 border border-[#E5F0E0]">
              ৳{sliderBudget.toLocaleString()} budget
            </span>
            <span className="rounded-full bg-[#F6FAF3] px-3 py-1 border border-[#E5F0E0]">
              {effectiveQuery.travelers} traveler{effectiveQuery.travelers > 1 ? 's' : ''}
            </span>
            <span className="rounded-full bg-[#F6FAF3] px-3 py-1 border border-[#E5F0E0]">
              {effectiveQuery.days} day{effectiveQuery.days > 1 ? 's' : ''}
            </span>
            <span className="rounded-full bg-[#F6FAF3] px-3 py-1 border border-[#E5F0E0]">
              {MONTH_NAMES[effectiveQuery.travel_month] || `Month ${effectiveQuery.travel_month}`}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2.5">
          <Link
            href="/plan"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-[#D5E6CF] bg-[#F6FAF3] px-5 text-[14px] font-bold text-[#1F2A1F] hover:bg-[#eaf7e6]"
          >
            Edit Trip Constraints
          </Link>
          {compareIds.length >= 2 && (
            <Link
              href={`/compare?ids=${compareIds.join(',')}&budget=${sliderBudget}&travelers=${effectiveQuery.travelers}&days=${effectiveQuery.days}&month=${effectiveQuery.travel_month}&city=${encodeURIComponent(effectiveQuery.starting_city)}`}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-[#FFCB3D] px-5 text-[14px] font-extrabold text-[#1F2A1F] shadow-sm hover:opacity-95"
            >
              <GitCompare className="h-4 w-4" />
              Compare ({compareIds.length})
            </Link>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-[14px] text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-7 lg:grid-cols-12">
        {/* Left Filters & Live What-If Budget Sidebar */}
        <aside className="lg:col-span-4">
          <div className="sticky top-24 space-y-6 rounded-[26px] border border-[#D5E6CF]/70 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-[#2F6B2F]" />
                <h2 className="text-[14px] font-extrabold uppercase tracking-wider text-[#1F2A1F]">
                  Live What-If &amp; Filters
                </h2>
              </div>
              <span className="rounded-full bg-[#eaf7e6] px-2.5 py-0.5 text-[14px] font-bold text-[#2F6B2F]">
                Instant Math
              </span>
            </div>

            {/* Live Budget Slider */}
            <div className="rounded-2xl border border-[#E5F0E0] bg-[#F6FAF3] p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[14px] font-bold text-[#557945]">What-If Budget</span>
                <span className="rounded-full bg-[#2F6B2F] px-3 py-0.5 text-[14px] font-extrabold text-white">
                  ৳{sliderBudget.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min={2000}
                max={80000}
                step={500}
                value={sliderBudget}
                onChange={(e) => setSliderBudget(Number(e.target.value))}
                className="w-full cursor-pointer accent-[#FFCB3D]"
              />
              <div className="mt-1 flex justify-between text-[14px] font-semibold text-[#557945]">
                <span>৳2,000</span>
                <span>৳40k</span>
                <span>৳80k</span>
              </div>
            </div>

            {/* Feasibility Tier Checkboxes */}
            <div>
              <span className="mb-2 block text-[14px] font-bold uppercase tracking-wider text-[#557945]">
                Feasibility Tier
              </span>
              <div className="grid grid-cols-2 gap-2">
                {['Fits', 'Tight', 'Over budget', 'Discard'].map((st) => {
                  const checked = statusFilters.includes(st);
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => toggleStatusFilter(st)}
                      className={`flex items-center justify-between rounded-xl border px-3 py-2 text-[14px] font-bold transition ${
                        checked
                          ? 'border-[#2F6B2F] bg-[#eaf7e6] text-[#2F6B2F]'
                          : 'border-[#E5F0E0] bg-[#F6FAF3] text-[#557945]'
                      }`}
                    >
                      <span>{st}</span>
                      {checked && <Check className="h-3.5 w-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Crowd Segmented Pill */}
            <div>
              <span className="mb-2 block text-[14px] font-bold uppercase tracking-wider text-[#557945]">
                Crowd Comfort
              </span>
              <div className="grid grid-cols-4 gap-1 rounded-full border border-[#D5E6CF] bg-[#F6FAF3] p-1">
                {(['All', 'Low', 'Medium', 'High'] as const).map((cr) => (
                  <button
                    key={cr}
                    type="button"
                    onClick={() => setCrowdFilter(cr)}
                    className={`rounded-full py-1.5 text-[14px] font-bold transition ${
                      crowdFilter === cr
                        ? 'bg-[#2F6B2F] text-white shadow-sm'
                        : 'text-[#557945] hover:text-[#1F2A1F]'
                    }`}
                  >
                    {cr}
                  </button>
                ))}
              </div>
            </div>

            {/* Transport Filter Pills */}
            <div>
              <span className="mb-2 block text-[14px] font-bold uppercase tracking-wider text-[#557945]">
                Optimal Transit Mode
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(['All', 'Bus', 'Train', 'Launch'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setTransportFilter(mode)}
                    className={`rounded-full px-3.5 py-1.5 text-[14px] font-bold transition ${
                      transportFilter === mode
                        ? 'bg-[#2F6B2F] text-white'
                        : 'border border-[#D5E6CF] bg-[#F6FAF3] text-[#557945] hover:bg-[#eaf7e6]'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Division Filter */}
            <div>
              <span className="mb-2 block text-[14px] font-bold uppercase tracking-wider text-[#557945]">
                Region / Division
              </span>
              <div className="flex flex-wrap gap-1.5">
                {divisions.map((div) => (
                  <button
                    key={div}
                    type="button"
                    onClick={() => setDivisionFilter(div)}
                    className={`rounded-full px-3 py-1 text-[14px] font-bold transition ${
                      divisionFilter === div
                        ? 'bg-[#1F2A1F] text-white'
                        : 'border border-[#D5E6CF] bg-[#F6FAF3] text-[#557945] hover:bg-[#eaf7e6]'
                    }`}
                  >
                    {div}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort By */}
            <div>
              <span className="mb-2 block text-[14px] font-bold uppercase tracking-wider text-[#557945]">
                Sort Recommendations
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'score' | 'cost' | 'time')}
                className="h-10 w-full rounded-full border border-[#D5E6CF] bg-[#F6FAF3] px-4 text-[14px] font-bold text-[#1F2A1F] focus:border-[#2F6B2F] focus:outline-none"
              >
                <option value="score">Highest AI Match Score</option>
                <option value="cost">Lowest Total Estimated Cost</option>
                <option value="time">Most Usable Exploration Hours</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Right Feed: Stitch 2-Column Recommendation Cards */}
        <div className="space-y-8 lg:col-span-8">
          {liveResults.length === 0 ? (
            <div className="space-y-4 rounded-[28px] border border-[#D5E6CF] bg-white p-10 text-center shadow-sm">
              <Compass className="mx-auto h-12 w-12 text-[#5D9253]" />
              <h3 className="text-xl font-extrabold text-[#1F2A1F]">
                No destinations match these active filters
              </h3>
              <p className="mx-auto max-w-md text-[16px] text-[#557945]">
                Try sliding the What-If budget higher, enabling Tight/Over budget statuses, or resetting transport filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              {liveResults.map((item) => {
                const isCompared = compareIds.includes(item.destination_id);
                const isSaved = savedIds.includes(item.destination_id);

                const subBars = [
                  { label: 'Meaning', val: item.scores.meaning_match },
                  { label: 'Interest', val: item.scores.interest_match },
                  { label: 'Budget', val: item.scores.budget_fit },
                  { label: 'Time', val: item.scores.time_fit },
                  { label: 'Weather', val: item.scores.weather_fit },
                  { label: 'Crowd calm', val: item.scores.crowd_fit },
                ];

                return (
                  <article
                    key={item.destination_id}
                    className="flex flex-col justify-between overflow-hidden rounded-[26px] border border-[#D5E6CF]/70 bg-white shadow-[0_14px_38px_-14px_rgba(31,42,31,0.08)] transition hover:shadow-lg"
                  >
                    <div>
                      {/* Image Header with Gradient Scrim, Status Pill & Floating Score Ring */}
                      <div className="relative h-48 w-full overflow-hidden bg-[#E5F0E0]">
                        <img
                          src={
                            item.image_url ||
                            'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80'
                          }
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1F2A1F]/80 via-[#1F2A1F]/20 to-transparent" />

                        <div className="absolute left-3.5 top-3.5">
                          <FeasibilityBadge status={item.feasibility_status} />
                        </div>

                        <div className="absolute right-3.5 top-3.5 rounded-2xl bg-white/95 p-1.5 shadow-md backdrop-blur-sm">
                          <ScoreRing score={item.scores.final_score} size={56} />
                        </div>

                        <div className="absolute bottom-3.5 left-4 right-4 text-white">
                          <div className="flex items-baseline gap-2">
                            <h3 className="text-xl font-extrabold tracking-tight">{item.name}</h3>
                            {item.name_bn && (
                              <span className="text-[14px] font-medium text-[#D5E6CF]">
                                {item.name_bn}
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 flex items-center gap-1 text-[14px] font-semibold text-[#E5F0E0]">
                            <MapPin className="h-3 w-3 text-[#FFCB3D]" />
                            {item.district} District, {item.division}
                          </p>
                        </div>
                      </div>

                      {/* Body */}
                      <div className="space-y-4 p-5">
                        {/* Key Metrics Row */}
                        <div className="grid grid-cols-4 gap-2">
                          <div className="rounded-xl bg-[#F6FAF3] p-2.5 text-center border border-[#E5F0E0]">
                            <span className="block text-[14px] font-bold uppercase text-[#557945]">
                              Cost
                            </span>
                            <span className="text-[14px] font-extrabold text-[#2F6B2F]">
                              ৳{item.cost_breakdown.total_cost.toLocaleString()}
                            </span>
                          </div>
                          <div className="rounded-xl bg-[#F6FAF3] p-2.5 text-center border border-[#E5F0E0]">
                            <span className="flex items-center justify-center gap-0.5 text-[14px] font-bold uppercase text-[#557945]">
                              <Train className="h-2.5 w-2.5" />
                              {item.selected_transport.mode}
                            </span>
                            <span className="text-[14px] font-extrabold text-[#1F2A1F]">
                              {item.selected_transport.travel_hours}h
                            </span>
                          </div>
                          <div className="rounded-xl bg-[#F6FAF3] p-2.5 text-center border border-[#E5F0E0]">
                            <span className="flex items-center justify-center gap-0.5 text-[14px] font-bold uppercase text-[#557945]">
                              <Clock className="h-2.5 w-2.5" />
                              Usable
                            </span>
                            <span className="text-[14px] font-extrabold text-[#1F2A1F]">
                              {item.usable_hours}h
                            </span>
                          </div>
                          <div className="rounded-xl bg-[#F6FAF3] p-2.5 text-center border border-[#E5F0E0]">
                            <span className="flex items-center justify-center gap-0.5 text-[14px] font-bold uppercase text-[#557945]">
                              <CloudSun className="h-2.5 w-2.5" />
                              Climate
                            </span>
                            <span className="text-[14px] font-extrabold text-[#1F2A1F]">
                              {item.weather_rating}/5
                            </span>
                          </div>
                        </div>

                        {/* AI Advisor Note */}
                        <div className="rounded-2xl border border-[#D5E6CF] bg-[#eaf7e6]/65 p-3.5">
                          <div className="mb-1 flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-[0.06em] text-[#2F6B2F]">
                            <Sparkles className="h-3 w-3" />
                            Grounded AI Advisor
                          </div>
                          <p className="line-clamp-3 text-[14px] leading-relaxed text-[#1F2A1F]">
                            {item.ai_reason}
                          </p>
                        </div>

                        {/* 6-Factor Mini Progress Bar Grid */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-1">
                          {subBars.map((bar) => (
                            <div key={bar.label} className="space-y-1">
                              <div className="flex items-center justify-between text-[14px]">
                                <span className="font-semibold text-[#557945]">{bar.label}</span>
                                <span className="font-bold text-[#1F2A1F]">
                                  {Math.round(bar.val)}%
                                </span>
                              </div>
                              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E5F0E0]">
                                <div
                                  className={`h-full rounded-full ${
                                    bar.val >= 75
                                      ? 'bg-[#2F6B2F]'
                                      : bar.val >= 50
                                      ? 'bg-[#FFCB3D]'
                                      : 'bg-red-400'
                                  }`}
                                  style={{ width: `${Math.max(4, Math.min(100, bar.val))}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Alternative Recommendation Alert */}
                        {item.alternative_suggestion && (
                          <div className="flex items-center justify-between gap-2 rounded-2xl border border-[#FFCB3D]/70 bg-[#fff8e1] p-3 text-[14px]">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#9a6b00]" />
                              <div>
                                <p className="font-bold text-[#1F2A1F]">
                                  Try instead: {item.alternative_suggestion.name}
                                </p>
                                <p className="line-clamp-1 text-[14px] text-[#557945]">
                                  {item.alternative_suggestion.reason}
                                </p>
                              </div>
                            </div>
                            <Link
                              href={`/destinations/${item.alternative_suggestion.destination_id}`}
                              className="shrink-0 rounded-full bg-[#1F2A1F] px-3 py-1 text-[14px] font-bold text-white"
                            >
                              View
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#E5F0E0] bg-[#F6FAF3]/60 px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleCompare(item.destination_id)}
                          className={`inline-flex h-8 items-center gap-1 rounded-full px-3 text-[14px] font-bold transition ${
                            isCompared
                              ? 'bg-[#FFCB3D] text-[#1F2A1F]'
                              : 'border border-[#D5E6CF] bg-white text-[#1F2A1F] hover:bg-[#eaf7e6]'
                          }`}
                        >
                          <GitCompare className="h-3 w-3" />
                          {isCompared ? 'Compared' : '+ Compare'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSaveTrip(item)}
                          className={`inline-flex h-8 items-center gap-1 rounded-full px-3 text-[14px] font-bold transition ${
                            isSaved
                              ? 'bg-[#eaf7e6] text-[#2F6B2F]'
                              : 'border border-[#D5E6CF] bg-white text-[#1F2A1F] hover:bg-[#eaf7e6]'
                          }`}
                        >
                          {isSaved ? <Check className="h-3 w-3" /> : <Bookmark className="h-3 w-3" />}
                          {isSaved ? 'Saved' : 'Save'}
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/destinations/${item.destination_id}?budget=${sliderBudget}&travelers=${effectiveQuery.travelers}&days=${effectiveQuery.days}&month=${effectiveQuery.travel_month}&city=${encodeURIComponent(effectiveQuery.starting_city)}`}
                          className="inline-flex h-8 items-center rounded-full bg-[#eaf7e6] px-3.5 text-[14px] font-bold text-[#2F6B2F] hover:bg-[#D5E6CF]"
                        >
                          Details
                        </Link>
                        <Link
                          href={`/itinerary?destId=${item.destination_id}&days=${effectiveQuery.days}&usable=${item.usable_hours}&totalCost=${item.cost_breakdown.total_cost}&status=${encodeURIComponent(item.feasibility_status)}&score=${item.scores.final_score}&budget=${sliderBudget}&travelers=${effectiveQuery.travelers}&month=${effectiveQuery.travel_month}&city=${encodeURIComponent(effectiveQuery.starting_city)}`}
                          className="inline-flex h-8 items-center gap-1 rounded-full bg-[#2F6B2F] px-3.5 text-[14px] font-bold text-white hover:bg-[#145219]"
                        >
                          Day Plan
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Alternative Escapes Bottom Strip */}
          {alternativeEscapes.length > 0 && (
            <div className="rounded-[26px] border border-[#D5E6CF] bg-white p-6 shadow-sm">
              <h3 className="text-[14px] font-extrabold uppercase tracking-wider text-[#557945]">
                Lower-Crowd &amp; Budget-Friendly Escapes
              </h3>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {alternativeEscapes.map((alt) => (
                  <Link
                    key={alt.destination_id}
                    href={`/destinations/${alt.destination_id}?budget=${sliderBudget}&travelers=${effectiveQuery.travelers}&days=${effectiveQuery.days}&month=${effectiveQuery.travel_month}&city=${encodeURIComponent(effectiveQuery.starting_city)}`}
                    className="rounded-2xl border border-[#E5F0E0] bg-[#F6FAF3] p-4 transition hover:border-[#2F6B2F] hover:bg-[#eaf7e6]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#1F2A1F]">{alt.name}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-[#2F6B2F]" />
                    </div>
                    <p className="mt-1 line-clamp-2 text-[14px] text-[#557945]">{alt.reason}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Bottom Compare Dock (Stitch 08_results) */}
      {compareIds.length > 0 && (
        <div className="fixed bottom-5 left-1/2 z-40 flex w-[92%] max-w-2xl -translate-x-1/2 items-center justify-between gap-3 rounded-full border border-white/15 bg-[#1F2A1F]/95 px-5 py-3 text-white shadow-2xl backdrop-blur-md">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[14px] font-bold text-[#D5E6CF]">
              Compare ({compareIds.length}/3):
            </span>
            {compareIds.map((id) => {
              const found = baseResults.find((r) => r.destination_id === id);
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-[14px] font-bold"
                >
                  {found?.name || `#${id}`}
                  <button
                    type="button"
                    onClick={() => toggleCompare(id)}
                    aria-label="Remove from compare"
                    className="text-[#D5E6CF] hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              );
            })}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setCompareIds([])}
              className="text-[14px] font-semibold text-[#D5E6CF] hover:text-white"
            >
              Clear
            </button>
            {compareIds.length >= 2 ? (
              <Link
                href={`/compare?ids=${compareIds.join(',')}&budget=${sliderBudget}&travelers=${effectiveQuery.travelers}&days=${effectiveQuery.days}&month=${effectiveQuery.travel_month}&city=${encodeURIComponent(effectiveQuery.starting_city)}`}
                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#FFCB3D] px-4 text-[14px] font-extrabold text-[#1F2A1F]"
              >
                Compare Now
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-[14px] font-semibold text-[#D5E6CF]">
                Pick 1 more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#2F6B2F]" />
        </div>
      }
    >
      <ResultsInner />
    </Suspense>
  );
}
