'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, Clock, CloudSun, MapPin, Train } from 'lucide-react';
import { calculateBudgetFeasibility, selectOptimalTransport } from '@vromon/shared';
import { apiFetch } from '@/lib/api';
import { DestinationMap } from '@/components/DestinationMap';
import { ClimateChart } from '@/components/ClimateChart';
import { CostChart } from '@/components/CostChart';

export default function DestinationDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;

  const [dest, setDest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const travelers = Number(searchParams.get('travelers') || 2);
  const days = Number(searchParams.get('days') || 2);
  const month = Number(searchParams.get('month') || 12);
  const budget = Number(searchParams.get('budget') || 10000);
  const startingCity = searchParams.get('city') || 'Dhaka';

  useEffect(() => {
    apiFetch(`/destinations/${id}`)
      .then(setDest)
      .catch(() => setDest(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="mx-auto max-w-6xl p-12 text-center text-sm">Loading destination...</div>;
  }

  if (!dest) {
    return (
      <div className="mx-auto max-w-2xl p-16 text-center space-y-4">
        <h1 className="text-2xl font-extrabold text-vromon-dark">Destination not found</h1>
        <Link href="/plan" className="inline-flex rounded-full bg-vromon-primary px-6 py-2.5 text-sm font-bold text-white">
          Back to Catalog
        </Link>
      </div>
    );
  }

  const optimalTransport = selectOptimalTransport(dest.transport_options || [], startingCity) || {
    mode: 'Bus' as const,
    fare_per_person: 650,
    travel_hours: 6,
    city_name: startingCity,
  };

  const budgetCheck = calculateBudgetFeasibility({
    budget,
    travelers,
    days,
    oneWayFarePerPerson: optimalTransport.fare_per_person,
    hotelCostPerRoomNight: dest.hotel_cost_per_room_night,
    foodCostPerPersonDay: dest.food_cost_per_person_day,
    localFeesPerPerson: dest.local_fees_per_person,
  });

  const usableHours = Math.max(4, days * 12 - optimalTransport.travel_hours * 2);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 space-y-8">
      <Link
        href="/plan"
        className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-vromon-dark shadow-soft border border-vromon-pill hover:bg-vromon-pill"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Planner</span>
      </Link>

      {/* Hero Banner */}
      <div className="overflow-hidden rounded-[32px] bg-white shadow-ambient border border-vromon-pill">
        <div className="relative h-72 sm:h-96 w-full bg-vromon-pill">
          <img
            src={dest.image_url || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1400&q=80'}
            alt={dest.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between text-white">
            <div>
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="rounded-full bg-vromon-amber px-3 py-1 text-xs font-bold text-vromon-dark">
                  {dest.division} Division
                </span>
                <span className="rounded-full bg-white/20 backdrop-blur px-3 py-1 text-xs font-bold text-white">
                  {dest.cost_level} Cost Tier
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {dest.name} {dest.name_bn ? `(${dest.name_bn})` : ''}
              </h1>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-white/90">
                <MapPin className="h-4 w-4" />
                <span>{dest.district} District, Bangladesh</span>
              </p>
            </div>

            <Link
              href={`/itinerary?destId=${dest.destination_id}&days=${days}&usable=${usableHours}&totalCost=${budgetCheck.cost_breakdown.total_cost}&status=${encodeURIComponent(budgetCheck.feasibility_status)}&score=88&budget=${budget}&travelers=${travelers}&month=${month}&city=${encodeURIComponent(startingCity)}`}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-vromon-amber px-6 text-sm font-bold text-vromon-dark hover:brightness-95 shrink-0"
            >
              <span>Build Day-by-Day Itinerary</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <p className="text-base leading-relaxed text-vromon-muted max-w-4xl">{dest.description}</p>
          <div className="flex flex-wrap gap-2">
            {(dest.tags || []).map((t: string) => (
              <span
                key={t}
                className="rounded-full bg-vromon-leaf border border-vromon-pill px-3 py-1 text-xs font-semibold text-vromon-deep"
              >
                #{t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Cost Breakdown & Interactive Map */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7 rounded-[28px] bg-white p-6 sm:p-8 shadow-soft border border-vromon-pill space-y-5">
          <div>
            <h2 className="text-xl font-extrabold text-vromon-dark">
              Estimated Cost Breakdown ({days} Days, {travelers} Travelers from {startingCity})
            </h2>
            <p className="text-xs text-vromon-muted mt-0.5">
              Room rate: ৳{dest.hotel_cost_per_room_night.toLocaleString()}/night • Food: ৳
              {dest.food_cost_per_person_day}/person/day
            </p>
          </div>
          <CostChart breakdown={budgetCheck.cost_breakdown} />
        </div>

        <div className="lg:col-span-5 rounded-[28px] bg-white p-6 sm:p-8 shadow-soft border border-vromon-pill space-y-4">
          <h2 className="text-xl font-extrabold text-vromon-dark">Location Map</h2>
          <DestinationMap
            latitude={dest.latitude}
            longitude={dest.longitude}
            name={dest.name}
            district={dest.district}
          />
        </div>
      </div>

      {/* Attractions & Transit Routes */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-6 rounded-[28px] bg-white p-6 sm:p-8 shadow-soft border border-vromon-pill space-y-4">
          <h2 className="text-xl font-extrabold text-vromon-dark">
            Verified Attractions ({dest.attractions?.length || 0})
          </h2>
          <div className="space-y-3">
            {(dest.attractions || []).map((a: any) => (
              <div
                key={a.attraction_id}
                className="flex items-start justify-between gap-4 rounded-2xl bg-vromon-leaf p-4 border border-vromon-pill"
              >
                <div>
                  <h3 className="text-sm font-bold text-vromon-dark">{a.name}</h3>
                  {a.description && <p className="mt-1 text-xs text-vromon-muted">{a.description}</p>}
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-vromon-deep shrink-0">
                  <Clock className="h-3 w-3" /> {a.est_hours}h
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-6 rounded-[28px] bg-white p-6 sm:p-8 shadow-soft border border-vromon-pill space-y-4">
          <h2 className="text-xl font-extrabold text-vromon-dark">Transport Routes & Fares</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-vromon-pill text-xs uppercase tracking-wider text-vromon-muted">
                  <th className="pb-3">Origin City</th>
                  <th className="pb-3">Mode</th>
                  <th className="pb-3">One-Way Fare</th>
                  <th className="pb-3">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-vromon-pill">
                {(dest.transport_options || []).map((tr: any, idx: number) => (
                  <tr key={idx} className="text-vromon-dark">
                    <td className="py-3 font-semibold">{tr.city_name}</td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-vromon-leaf px-2.5 py-0.5 text-xs font-semibold text-vromon-deep">
                        <Train className="h-3 w-3" /> {tr.mode}
                      </span>
                    </td>
                    <td className="py-3 font-bold">৳{tr.fare_per_person}</td>
                    <td className="py-3 text-vromon-muted">{tr.travel_hours} hrs</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 12-Month Climate & Crowd */}
      <div className="rounded-[28px] bg-white p-6 sm:p-8 shadow-soft border border-vromon-pill space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-vromon-dark flex items-center gap-2">
              <CloudSun className="h-5 w-5 text-vromon-primary" />
              <span>Seasonal Weather & Crowd Forecast</span>
            </h2>
            <p className="text-xs text-vromon-muted mt-0.5">
              Hover any month bar to view expected weather rating (1-5) and crowd density.
            </p>
          </div>
        </div>
        <ClimateChart conditions={dest.monthly_conditions || []} highlightMonth={month} />
      </div>
    </div>
  );
}
