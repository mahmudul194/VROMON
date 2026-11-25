'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Calendar, Compass, MapPin, Search, Users, Wallet } from 'lucide-react';
import { apiFetch } from '@/lib/api';

const DIVISIONS = [
  'All',
  'Dhaka',
  'Chattogram',
  'Sylhet',
  'Khulna',
  'Rajshahi',
  'Barishal',
  'Rangpur',
  'Mymensingh',
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function PlanPage() {
  const router = useRouter();
  const [wishes, setWishes] = useState(
    'hey i want to go to khulna what are the places to see around, what kind of food i can explore there, i have 10k budget will it be suffecient and we are 2 people where can we stay what are the hotel price rates',
  );
  const [budget, setBudget] = useState(10000);
  const [travelers, setTravelers] = useState(2);
  const [days, setDays] = useState(2);
  const [travelMonth, setTravelMonth] = useState(12);
  const [startingCity, setStartingCity] = useState('Dhaka');
  const [hasHoliday, setHasHoliday] = useState(false);

  const [destinations, setDestinations] = useState<any[]>([]);
  const [activeDivision, setActiveDivision] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    apiFetch<any[]>('/destinations')
      .then(setDestinations)
      .catch(() => {});
  }, []);

  const handlePlan = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({
      wishes: wishes.trim(),
      budget: String(budget),
      travelers: String(travelers),
      days: String(days),
      travel_month: String(travelMonth),
      starting_city: startingCity,
      has_holiday: String(hasHoliday),
    });
    router.push(`/results?${params.toString()}`);
  };

  const filtered = destinations.filter((d) => {
    const matchDiv = activeDivision === 'All' || d.division === activeDivision;
    const matchSearch =
      !searchTerm.trim() ||
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.name_bn && d.name_bn.includes(searchTerm));
    return matchDiv && matchSearch;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10 space-y-14">
      {/* Planner Form */}
      <section className="rounded-[28px] bg-white p-6 sm:p-8 shadow-ambient border border-vromon-pill">
        <div className="mb-6">
          <span className="inline-block rounded-full bg-vromon-pill px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-vromon-deep">
            Trip Feasibility Planner
          </span>
          <h1 className="mt-2 text-2xl font-extrabold text-vromon-dark sm:text-3xl">
            Customize your trip constraints
          </h1>
        </div>

        <form onSubmit={handlePlan} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-vromon-muted">
              What are you looking for?
            </label>
            <textarea
              rows={3}
              required
              value={wishes}
              onChange={(e) => setWishes(e.target.value)}
              className="w-full rounded-2xl border border-vromon-border/70 bg-vromon-leaf px-4 py-3 text-sm sm:text-base text-vromon-dark focus:border-vromon-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-vromon-muted">
                <Wallet className="h-3.5 w-3.5 text-vromon-primary" />
                <span>Total Budget (BDT)</span>
              </label>
              <input
                type="number"
                min={1000}
                step={500}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="h-11 w-full rounded-full border border-vromon-border/70 bg-vromon-leaf px-4 text-sm font-semibold text-vromon-dark"
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-vromon-muted">
                <Users className="h-3.5 w-3.5 text-vromon-primary" />
                <span>Travelers</span>
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={travelers}
                onChange={(e) => setTravelers(Number(e.target.value))}
                className="h-11 w-full rounded-full border border-vromon-border/70 bg-vromon-leaf px-4 text-sm font-semibold text-vromon-dark"
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-vromon-muted">
                <Calendar className="h-3.5 w-3.5 text-vromon-primary" />
                <span>Days</span>
              </label>
              <input
                type="number"
                min={1}
                max={14}
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="h-11 w-full rounded-full border border-vromon-border/70 bg-vromon-leaf px-4 text-sm font-semibold text-vromon-dark"
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-vromon-muted">
                <Compass className="h-3.5 w-3.5 text-vromon-primary" />
                <span>Travel Month</span>
              </label>
              <select
                value={travelMonth}
                onChange={(e) => setTravelMonth(Number(e.target.value))}
                className="h-11 w-full rounded-full border border-vromon-border/70 bg-vromon-leaf px-4 text-sm font-semibold text-vromon-dark"
              >
                {MONTHS.map((m, idx) => (
                  <option key={m} value={idx + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-vromon-muted">
                <MapPin className="h-3.5 w-3.5 text-vromon-primary" />
                <span>Starting City</span>
              </label>
              <select
                value={startingCity}
                onChange={(e) => setStartingCity(e.target.value)}
                className="h-11 w-full rounded-full border border-vromon-border/70 bg-vromon-leaf px-4 text-sm font-semibold text-vromon-dark"
              >
                {['Dhaka', 'Chattogram', 'Sylhet', 'Rajshahi', 'Khulna', 'Barishal', 'Rangpur', 'Mymensingh'].map(
                  (c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-2">
            <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm font-medium text-vromon-muted">
              <input
                type="checkbox"
                checked={hasHoliday}
                onChange={(e) => setHasHoliday(e.target.checked)}
                className="h-4 w-4 rounded accent-vromon-primary"
              />
              <span>Weekend / National Holiday trip</span>
            </label>

            <button
              type="submit"
              className="group inline-flex h-12 items-center justify-center gap-3 rounded-full bg-vromon-primary pl-6 pr-2.5 text-sm font-semibold text-white hover:bg-vromon-deep"
            >
              <span>Analyze Destinations</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-vromon-amber text-vromon-dark">
                <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
              </span>
            </button>
          </div>
        </form>
      </section>

      {/* All 64 Districts Catalog Browser */}
      <section className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-vromon-dark">
              Bangladesh 64-District Catalog ({filtered.length})
            </h2>
            <p className="text-sm text-vromon-muted">
              Explore verified transit fares, hotel tiers, and monthly weather notes.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-vromon-olive" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search district..."
              className="h-11 w-full rounded-full border border-vromon-border/70 bg-white pl-11 pr-4 text-sm text-vromon-dark focus:border-vromon-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Division Filter Chips */}
        <div className="flex flex-wrap gap-2">
          {DIVISIONS.map((div) => {
            const active = activeDivision === div;
            return (
              <button
                key={div}
                onClick={() => setActiveDivision(div)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? 'bg-vromon-primary text-white'
                    : 'bg-white border border-vromon-border/70 text-vromon-dark hover:bg-vromon-pill'
                }`}
              >
                {div}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((d) => (
            <Link
              key={d.destination_id}
              href={`/destinations/${d.destination_id}`}
              className="group flex h-full flex-col overflow-hidden rounded-[26px] bg-white shadow-soft border border-vromon-pill hover:-translate-y-1 transition-transform"
            >
              <div className="relative h-44 w-full bg-vromon-pill overflow-hidden">
                <img
                  src={d.image_url || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80'}
                  alt={d.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-vromon-dark">
                  {d.division}
                </span>
              </div>

              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-lg font-bold text-vromon-dark">{d.name}</h3>
                    {d.name_bn && (
                      <span className="text-xs font-medium text-vromon-olive">{d.name_bn}</span>
                    )}
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-xs text-vromon-muted leading-relaxed">
                    {d.description}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-vromon-pill pt-3 text-xs font-semibold text-vromon-muted">
                  <span>Room ~৳{d.hotel_cost_per_room_night.toLocaleString()}</span>
                  <span className="text-vromon-primary">Details & Map</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
