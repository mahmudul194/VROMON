'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, GitCompare, Loader2, MapPin, Plus, SlidersHorizontal, X } from 'lucide-react';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import {
  calculateAvailableTime,
  calculateBudgetFeasibility,
  calculateCrowdEvaluation,
  calculateWeatherScore,
  selectOptimalTransport,
} from '@vromon/shared';
import { apiFetch } from '@/lib/api';
import { FeasibilityBadge } from '@/components/FeasibilityBadge';
import { ScoreRing } from '@/components/ScoreRing';

const RADAR_COLORS = ['#2F6B2F', '#FFCB3D', '#3B82F6'];

function CompareInner() {
  const searchParams = useSearchParams();
  const [allDestinations, setAllDestinations] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const [budget, setBudget] = useState(Number(searchParams.get('budget') || 15000));
  const [days, setDays] = useState(Number(searchParams.get('days') || 3));
  const [travelers, setTravelers] = useState(Number(searchParams.get('travelers') || 2));
  const month = Number(searchParams.get('month') || 12);
  const city = searchParams.get('city') || 'Dhaka';

  useEffect(() => {
    setLoading(true);
    apiFetch<any[]>('/destinations')
      .then((list) => {
        setAllDestinations(list);
        const paramIds = (searchParams.get('ids') || '')
          .split(',')
          .map((n) => parseInt(n, 10))
          .filter((n) => !Number.isNaN(n));

        if (paramIds.length > 0) {
          setSelectedIds(paramIds.slice(0, 3));
        } else if (list.length >= 3) {
          const defaults = list
            .filter((d) => ['Khulna', 'Moulvibazar', 'Rangamati'].includes(d.name))
            .map((d) => d.destination_id);
          setSelectedIds(defaults.length >= 2 ? defaults : list.slice(0, 3).map((d) => d.destination_id));
        }
      })
      .finally(() => setLoading(false));
  }, [searchParams]);

  const evaluated = useMemo(() => {
    return selectedIds
      .map((id) => allDestinations.find((d) => d.destination_id === id))
      .filter(Boolean)
      .map((dest) => {
        const transport = selectOptimalTransport(dest.transport_options || [], city) || {
          mode: 'Bus' as const,
          fare_per_person: 700,
          travel_hours: 6,
          city_name: city,
        };
        const budgetRes = calculateBudgetFeasibility({
          budget,
          travelers,
          days,
          oneWayFarePerPerson: transport.fare_per_person,
          hotelCostPerRoomNight: dest.hotel_cost_per_room_night,
          foodCostPerPersonDay: dest.food_cost_per_person_day,
          localFeesPerPerson: dest.local_fees_per_person,
        });
        const timeRes = calculateAvailableTime(days, transport.travel_hours, dest.min_hours_needed || 8);
        const monthCond = (dest.monthly_conditions || []).find((m: any) => m.month_no === month);
        const weatherRating = monthCond?.weather_rating ?? 4;
        const crowdLevel = (monthCond?.crowd_level ?? 'Medium') as 'Low' | 'Medium' | 'High';
        const weatherScore = calculateWeatherScore(weatherRating);
        const crowdEval = calculateCrowdEvaluation(crowdLevel, false);

        const overallScore = Math.round(
          budgetRes.budget_score * 0.4 +
            timeRes.time_score * 0.25 +
            weatherScore * 0.2 +
            crowdEval.crowd_score * 0.15,
        );

        return {
          dest,
          transport,
          budgetRes,
          timeRes,
          weatherRating,
          weatherScore,
          crowdEval,
          overallScore,
        };
      });
  }, [selectedIds, allDestinations, city, budget, travelers, days, month]);

  const lowestCost = evaluated.length
    ? Math.min(...evaluated.map((e) => e.budgetRes.cost_breakdown.total_cost))
    : 0;
  const highestScore = evaluated.length
    ? Math.max(...evaluated.map((e) => e.overallScore))
    : 0;

  const radarData = useMemo(() => {
    const metrics = [
      { key: 'Budget Fit', get: (e: any) => e.budgetRes.budget_score },
      { key: 'Time Fit', get: (e: any) => e.timeRes.time_score },
      { key: 'Climate', get: (e: any) => e.weatherScore },
      { key: 'Crowd Calm', get: (e: any) => e.crowdEval.crowd_score },
      { key: 'Overall', get: (e: any) => e.overallScore },
    ];
    return metrics.map((m) => {
      const row: any = { metric: m.key };
      evaluated.forEach((e) => {
        row[e.dest.name] = Math.round(m.get(e));
      });
      return row;
    });
  }, [evaluated]);

  const handleAdd = (idStr: string) => {
    const id = Number(idStr);
    if (!id || selectedIds.includes(id) || selectedIds.length >= 3) return;
    setSelectedIds([...selectedIds, id]);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#2F6B2F]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1240px] space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eaf7e6] px-3.5 py-1 text-[13px] font-semibold uppercase tracking-[0.06em] text-[#2F6B2F]">
            <GitCompare className="h-3.5 w-3.5" />
            Side-by-Side Comparison Matrix
          </span>
          <h1 className="mt-2 text-[36px] md:text-[40px] font-extrabold tracking-tight text-[#1F2A1F]">
            Compare up to 3 districts head-to-head
          </h1>
        </div>

        {selectedIds.length < 3 && (
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-[#2F6B2F]" />
            <select
              value=""
              onChange={(e) => handleAdd(e.target.value)}
              className="h-11 rounded-full border border-[#D5E6CF] bg-white px-4 text-[14px] font-bold text-[#1F2A1F] shadow-sm focus:border-[#2F6B2F] focus:outline-none"
            >
              <option value="">Add destination ({selectedIds.length}/3)...</option>
              {allDestinations
                .filter((d) => !selectedIds.includes(d.destination_id))
                .map((d) => (
                  <option key={d.destination_id} value={d.destination_id}>
                    {d.name} ({d.division})
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>

      {/* Stitch 11_compare Dynamic Budget Filter Strip */}
      <div className="grid grid-cols-1 items-center gap-5 rounded-[26px] border border-[#D5E6CF]/70 bg-white p-6 shadow-sm md:grid-cols-12">
        <div className="space-y-2 md:col-span-6">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[14px] font-extrabold uppercase tracking-wider text-[#557945]">
              <SlidersHorizontal className="h-3.5 w-3.5 text-[#2F6B2F]" />
              Dynamic Budget Filter
            </span>
            <span className="rounded-full bg-[#2F6B2F] px-3 py-0.5 text-[14px] font-black text-white">
              ৳{budget.toLocaleString()}
            </span>
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
        </div>

        <div className="grid grid-cols-2 gap-3 md:col-span-6">
          <div className="rounded-2xl bg-[#F6FAF3] px-4 py-2.5 border border-[#E5F0E0]">
            <span className="block text-[14px] font-bold uppercase text-[#557945]">Days</span>
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="mt-0.5 w-full bg-transparent text-[14px] font-extrabold text-[#1F2A1F] focus:outline-none"
            >
              {[1, 2, 3, 4, 5, 7].map((d) => (
                <option key={d} value={d}>
                  {d} Day{d > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="rounded-2xl bg-[#F6FAF3] px-4 py-2.5 border border-[#E5F0E0]">
            <span className="block text-[14px] font-bold uppercase text-[#557945]">Travelers</span>
            <select
              value={travelers}
              onChange={(e) => setTravelers(Number(e.target.value))}
              className="mt-0.5 w-full bg-transparent text-[14px] font-extrabold text-[#1F2A1F] focus:outline-none"
            >
              {[1, 2, 3, 4, 6, 8].map((t) => (
                <option key={t} value={t}>
                  {t} {t === 1 ? 'Person' : 'People'}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3-Col Comparison Table */}
      {evaluated.length > 0 && (
        <div className="overflow-x-auto rounded-[28px] border border-[#D5E6CF]/70 bg-white shadow-sm">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#E5F0E0] bg-[#F6FAF3]">
                <th className="w-48 p-5 text-[14px] font-extrabold uppercase tracking-wider text-[#557945]">
                  Feasibility Metric
                </th>
                {evaluated.map((e) => (
                  <th key={e.dest.destination_id} className="p-5 align-top">
                    <div className="space-y-3">
                      <div className="relative h-28 overflow-hidden rounded-2xl bg-[#E5F0E0]">
                        <img
                          src={
                            e.dest.image_url ||
                            'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&q=80'
                          }
                          alt={e.dest.name}
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedIds(selectedIds.filter((id) => id !== e.dest.destination_id))
                          }
                          aria-label={`Remove ${e.dest.name}`}
                          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[#1F2A1F] shadow hover:bg-white"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-lg font-extrabold text-[#1F2A1F]">{e.dest.name}</p>
                          <p className="flex items-center gap-1 text-[14px] font-semibold text-[#557945]">
                            <MapPin className="h-3 w-3 text-[#2F6B2F]" />
                            {e.dest.division}
                          </p>
                        </div>
                        <ScoreRing score={e.overallScore} size={52} />
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5F0E0] text-[14px]">
              <tr>
                <td className="p-5 font-bold text-[#557945]">Budget Feasibility</td>
                {evaluated.map((e) => (
                  <td key={e.dest.destination_id} className="p-5">
                    <FeasibilityBadge status={e.budgetRes.feasibility_status} />
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-5 font-bold text-[#557945]">Estimated Total Cost</td>
                {evaluated.map((e) => {
                  const isBest = e.budgetRes.cost_breakdown.total_cost === lowestCost;
                  return (
                    <td
                      key={e.dest.destination_id}
                      className={`p-5 font-extrabold ${
                        isBest ? 'bg-[#fff8e1]/70 text-[#2F6B2F]' : 'text-[#1F2A1F]'
                      }`}
                    >
                      ৳{e.budgetRes.cost_breakdown.total_cost.toLocaleString()}
                      {isBest && (
                        <span className="ml-2 rounded-full bg-[#FFCB3D] px-2 py-0.5 text-[14px] font-black text-[#1F2A1F]">
                          BEST VALUE
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="p-5 font-bold text-[#557945]">Optimal Transit ({city})</td>
                {evaluated.map((e) => (
                  <td key={e.dest.destination_id} className="p-5 font-semibold text-[#1F2A1F]">
                    {e.transport.mode} • {e.transport.travel_hours}h (৳{e.transport.fare_per_person})
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-5 font-bold text-[#557945]">Usable Explore Time</td>
                {evaluated.map((e) => (
                  <td key={e.dest.destination_id} className="p-5 font-semibold text-[#1F2A1F]">
                    {e.timeRes.usable_hours} hrs
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-5 font-bold text-[#557945]">Room Rate / Night</td>
                {evaluated.map((e) => (
                  <td key={e.dest.destination_id} className="p-5 font-semibold text-[#1F2A1F]">
                    ৳{e.dest.hotel_cost_per_room_night.toLocaleString()}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-5 font-bold text-[#557945]">Climate &amp; Crowd</td>
                {evaluated.map((e) => (
                  <td key={e.dest.destination_id} className="p-5 font-semibold text-[#1F2A1F]">
                    {e.weatherRating}/5 Weather • {e.crowdEval.effective_crowd} Crowd
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-5 font-bold text-[#557945]">Select Plan</td>
                {evaluated.map((e) => {
                  const isTop = e.overallScore === highestScore;
                  return (
                    <td key={e.dest.destination_id} className="p-5">
                      <Link
                        href={`/itinerary?destId=${e.dest.destination_id}&days=${days}&usable=${e.timeRes.usable_hours}&totalCost=${e.budgetRes.cost_breakdown.total_cost}&status=${encodeURIComponent(e.budgetRes.feasibility_status)}&score=${e.overallScore}&budget=${budget}&travelers=${travelers}&month=${month}&city=${encodeURIComponent(city)}`}
                        className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[14px] font-extrabold transition ${
                          isTop
                            ? 'bg-[#FFCB3D] text-[#1F2A1F]'
                            : 'bg-[#2F6B2F] text-white hover:bg-[#145219]'
                        }`}
                      >
                        Choose {e.dest.name}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Multi-Dimensional Suitability Radar Overlay */}
      {evaluated.length >= 2 && (
        <div className="rounded-[28px] border border-[#D5E6CF]/70 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-4">
            <h2 className="text-xl font-extrabold text-[#1F2A1F]">
              Multi-dimensional Suitability Overlay
            </h2>
            <p className="mt-0.5 text-[14px] text-[#557945]">
              Visualizing how each district scores across Budget Fit, Time Fit, Climate, and Crowd Calm.
            </p>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#D5E6CF" />
                <PolarAngleAxis
                  dataKey="metric"
                  tick={{ fill: '#1F2A1F', fontSize: 12, fontWeight: 700 }}
                />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#557945', fontSize: 10 }} />
                {evaluated.map((e, idx) => (
                  <Radar
                    key={e.dest.destination_id}
                    name={e.dest.name}
                    dataKey={e.dest.name}
                    stroke={RADAR_COLORS[idx % RADAR_COLORS.length]}
                    fill={RADAR_COLORS[idx % RADAR_COLORS.length]}
                    fillOpacity={0.2}
                    strokeWidth={2.5}
                  />
                ))}
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#2F6B2F]" />
        </div>
      }
    >
      <CompareInner />
    </Suspense>
  );
}
