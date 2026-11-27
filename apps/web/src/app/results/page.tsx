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
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Star,
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

const CURATOR_SNIPPETS = [
  'Comparing tea estate stays and transit routes across Sylhet...',
  'Evaluating round-trip train, bus, and river launch schedules...',
  'Cross-checking seasonal rainfall, weather comfort, and holiday crowds...',
  'Synthesizing grounded AI explanations from verified local rates...',
];

const POPULAR_SUGGESTIONS = [
  { name: 'Sajek Valley', tag: 'Hills', query: 'Sajek Valley misty hills 3 days' },
  { name: 'Sreemangal', tag: 'Tea Gardens', query: 'quiet tea gardens in Sreemangal' },
  { name: "Cox's Bazar", tag: 'Beach & Coast', query: "Cox's Bazar beach trip" },
  { name: 'Sundarbans', tag: 'Eco-Safari', query: 'Sundarbans mangrove forest trip' },
  { name: 'Sunamganj', tag: 'Wetlands', query: 'Tanguar Haor boat trip in Sunamganj' },
  { name: 'Bandarban', tag: 'Trekking', query: 'Bandarban hills trekking getaway' },
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
  const [thinkingStep, setThinkingStep] = useState(1);
  const [curatorIdx, setCuratorIdx] = useState(0);
  const [error, setError] = useState('');
  const [baseResults, setBaseResults] = useState<RecommendationItem[]>([]);
  const [effectiveQuery, setEffectiveQuery] = useState(initialQuery);
  const [sliderBudget, setSliderBudget] = useState(initialQuery.budget);
  const [divisionFilter, setDivisionFilter] = useState('All');
  const [crowdFilter, setCrowdFilter] = useState<'All' | 'Low' | 'Medium' | 'High'>('All');
  const [transportFilter, setTransportFilter] = useState<'All' | 'Bus' | 'Train' | 'Launch'>('All');
  const [minWeatherRating, setMinWeatherRating] = useState<number>(1);
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
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const activeFilterCount =
    (divisionFilter !== 'All' ? 1 : 0) +
    (crowdFilter !== 'All' ? 1 : 0) +
    (transportFilter !== 'All' ? 1 : 0) +
    (minWeatherRating > 1 ? 1 : 0) +
    (statusFilters.length < 4 ? 1 : 0);

  const resetAllFilters = () => {
    setDivisionFilter('All');
    setCrowdFilter('All');
    setTransportFilter('All');
    setMinWeatherRating(1);
    setStatusFilters(['Fits', 'Tight', 'Over budget', 'Discard']);
    setSliderBudget(effectiveQuery.budget);
  };

  useEffect(() => {
    if (!loading) return;
    setThinkingStep(1);
    const stepTimer = setInterval(() => {
      setThinkingStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 1400);
    const noteTimer = setInterval(() => {
      setCuratorIdx((prev) => (prev + 1) % CURATOR_SNIPPETS.length);
    }, 2400);
    return () => {
      clearInterval(stepTimer);
      clearInterval(noteTimer);
    };
  }, [loading]);

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
      .filter((item) => item.weather_rating >= minWeatherRating)
      .filter((item) => statusFilters.includes(item.feasibility_status))
      .sort((a, b) => {
        if (sortBy === 'cost') return a.cost_breakdown.total_cost - b.cost_breakdown.total_cost;
        if (sortBy === 'time') return b.usable_hours - a.usable_hours;
        return b.scores.final_score - a.scores.final_score;
      });
  }, [
    baseResults,
    sliderBudget,
    divisionFilter,
    crowdFilter,
    transportFilter,
    minWeatherRating,
    statusFilters,
    sortBy,
  ]);

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
      const returnPath =
        typeof window !== 'undefined'
          ? `${window.location.pathname}${window.location.search}`
          : '/results';
      router.push(`/login?next=${encodeURIComponent(returnPath)}`);
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

  // Stitch #33 / #48 AI Thinking State layered with Stitch #31 Skeleton Cards
  if (loading) {
    const checklist = [
      'Understanding your trip',
      'Checking your budget',
      'Scoring destinations',
      'Building your results',
    ];
    const progressPct = thinkingStep === 1 ? 42 : thinkingStep === 2 ? 68 : 88;

    return (
      <div className="relative mx-auto max-w-[1260px] px-4 py-8 pb-24 sm:px-6 lg:px-8">
        {/* Centered AI Thinking Glass Card (#33 Desktop & #48 Mobile) */}
        <div className="relative z-20 mx-auto mb-10 flex flex-col items-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/85 px-5 py-2 shadow-sm backdrop-blur-md">
            <span className="h-2 w-2 animate-ping rounded-full bg-[#FFCB3D]" />
            <span className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[#145219]">
              Algorithmic Concierge Active
            </span>
          </div>

          <div className="w-full max-w-[560px] rounded-[32px] border border-[#D5E6CF]/80 bg-white/95 p-7 shadow-2xl backdrop-blur-xl sm:p-10">
            {/* Top Central Pulsing Visual Orb */}
            <div className="relative flex h-[132px] w-full items-center justify-center">
              <div className="absolute h-[132px] w-[132px] animate-ping rounded-full bg-[#2F6B2F]/10" />
              <div className="absolute h-[112px] w-[112px] animate-pulse rounded-full bg-[#145219]/15" />
              <div
                className="relative flex h-24 w-24 items-center justify-center rounded-full shadow-lg"
                style={{
                  background:
                    'radial-gradient(circle at 35% 30%, #5D9253 0%, #2F6B2F 58%, #FFCB3D 100%)',
                }}
              >
                <Sparkles className="h-8 w-8 text-white" />
              </div>
            </div>

            <div className="mb-6 mt-2 text-center">
              <h2 className="text-[28px] font-bold leading-[34px] text-[#1F2A1F] sm:text-[36px] sm:leading-[42px]">
                Planning your trip
              </h2>
              <p className="mt-1.5 text-[15px] text-[#41493E]">
                Synthesizing seasonal weather, transit fares, and verified local rates
              </p>
            </div>

            {/* 4-Step Checklist (56px rows matching Stitch #33) */}
            <div className="flex w-full flex-col gap-2.5">
              {checklist.map((stepLabel, idx) => {
                const isDone = idx < thinkingStep;
                const isActive = idx === thinkingStep;
                return (
                  <div
                    key={stepLabel}
                    className={`flex h-[56px] w-full items-center justify-between rounded-2xl px-4 transition-all ${
                      isActive
                        ? 'bg-[#DFECDB] shadow-sm'
                        : isDone
                        ? 'bg-[#EAF7E6]'
                        : 'bg-transparent'
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      {isActive && (
                        <span className="h-2 w-2 shrink-0 animate-ping rounded-full bg-[#FFCB3D]" />
                      )}
                      <span
                        className={`truncate text-[15px] ${
                          isActive
                            ? 'font-bold text-[#1F2A1F]'
                            : isDone
                            ? 'font-medium text-[#1F2A1F]'
                            : 'font-normal text-[#557945]'
                        }`}
                      >
                        {stepLabel}
                      </span>
                    </div>

                    {isDone ? (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#145219] text-white shadow-sm">
                        <Check className="h-4 w-4" strokeWidth={2.5} />
                      </div>
                    ) : isActive ? (
                      <Loader2 className="h-6 w-6 shrink-0 animate-spin text-[#145219]" />
                    ) : (
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E5F2E0]">
                        <div className="h-3 w-3 rounded-full bg-white" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Shimmering Progress Bar */}
            <div className="mt-7">
              <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-[#D9E6D5]">
                <div
                  className="relative h-full overflow-hidden rounded-full bg-[#145219] transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                >
                  <div className="absolute inset-0 animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-[#FFCB3D] to-transparent opacity-80" />
                </div>
              </div>
              <p className="mt-3.5 flex items-center justify-center gap-1.5 text-center text-[14px] text-[#557945]">
                <Clock className="h-4 w-4" />
                <span>Usually takes 3 to 6 seconds</span>
              </p>
            </div>

            {/* Dynamic Curator Note */}
            <div className="mt-5 flex items-center gap-3 rounded-2xl bg-[#EAF7E6]/80 p-3.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#B0F3A8]/60 text-[#145219]">
                <Compass className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[#557945]">
                  Curator Note
                </p>
                <p className="truncate text-[14px] font-medium text-[#1F2A1F]">
                  {CURATOR_SNIPPETS[curatorIdx]}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stitch #31 2-Column Skeleton Preview Grid Underneath */}
        <div className="grid grid-cols-1 gap-6 opacity-80 md:grid-cols-2">
          {[96, 91, 88, 85].map((mockMatch) => (
            <div
              key={mockMatch}
              className="relative overflow-hidden rounded-[26px] border border-[#D5E6CF]/70 bg-white p-5 shadow-md"
            >
              <div className="pointer-events-none absolute inset-0 z-20 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/75 to-transparent" />
              <div className="relative mb-4 h-52 w-full overflow-hidden rounded-2xl bg-[#E5F2E0]">
                <div className="absolute left-3.5 top-3.5 flex gap-2">
                  <div className="h-6 w-20 rounded-full bg-white/80" />
                  <div className="h-6 w-16 rounded-full bg-white/80" />
                </div>
                <div className="absolute bottom-3.5 right-3.5 flex h-[68px] w-[68px] flex-col items-center justify-center rounded-full bg-white/95 shadow-md">
                  <span className="text-[15px] font-bold text-[#145219]">{mockMatch}%</span>
                  <span className="text-[11px] font-semibold uppercase text-[#557945]">
                    Match
                  </span>
                </div>
              </div>
              <div className="space-y-2.5">
                <div className="h-6 w-2/3 rounded-full bg-[#DFECDB]" />
                <div className="h-4 w-1/2 rounded-full bg-[#EAF7E6]" />
                <div className="grid grid-cols-2 gap-2.5 rounded-2xl bg-[#EAF7E6]/70 p-3.5">
                  {[1, 2, 3, 4, 5, 6].map((cell) => (
                    <div key={cell} className="h-3.5 w-24 rounded-full bg-[#D9E6D5]" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const filterControls = (
    <div className="space-y-6">
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
          className="vromon-slider w-full cursor-pointer"
        />
        <div className="mt-1 flex justify-between text-[14px] font-semibold text-[#557945]">
          <span>৳2,000</span>
          <span>৳40k</span>
          <span>৳80k</span>
        </div>
      </div>

      {/* Budget / Feasibility Tier Chips (#52) */}
      <div>
        <span className="mb-2 block text-[14px] font-bold uppercase tracking-wider text-[#557945]">
          Budget Tier
        </span>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'Fits', label: 'Fits' },
            { id: 'Tight', label: 'Tight' },
            { id: 'Over budget', label: 'Over' },
            { id: 'Discard', label: 'Stretch' },
          ].map((st) => {
            const checked = statusFilters.includes(st.id);
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => toggleStatusFilter(st.id)}
                className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-[14px] font-semibold transition ${
                  checked
                    ? 'bg-[#2F6B2F] text-white shadow-sm'
                    : 'bg-[#EAF7E6] text-[#1F2A1F] hover:bg-[#D5E6CF]'
                }`}
              >
                {checked && <span className="h-2 w-2 rounded-full bg-[#FFCB3D]" />}
                <span>{st.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Crowd Level (#52) */}
      <div>
        <span className="mb-2 block text-[14px] font-bold uppercase tracking-wider text-[#557945]">
          Crowd Level
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

      {/* Weather Rating Stars (#52) */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[14px] font-bold uppercase tracking-wider text-[#557945]">
            Weather Rating
          </span>
          <span className="text-[14px] font-bold text-[#2F6B2F]">
            {minWeatherRating <= 1
              ? 'Any rating'
              : minWeatherRating === 5
              ? '5 stars'
              : `${minWeatherRating}+ stars`}
          </span>
        </div>
        <div className="flex items-center gap-1.5 py-1">
          {[1, 2, 3, 4, 5].map((star) => {
            const active = star <= minWeatherRating;
            return (
              <button
                key={star}
                type="button"
                onClick={() =>
                  setMinWeatherRating((prev) => (prev === star ? 1 : star))
                }
                aria-label={`Minimum ${star} star weather rating`}
                className="rounded-full p-1 transition-transform active:scale-90"
              >
                <Star
                  className={`h-6 w-6 ${
                    active
                      ? 'fill-[#FFCB3D] text-[#FFCB3D]'
                      : 'fill-[#D9E6D5] text-[#D9E6D5]'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Transport Filter Pills (#52) */}
      <div>
        <span className="mb-2 block text-[14px] font-bold uppercase tracking-wider text-[#557945]">
          Transport
        </span>
        <div className="flex flex-wrap gap-1.5">
          {(['All', 'Bus', 'Train', 'Launch'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setTransportFilter(mode)}
              className={`inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-[14px] font-bold transition ${
                transportFilter === mode
                  ? 'bg-[#2F6B2F] text-white'
                  : 'border border-[#D5E6CF] bg-[#F6FAF3] text-[#557945] hover:bg-[#eaf7e6]'
              }`}
            >
              {transportFilter === mode && mode !== 'All' && (
                <span className="h-2 w-2 rounded-full bg-[#FFCB3D]" />
              )}
              <span>{mode}</span>
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
          className="h-11 w-full rounded-full border border-[#D5E6CF] bg-[#F6FAF3] px-4 text-[14px] font-bold text-[#1F2A1F] focus:border-[#2F6B2F] focus:outline-none"
        >
          <option value="score">Highest AI Match Score</option>
          <option value="cost">Lowest Total Estimated Cost</option>
          <option value="time">Most Usable Exploration Hours</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1260px] px-4 py-8 pb-28 sm:px-6 lg:px-8">
      {/* Top Stitch 08_results Header & Pill Bar */}
      <div className="mb-8 flex flex-col gap-4 rounded-[26px] border border-[#D5E6CF]/70 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-[28px] font-extrabold tracking-tight text-[#1F2A1F] sm:text-[36px] md:text-[40px]">
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
            <span className="rounded-full border border-[#E5F0E0] bg-[#F6FAF3] px-3 py-1">
              From {effectiveQuery.starting_city}
            </span>
            <span className="rounded-full border border-[#E5F0E0] bg-[#F6FAF3] px-3 py-1">
              ৳{sliderBudget.toLocaleString()} budget
            </span>
            <span className="rounded-full border border-[#E5F0E0] bg-[#F6FAF3] px-3 py-1">
              {effectiveQuery.travelers} traveler{effectiveQuery.travelers > 1 ? 's' : ''}
            </span>
            <span className="rounded-full border border-[#E5F0E0] bg-[#F6FAF3] px-3 py-1">
              {effectiveQuery.days} day{effectiveQuery.days > 1 ? 's' : ''}
            </span>
            <span className="rounded-full border border-[#E5F0E0] bg-[#F6FAF3] px-3 py-1">
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

      {/* Mobile Sticky Filter Trigger Bar (#52) */}
      <div className="sticky top-[84px] z-30 mb-5 flex items-center justify-between gap-3 rounded-full border border-[#D5E6CF] bg-white/95 px-4 py-2.5 shadow-sm backdrop-blur-md lg:hidden">
        <button
          type="button"
          onClick={() => setMobileFiltersOpen(true)}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-[#2F6B2F] px-4 text-[14px] font-bold text-white"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FFCB3D] text-[13px] font-extrabold text-[#1F2A1F]">
              {activeFilterCount}
            </span>
          )}
        </button>
        <div className="flex items-center gap-2 text-[14px] font-bold text-[#1F2A1F]">
          <span className="rounded-full border border-[#E5F0E0] bg-[#F6FAF3] px-3 py-1">
            ৳{sliderBudget.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Stitch #52 Mobile Filters Bottom Sheet */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-[#1F2A1F]/45 backdrop-blur-sm lg:hidden">
          <div className="flex max-h-[86vh] w-full flex-col rounded-t-[28px] border-t border-[#D5E6CF] bg-white shadow-[0_-20px_60px_rgba(31,42,31,0.18)]">
            <div className="flex flex-col items-center border-b border-[#E5F0E0] px-5 pb-3 pt-3">
              <span className="mb-3 h-1.5 w-12 rounded-full bg-[#D5E6CF]" />
              <div className="flex w-full items-center justify-between">
                <h2 className="text-[22px] font-bold text-[#1F2A1F]">Filters</h2>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={resetAllFilters}
                    className="rounded-full px-3 py-1.5 text-[14px] font-semibold text-[#2F6B2F] hover:bg-[#EAF7E6]"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileFiltersOpen(false)}
                    aria-label="Close filters"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F6FAF3] text-[#1F2A1F]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">{filterControls}</div>

            <div className="border-t border-[#E5F0E0] bg-white px-5 py-4">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="flex h-14 w-full items-center justify-between rounded-full bg-[#2F6B2F] pl-6 pr-2.5 text-[16px] font-semibold text-white shadow-lg"
              >
                <span className="mx-auto pl-6">
                  Show {liveResults.length} result{liveResults.length === 1 ? '' : 's'}
                </span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FFCB3D] text-[#1F2A1F]">
                  <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-7 lg:grid-cols-12">
        {/* Left Filters & Live What-If Budget Sidebar (Desktop) */}
        <aside className="hidden lg:col-span-4 lg:block">
          <div className="sticky top-24 space-y-6 rounded-[26px] border border-[#D5E6CF]/70 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-[#2F6B2F]" />
                <h2 className="text-[14px] font-extrabold uppercase tracking-wider text-[#1F2A1F]">
                  Live What-If &amp; Filters
                </h2>
              </div>
              {activeFilterCount > 0 ? (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="text-[14px] font-semibold text-[#2F6B2F] hover:underline"
                >
                  Reset
                </button>
              ) : (
                <span className="rounded-full bg-[#eaf7e6] px-2.5 py-0.5 text-[14px] font-bold text-[#2F6B2F]">
                  Instant Math
                </span>
              )}
            </div>
            {filterControls}
          </div>
        </aside>

        {/* Right Feed: Stitch 2-Column Recommendation Cards or #28 Empty State */}
        <div className="space-y-8 lg:col-span-8">
          {liveResults.length === 0 ? (
            /* Stitch #28 No Destinations Match */
            <div className="relative flex flex-col items-center overflow-hidden rounded-[28px] border border-[#D5E6CF] bg-white p-8 text-center shadow-xl sm:p-12">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#EAF7E6] px-3.5 py-1">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#FFCB3D]" />
                <span className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[#145219]">
                  Curator Intelligence • Search Sweep
                </span>
              </div>

              {/* Stylized Custom Magnifier & Tea Terrace Landscape SVG (#28) */}
              <div className="relative mb-5 flex h-40 w-44 items-center justify-center">
                <svg
                  className="h-full w-full drop-shadow-sm"
                  fill="none"
                  viewBox="0 0 200 180"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10 148C35 125 65 130 95 110C125 90 155 120 190 148H10Z"
                    fill="#D9E6D5"
                    opacity="0.7"
                  />
                  <path
                    d="M25 152C50 135 85 138 115 122C145 106 170 132 195 152H25Z"
                    fill="#B0F3A8"
                    opacity="0.45"
                  />
                  <circle
                    cx="86"
                    cy="78"
                    opacity="0.6"
                    r="48"
                    stroke="#FFCB3D"
                    strokeDasharray="3 3"
                    strokeWidth="1.5"
                  />
                  <circle cx="86" cy="78" fill="#F0FDEC" r="39" />
                  <path
                    d="M50 96C62 88 78 94 92 84C106 74 116 82 122 96V110H50V96Z"
                    fill="#9CD58F"
                    opacity="0.65"
                  />
                  <circle
                    cx="86"
                    cy="74"
                    fill="none"
                    r="7"
                    stroke="#BA1A1A"
                    strokeDasharray="2 2"
                    strokeWidth="2"
                  />
                  <circle cx="86" cy="78" r="40" stroke="#2F6B2F" strokeWidth="4.5" />
                  <circle cx="86" cy="78" opacity="0.9" r="37.5" stroke="#FFCB3D" strokeWidth="1.5" />
                  <line
                    stroke="#145219"
                    strokeLinecap="round"
                    strokeWidth="8"
                    x1="115"
                    x2="152"
                    y1="107"
                    y2="144"
                  />
                  <line
                    stroke="#FFCB3D"
                    strokeLinecap="round"
                    strokeWidth="3"
                    x1="120"
                    x2="148"
                    y1="112"
                    y2="140"
                  />
                </svg>
              </div>

              <h2 className="mb-2.5 text-[28px] font-bold leading-[34px] tracking-tight text-[#1F2A1F] sm:text-[36px] sm:leading-[42px]">
                No destinations match
              </h2>
              <p className="mx-auto mb-6 max-w-xl text-[16px] leading-relaxed text-[#41493E]">
                We couldn&apos;t find any spots matching your active filters and budget ceiling.
                Try broadening your constraints or exploring popular Bangladesh destinations.
              </p>

              {/* Active Constraint Pills */}
              <div className="mb-7 flex flex-wrap items-center justify-center gap-2 rounded-2xl bg-[#EAF7E6] px-4 py-2.5">
                <span className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[#775A00]">
                  Current Constraints:
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[14px] font-medium text-[#1F2A1F]">
                  Under ৳{sliderBudget.toLocaleString()}
                </span>
                {divisionFilter !== 'All' && (
                  <button
                    type="button"
                    onClick={() => setDivisionFilter('All')}
                    className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[14px] font-medium text-[#1F2A1F] hover:text-[#ba1a1a]"
                  >
                    <span>{divisionFilter}</span>
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
                {crowdFilter !== 'All' && (
                  <button
                    type="button"
                    onClick={() => setCrowdFilter('All')}
                    className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[14px] font-medium text-[#1F2A1F] hover:text-[#ba1a1a]"
                  >
                    <span>{crowdFilter} Crowd</span>
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
                {minWeatherRating > 1 && (
                  <button
                    type="button"
                    onClick={() => setMinWeatherRating(1)}
                    className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[14px] font-medium text-[#1F2A1F] hover:text-[#ba1a1a]"
                  >
                    <span>{minWeatherRating}+ Stars</span>
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Popular Spots Chips */}
              <div className="mb-8 flex w-full flex-col items-center">
                <div className="mb-3 flex items-center gap-2">
                  <Compass className="h-4 w-4 text-[#775A00]" />
                  <span className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[#557945]">
                    Try searching for popular spots:
                  </span>
                </div>
                <div className="flex max-w-xl flex-wrap items-center justify-center gap-2">
                  {POPULAR_SUGGESTIONS.map((spot) => (
                    <Link
                      key={spot.name}
                      href={`/results?wishes=${encodeURIComponent(spot.query)}&budget=18000&travelers=2&days=3&travel_month=12&starting_city=Dhaka`}
                      className="group inline-flex h-9 items-center gap-1.5 rounded-full border border-[#D5E6CF] bg-[#F0FDEC] px-4 text-[14px] font-semibold text-[#145219] transition hover:bg-[#145219] hover:text-white"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-[#775A00] group-hover:text-[#FFCB3D]" />
                      <span>{spot.name}</span>
                      <span className="text-[14px] font-normal opacity-75">({spot.tag})</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex w-full flex-col items-center justify-center gap-3.5 sm:w-auto sm:flex-row">
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="group flex h-14 w-full items-center justify-between gap-4 rounded-full bg-[#2F6B2F] pl-6 pr-2 text-[16px] font-semibold text-white shadow-md transition hover:bg-[#145219] sm:w-auto"
                >
                  <span>Clear all filters</span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFCB3D] text-[#1F2A1F]">
                    <RotateCcw className="h-4 w-4" strokeWidth={2.2} />
                  </span>
                </button>

                <Link
                  href="/plan"
                  className="flex h-14 w-full items-center justify-center rounded-full bg-[#DFECDB] px-7 text-[16px] font-semibold text-[#1F2A1F] transition hover:bg-[#D5E6CF] sm:w-auto"
                >
                  Browse all destinations
                </Link>
              </div>
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
                            '/images/destinations/sajek-valley.jpg'
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
                          <div className="rounded-xl border border-[#E5F0E0] bg-[#F6FAF3] p-2.5 text-center">
                            <span className="block text-[14px] font-bold uppercase text-[#557945]">
                              Cost
                            </span>
                            <span className="text-[14px] font-extrabold text-[#2F6B2F]">
                              ৳{item.cost_breakdown.total_cost.toLocaleString()}
                            </span>
                          </div>
                          <div className="rounded-xl border border-[#E5F0E0] bg-[#F6FAF3] p-2.5 text-center">
                            <span className="flex items-center justify-center gap-0.5 text-[14px] font-bold uppercase text-[#557945]">
                              <Train className="h-2.5 w-2.5" />
                              {item.selected_transport.mode}
                            </span>
                            <span className="text-[14px] font-extrabold text-[#1F2A1F]">
                              {item.selected_transport.travel_hours}h
                            </span>
                          </div>
                          <div className="rounded-xl border border-[#E5F0E0] bg-[#F6FAF3] p-2.5 text-center">
                            <span className="flex items-center justify-center gap-0.5 text-[14px] font-bold uppercase text-[#557945]">
                              <Clock className="h-2.5 w-2.5" />
                              Usable
                            </span>
                            <span className="text-[14px] font-extrabold text-[#1F2A1F]">
                              {item.usable_hours}h
                            </span>
                          </div>
                          <div className="rounded-xl border border-[#E5F0E0] bg-[#F6FAF3] p-2.5 text-center">
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
                          className={`inline-flex h-9 items-center gap-1 rounded-full px-3 text-[14px] font-bold transition ${
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
                          className={`inline-flex h-9 items-center gap-1 rounded-full px-3 text-[14px] font-bold transition ${
                            isSaved
                              ? 'bg-[#eaf7e6] text-[#2F6B2F]'
                              : 'border border-[#D5E6CF] bg-white text-[#1F2A1F] hover:bg-[#eaf7e6]'
                          }`}
                        >
                          {isSaved ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Bookmark className="h-3 w-3" />
                          )}
                          {isSaved ? 'Saved' : 'Save'}
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/destinations/${item.destination_id}?budget=${sliderBudget}&travelers=${effectiveQuery.travelers}&days=${effectiveQuery.days}&month=${effectiveQuery.travel_month}&city=${encodeURIComponent(effectiveQuery.starting_city)}`}
                          className="inline-flex h-9 items-center rounded-full bg-[#eaf7e6] px-3.5 text-[14px] font-bold text-[#2F6B2F] hover:bg-[#D5E6CF]"
                        >
                          Details
                        </Link>
                        <Link
                          href={`/itinerary?destId=${item.destination_id}&days=${effectiveQuery.days}&usable=${item.usable_hours}&totalCost=${item.cost_breakdown.total_cost}&status=${encodeURIComponent(item.feasibility_status)}&score=${item.scores.final_score}&budget=${sliderBudget}&travelers=${effectiveQuery.travelers}&month=${effectiveQuery.travel_month}&city=${encodeURIComponent(effectiveQuery.starting_city)}`}
                          className="inline-flex h-9 items-center gap-1 rounded-full bg-[#2F6B2F] px-3.5 text-[14px] font-bold text-white hover:bg-[#145219]"
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
