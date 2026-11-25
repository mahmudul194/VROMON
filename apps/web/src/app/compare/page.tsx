'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, GitCompare, Plus, X } from 'lucide-react';
import { apiFetch } from '@/lib/api';

function CompareInner() {
  const searchParams = useSearchParams();
  const [allDestinations, setAllDestinations] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    apiFetch<any[]>('/destinations').then((list) => {
      setAllDestinations(list);
      const paramIds = (searchParams.get('ids') || '')
        .split(',')
        .map((n) => parseInt(n, 10))
        .filter((n) => !Number.isNaN(n));

      if (paramIds.length > 0) {
        setSelectedIds(paramIds.slice(0, 3));
      } else if (list.length >= 3) {
        // Default helpful comparison across popular districts
        const defaults = list
          .filter((d) => ['Khulna', 'Moulvibazar', 'Rangamati'].includes(d.name))
          .map((d) => d.destination_id);
        setSelectedIds(defaults.length >= 2 ? defaults : list.slice(0, 3).map((d) => d.destination_id));
      }
    });
  }, [searchParams]);

  const selectedDests = selectedIds
    .map((id) => allDestinations.find((d) => d.destination_id === id))
    .filter(Boolean);

  const handleAdd = (idStr: string) => {
    const id = Number(idStr);
    if (!id || selectedIds.includes(id) || selectedIds.length >= 3) return;
    setSelectedIds([...selectedIds, id]);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10 space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-vromon-pill px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-vromon-deep">
            <GitCompare className="h-3.5 w-3.5" />
            <span>Comparison Matrix</span>
          </span>
          <h1 className="mt-2 text-3xl font-extrabold text-vromon-dark">
            Compare up to 3 destinations side by side
          </h1>
        </div>

        {selectedIds.length < 3 && (
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-vromon-primary" />
            <select
              value=""
              onChange={(e) => handleAdd(e.target.value)}
              className="h-11 rounded-full border border-vromon-border bg-white px-4 text-sm font-semibold text-vromon-dark"
            >
              <option value="">Add destination to compare...</option>
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

      {selectedDests.length === 0 ? (
        <div className="rounded-[28px] bg-white p-12 text-center text-sm text-vromon-muted">
          Select destinations above to compare metrics side by side.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[28px] bg-white shadow-ambient border border-vromon-pill">
          <table className="w-full min-w-[680px] text-left border-collapse">
            <thead>
              <tr className="border-b border-vromon-pill bg-vromon-leaf">
                <th className="p-5 text-xs font-bold uppercase tracking-wider text-vromon-muted w-48">
                  Metric
                </th>
                {selectedDests.map((d) => (
                  <th key={d.destination_id} className="p-5 align-top">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-lg font-extrabold text-vromon-dark">{d.name}</p>
                        <p className="text-xs font-semibold text-vromon-olive">{d.division}</p>
                      </div>
                      <button
                        onClick={() =>
                          setSelectedIds(selectedIds.filter((id) => id !== d.destination_id))
                        }
                        className="rounded-full p-1 text-vromon-muted hover:bg-red-50 hover:text-vromon-danger"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-vromon-pill text-sm">
              <tr>
                <td className="p-5 font-bold text-vromon-muted">Cost Level</td>
                {selectedDests.map((d) => (
                  <td key={d.destination_id} className="p-5 font-bold text-vromon-dark">
                    <span className="rounded-full bg-vromon-pill px-3 py-1 text-xs text-vromon-deep">
                      {d.cost_level}
                    </span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-5 font-bold text-vromon-muted">Hotel Room / Night</td>
                {selectedDests.map((d) => (
                  <td key={d.destination_id} className="p-5 font-extrabold text-vromon-deep">
                    ৳{d.hotel_cost_per_room_night.toLocaleString()}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-5 font-bold text-vromon-muted">Food / Person / Day</td>
                {selectedDests.map((d) => (
                  <td key={d.destination_id} className="p-5 font-semibold text-vromon-dark">
                    ৳{d.food_cost_per_person_day.toLocaleString()}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-5 font-bold text-vromon-muted">Min Time Needed</td>
                {selectedDests.map((d) => (
                  <td key={d.destination_id} className="p-5 text-vromon-dark">
                    {d.min_hours_needed} hours
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-5 font-bold text-vromon-muted">Dhaka Transit (Cheapest)</td>
                {selectedDests.map((d) => {
                  const dhakaOpts = (d.transport_options || []).filter(
                    (t: any) => t.city_name === 'Dhaka',
                  );
                  const best = [...dhakaOpts].sort(
                    (a: any, b: any) => a.fare_per_person - b.fare_per_person,
                  )[0];
                  return (
                    <td key={d.destination_id} className="p-5 text-vromon-dark">
                      {best ? `${best.mode} • ৳${best.fare_per_person} (${best.travel_hours}h)` : 'N/A'}
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="p-5 font-bold text-vromon-muted">Verified Attractions</td>
                {selectedDests.map((d) => (
                  <td key={d.destination_id} className="p-5 text-xs text-vromon-muted leading-relaxed">
                    {(d.attractions || []).map((a: any) => a.name).join(', ')}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-5 font-bold text-vromon-muted">Explore</td>
                {selectedDests.map((d) => (
                  <td key={d.destination_id} className="p-5">
                    <Link
                      href={`/destinations/${d.destination_id}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-vromon-primary px-4 py-2 text-xs font-bold text-white hover:bg-vromon-deep"
                    >
                      <span>View Detail</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm">Loading comparison...</div>}>
      <CompareInner />
    </Suspense>
  );
}
