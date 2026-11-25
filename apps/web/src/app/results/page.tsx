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
  Users,
} from 'lucide-react';
import { recalculateForBudgetSlider, RecommendationItem } from '@vromon/shared';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { FeasibilityBadge } from '@/components/FeasibilityBadge';
import { ScoreRing } from '@/components/ScoreRing';

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
      .sort((a, b) => b.scores.final_score - a.scores.final_score);
  }, [baseResults, sliderBudget, divisionFilter]);

  const divisions = useMemo(
    () => ['All', ...Array.from(new Set(baseResults.map((r) => r.division)))],
    [baseResults],
  );

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
        <div className="rounded-[28px] bg-white p-10 text-center shadow-ambient border border-vromon-pill space-y-4">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-vromon-primary" />
          <h2 className="text-2xl font-extrabold text-vromon-dark">
            Evaluating 64 districts across feasibility factors
          </h2>
          <p className="mx-auto max-w-lg text-sm text-vromon-muted">
            Running LangChain intent extraction, round-trip transit fares, hotel calculations,
            weather checks, and semantic vector scoring...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
      {/* Criteria Ribbon */}
      <div className="mb-8 flex flex-col gap-4 rounded-[26px] bg-white p-5 shadow-soft border border-vromon-pill sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-widest text-vromon-olive">
            <span>Feasibility Results</span>
            {latencyMs !== null && (
              <span className="rounded-full bg-vromon-pill px-2.5 py-0.5 text-vromon-deep">
                {(latencyMs / 1000).toFixed(2)}s
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-vromon-dark line-clamp-1">
            &ldquo;{effectiveQuery.wishes}&rdquo;
          </p>
          <p className="text-xs text-vromon-muted">
            {effectiveQuery.travelers} Traveler(s) • {effectiveQuery.days} Days • From{' '}
            {effectiveQuery.starting_city} • Month {effectiveQuery.travel_month}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {compareIds.length >= 2 && (
            <Link
              href={`/compare?ids=${compareIds.join(',')}`}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-vromon-amber px-4 text-xs font-bold text-vromon-dark hover:brightness-95"
            >
              <GitCompare className="h-4 w-4" />
              <span>Compare ({compareIds.length})</span>
            </Link>
          )}
          <Link
            href="/plan"
            className="inline-flex h-10 items-center gap-2 rounded-full border border-vromon-dark/20 bg-vromon-leaf px-4 text-xs font-bold text-vromon-dark hover:bg-vromon-pill"
          >
            <span>Edit Search</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-vromon-danger">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Sidebar: Live What-If Budget Slider */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="sticky top-24 rounded-[28px] bg-white p-6 shadow-soft border border-vromon-pill space-y-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-vromon-pill text-vromon-deep">
                <SlidersHorizontal className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-vromon-dark">
                  What-If Budget Slider
                </h2>
                <p className="text-xs text-vromon-muted">Instant client-side recompute</p>
              </div>
            </div>

            <div className="rounded-2xl bg-vromon-leaf p-4 border border-vromon-pill space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-vromon-muted">
                  Simulated Budget
                </span>
                <span className="text-2xl font-extrabold text-vromon-deep">
                  ৳{sliderBudget.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min={3000}
                max={60000}
                step={500}
                value={sliderBudget}
                onChange={(e) => setSliderBudget(Number(e.target.value))}
                className="vromon-slider w-full"
              />
              <div className="flex justify-between text-[11px] font-medium text-vromon-muted">
                <span>৳3,000</span>
                <span>৳30,000</span>
                <span>৳60,000</span>
              </div>
            </div>

            {/* Division Filter */}
            <div className="space-y-2.5">
              <p className="text-xs font-bold uppercase tracking-wider text-vromon-muted">
                Filter by Division
              </p>
              <div className="flex flex-wrap gap-2">
                {divisions.map((div) => (
                  <button
                    key={div}
                    onClick={() => setDivisionFilter(div)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                      divisionFilter === div
                        ? 'bg-vromon-primary text-white'
                        : 'bg-vromon-leaf border border-vromon-border/50 text-vromon-dark hover:bg-vromon-pill'
                    }`}
                  >
                    {div}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-vromon-canvas p-4 text-xs leading-relaxed text-vromon-muted border border-vromon-pill">
              <strong className="text-vromon-dark block mb-1">Transparent Math Rule</strong>
              Total cost = Round-trip transport + Room nights (1 room per 2 travelers) + Daily food +
              Local fees + 10% safety buffer.
            </div>
          </div>
        </aside>

        {/* Right Feed: Ranked Recommendations */}
        <div className="lg:col-span-8 space-y-6">
          {liveResults.length === 0 ? (
            <div className="rounded-[28px] bg-white p-10 text-center shadow-soft border border-vromon-pill space-y-4">
              <Compass className="mx-auto h-12 w-12 text-vromon-olive" />
              <h3 className="text-xl font-extrabold text-vromon-dark">
                No feasible destinations within current limits
              </h3>
              <p className="mx-auto max-w-md text-sm text-vromon-muted">
                Try increasing the What-If budget slider on the left or adding 1 extra day to allow
                longer travel transit.
              </p>
            </div>
          ) : (
            liveResults.map((item) => {
              const isCompared = compareIds.includes(item.destination_id);
              const isSaved = savedIds.includes(item.destination_id);

              return (
                <article
                  key={item.destination_id}
                  className="overflow-hidden rounded-[28px] bg-white shadow-soft border border-vromon-pill"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12">
                    {/* Photo */}
                    <div className="relative h-56 md:h-auto md:col-span-4 bg-vromon-pill">
                      <img
                        src={
                          item.image_url ||
                          'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80'
                        }
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <FeasibilityBadge status={item.feasibility_status} />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 md:col-span-8 flex flex-col justify-between space-y-5">
                      <div>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex flex-wrap items-baseline gap-2">
                              <h3 className="text-2xl font-extrabold text-vromon-dark">
                                {item.name}
                              </h3>
                              {item.name_bn && (
                                <span className="text-sm font-medium text-vromon-olive">
                                  {item.name_bn}
                                </span>
                              )}
                            </div>
                            <p className="mt-0.5 flex items-center gap-1.5 text-xs font-semibold text-vromon-muted">
                              <MapPin className="h-3.5 w-3.5 text-vromon-primary" />
                              <span>
                                {item.district} District, {item.division} Division
                              </span>
                            </p>
                          </div>

                          <ScoreRing score={item.scores.final_score} size={68} />
                        </div>

                        {/* Grounded AI Explanation */}
                        <div className="mt-4 rounded-2xl bg-vromon-leaf p-4 border border-vromon-pill">
                          <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-vromon-deep">
                            <Sparkles className="h-3.5 w-3.5 text-vromon-primary" />
                            <span>Grounded AI Advisor</span>
                          </div>
                          <p className="text-sm leading-relaxed text-vromon-dark">{item.ai_reason}</p>
                        </div>

                        {/* Verified Key Metrics Grid */}
                        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                          <div className="rounded-2xl bg-vromon-canvas p-3">
                            <span className="block text-[11px] font-semibold text-vromon-muted">
                              Est. Total Cost
                            </span>
                            <span className="text-base font-extrabold text-vromon-deep">
                              ৳{item.cost_breakdown.total_cost.toLocaleString()}
                            </span>
                          </div>

                          <div className="rounded-2xl bg-vromon-canvas p-3">
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-vromon-muted">
                              <Train className="h-3 w-3" /> {item.selected_transport.mode}
                            </span>
                            <span className="text-sm font-bold text-vromon-dark">
                              ৳{item.selected_transport.fare_per_person} / {item.selected_transport.travel_hours}h
                            </span>
                          </div>

                          <div className="rounded-2xl bg-vromon-canvas p-3">
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-vromon-muted">
                              <Clock className="h-3 w-3" /> Usable Time
                            </span>
                            <span className="text-sm font-bold text-vromon-dark">
                              {item.usable_hours} hrs
                            </span>
                          </div>

                          <div className="rounded-2xl bg-vromon-canvas p-3">
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-vromon-muted">
                              <CloudSun className="h-3 w-3" /> Weather / Crowd
                            </span>
                            <span className="text-sm font-bold text-vromon-dark">
                              {item.weather_rating}/5 • {item.effective_crowd}
                            </span>
                          </div>
                        </div>

                        {/* Alternative Recommendation Alert (FR-11) */}
                        {item.alternative_suggestion && (
                          <div className="mt-4 flex flex-col gap-2 rounded-2xl bg-[#fff8e1] border border-vromon-amber/60 p-3.5 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-2 text-xs text-vromon-dark">
                              <AlertTriangle className="h-4 w-4 text-[#b27b00] shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold">
                                  Alternative Option: {item.alternative_suggestion.name}
                                </span>
                                <p className="text-vromon-muted">
                                  {item.alternative_suggestion.reason}
                                </p>
                              </div>
                            </div>
                            <Link
                              href={`/destinations/${item.alternative_suggestion.destination_id}`}
                              className="shrink-0 rounded-full bg-vromon-dark px-3.5 py-1.5 text-xs font-bold text-white hover:opacity-90"
                            >
                              Explore
                            </Link>
                          </div>
                        )}
                      </div>

                      {/* Actions Footer */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-vromon-pill pt-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleCompare(item.destination_id)}
                            className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-xs font-bold transition-colors ${
                              isCompared
                                ? 'bg-vromon-amber text-vromon-dark'
                                : 'border border-vromon-border bg-white text-vromon-dark hover:bg-vromon-leaf'
                            }`}
                          >
                            <GitCompare className="h-3.5 w-3.5" />
                            <span>{isCompared ? 'Added to Compare' : 'Compare'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSaveTrip(item)}
                            className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-xs font-bold transition-colors ${
                              isSaved
                                ? 'bg-vromon-pill text-vromon-deep'
                                : 'border border-vromon-border bg-white text-vromon-dark hover:bg-vromon-leaf'
                            }`}
                          >
                            {isSaved ? <Check className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
                            <span>{isSaved ? 'Saved' : 'Save'}</span>
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/destinations/${item.destination_id}?budget=${sliderBudget}&travelers=${effectiveQuery.travelers}&days=${effectiveQuery.days}&month=${effectiveQuery.travel_month}&city=${encodeURIComponent(effectiveQuery.starting_city)}`}
                            className="inline-flex h-9 items-center rounded-full bg-vromon-pill px-4 text-xs font-bold text-vromon-deep hover:bg-vromon-accent hover:text-white transition-colors"
                          >
                            Breakdown & Map
                          </Link>

                          <Link
                            href={`/itinerary?destId=${item.destination_id}&days=${effectiveQuery.days}&usable=${item.usable_hours}&totalCost=${item.cost_breakdown.total_cost}&status=${encodeURIComponent(item.feasibility_status)}&score=${item.scores.final_score}&budget=${sliderBudget}&travelers=${effectiveQuery.travelers}&month=${effectiveQuery.travel_month}&city=${encodeURIComponent(effectiveQuery.starting_city)}`}
                            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-vromon-primary px-4 text-xs font-bold text-white hover:bg-vromon-deep transition-colors"
                          >
                            <span>Generate Itinerary</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-sm">Loading feasibility engine...</div>}>
      <ResultsInner />
    </Suspense>
  );
}
