'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Calendar,
  Compass,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

const QUICK_PROMPTS = [
  'Quiet hill place with tea gardens in winter under 15,000 taka for 2 people',
  'Hey I want to go to Khulna, places to see, food to explore, 10k budget for 2 people and hotel rates',
  'Budget coastal beach trip with sunset views for 3 days from Dhaka',
  '1 day heritage and history trip near Dhaka under 4,000 taka',
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const CITIES = ['Dhaka', 'Chattogram', 'Sylhet', 'Rajshahi', 'Khulna', 'Barishal', 'Rangpur', 'Mymensingh'];

export default function HomePage() {
  const router = useRouter();
  const [wishes, setWishes] = useState('');
  const [budget, setBudget] = useState(15000);
  const [travelers, setTravelers] = useState(2);
  const [days, setDays] = useState(3);
  const [travelMonth, setTravelMonth] = useState(12);
  const [startingCity, setStartingCity] = useState('Dhaka');
  const [hasHoliday, setHasHoliday] = useState(false);

  const [featured, setFeatured] = useState<any[]>([]);

  useEffect(() => {
    apiFetch<any[]>('/destinations')
      .then((list) => {
        const showcaseNames = ['Sajek', 'Moulvibazar', 'Khulna', "Cox's Bazar", 'Rangamati', 'Sunamganj'];
        const picked = list.filter((d) =>
          showcaseNames.some((n) => d.name.toLowerCase().includes(n.toLowerCase())),
        );
        setFeatured((picked.length >= 3 ? picked : list).slice(0, 6));
      })
      .catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wishes.trim()) return;
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

  return (
    <div className="pb-16">
      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-10 lg:pt-14">
        <div className="mx-auto max-w-4xl text-center space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-vromon-pill px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-vromon-deep">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
            <span>64 Districts Feasibility Engine</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-vromon-dark sm:text-5xl lg:text-6xl leading-[1.08]">
            Plan trips across Bangladesh that actually fit your budget and time.
          </h1>

          <p className="mx-auto max-w-2xl text-base text-vromon-muted sm:text-lg leading-relaxed">
            Describe your ideal getaway in natural words. VROMON verifies transit hours, hotel
            rates, seasonal weather, and crowd levels before recommending a single place.
          </p>
        </div>

        {/* Elevated Trip Search Shell */}
        <form
          onSubmit={handleSearch}
          className="mx-auto mt-10 max-w-5xl rounded-[28px] bg-white p-5 sm:p-8 shadow-ambient border border-vromon-pill"
        >
          <div className="space-y-4">
            <label className="block text-xs font-bold uppercase tracking-widest text-vromon-olive">
              Describe your trip wish
            </label>
            <textarea
              rows={3}
              value={wishes}
              onChange={(e) => setWishes(e.target.value)}
              placeholder="Example: hey i want to go to khulna, what places to see, food to explore, 10k budget for 2 people and hotel rates..."
              className="w-full resize-none rounded-2xl border border-vromon-border/70 bg-vromon-leaf px-4 py-3.5 text-base text-vromon-dark placeholder:text-vromon-muted/60 focus:border-vromon-primary focus:outline-none focus:ring-2 focus:ring-vromon-primary/20"
              required
            />

            {/* Quick Suggestion Chips with clean flex-wrap */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-semibold text-vromon-muted mr-1">Try:</span>
              {QUICK_PROMPTS.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setWishes(chip)}
                  className="rounded-full border border-vromon-border/70 bg-white px-3.5 py-1.5 text-xs font-medium text-vromon-dark hover:border-vromon-primary hover:bg-vromon-leaf transition-colors text-left"
                >
                  {chip.length > 52 ? `${chip.slice(0, 52)}...` : chip}
                </button>
              ))}
            </div>
          </div>

          {/* Numeric & Selector Controls */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 border-t border-vromon-pill pt-6">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-vromon-muted">
                <Wallet className="h-3.5 w-3.5 text-vromon-primary" />
                <span>Budget (BDT)</span>
              </label>
              <input
                type="number"
                min={1000}
                step={500}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="h-11 w-full rounded-full border border-vromon-border/70 bg-vromon-leaf px-4 text-sm font-semibold text-vromon-dark focus:border-vromon-primary focus:outline-none"
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
                className="h-11 w-full rounded-full border border-vromon-border/70 bg-vromon-leaf px-4 text-sm font-semibold text-vromon-dark focus:border-vromon-primary focus:outline-none"
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
                className="h-11 w-full rounded-full border border-vromon-border/70 bg-vromon-leaf px-4 text-sm font-semibold text-vromon-dark focus:border-vromon-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-vromon-muted">
                <Compass className="h-3.5 w-3.5 text-vromon-primary" />
                <span>Month</span>
              </label>
              <select
                value={travelMonth}
                onChange={(e) => setTravelMonth(Number(e.target.value))}
                className="h-11 w-full rounded-full border border-vromon-border/70 bg-vromon-leaf px-4 text-sm font-semibold text-vromon-dark focus:border-vromon-primary focus:outline-none"
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
                <span>Origin City</span>
              </label>
              <select
                value={startingCity}
                onChange={(e) => setStartingCity(e.target.value)}
                className="h-11 w-full rounded-full border border-vromon-border/70 bg-vromon-leaf px-4 text-sm font-semibold text-vromon-dark focus:border-vromon-primary focus:outline-none"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bottom Bar: Weekend Toggle + CTA */}
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <label className="inline-flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={hasHoliday}
                onChange={(e) => setHasHoliday(e.target.checked)}
                className="h-4 w-4 rounded accent-vromon-primary"
              />
              <span className="text-sm font-medium text-vromon-muted">
                Includes weekend or national holiday (adjusts crowd forecast)
              </span>
            </label>

            <button
              type="submit"
              className="group inline-flex h-12 items-center justify-center gap-3 rounded-full bg-vromon-primary pl-6 pr-2.5 text-sm font-semibold text-white transition-all hover:bg-vromon-deep shadow-sm shrink-0"
            >
              <span>Check Trip Feasibility</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-vromon-amber text-vromon-dark transition-transform group-hover:translate-x-0.5">
                <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
              </span>
            </button>
          </div>
        </form>
      </section>

      {/* How VROMON Works — Equal Height Bento Grid */}
      <section className="mx-auto mt-20 max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="mb-10 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-vromon-olive">
              Methodology
            </p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-vromon-dark sm:text-3xl">
              Zero guesswork, verified travel math
            </h2>
          </div>
          <p className="max-w-md text-sm text-vromon-muted">
            Every recommendation balances six scored dimensions without inventing fake prices.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            {
              step: '01',
              title: 'Multi-Intent Semantic Parsing',
              desc: 'LangChain and Gemini extract your travel mood, destination hints, budget, and food or stay questions in English, Bangla, or Banglish.',
            },
            {
              step: '02',
              title: 'Pure Feasibility Math',
              desc: 'Round-trip bus or train fares, double-room hotel nights, meals, 10% buffer, and 12h/day usable hours are computed deterministically.',
            },
            {
              step: '03',
              title: 'Grounded Itineraries & Alternatives',
              desc: 'If a top match runs tight or crowded, VROMON finds a quieter semantic alternative and builds a day-by-day plan from real attractions.',
            },
          ].map((card) => (
            <div
              key={card.step}
              className="flex h-full flex-col justify-between rounded-[28px] bg-white p-7 shadow-soft border border-vromon-pill"
            >
              <div className="space-y-4">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-vromon-pill text-sm font-extrabold text-vromon-deep">
                  {card.step}
                </span>
                <h3 className="text-lg font-bold text-vromon-dark">{card.title}</h3>
                <p className="text-sm leading-relaxed text-vromon-muted">{card.desc}</p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-vromon-primary">
                <ShieldCheck className="h-4 w-4" />
                <span>Verified against 64-district catalog</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Destinations */}
      {featured.length > 0 && (
        <section className="mx-auto mt-20 max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-vromon-olive">
                Curated Catalog
              </p>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-vromon-dark sm:text-3xl">
                Explore Bangladesh by Division
              </h2>
            </div>
            <Link
              href="/plan"
              className="hidden sm:inline-flex items-center gap-2 rounded-full bg-vromon-pill px-4 py-2 text-xs font-bold text-vromon-deep hover:bg-vromon-accent hover:text-white transition-colors"
            >
              <span>Browse all 64 districts</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((dest) => (
              <Link
                key={dest.destination_id}
                href={`/destinations/${dest.destination_id}`}
                className="group flex h-full flex-col overflow-hidden rounded-[28px] bg-white shadow-soft border border-vromon-pill transition-transform hover:-translate-y-1"
              >
                <div className="relative h-52 w-full overflow-hidden bg-vromon-pill">
                  <img
                    src={dest.image_url || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1000&q=80'}
                    alt={dest.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-vromon-dark backdrop-blur">
                      {dest.division}
                    </span>
                    <span className="rounded-full bg-vromon-amber px-3 py-1 text-xs font-bold text-vromon-dark">
                      {dest.cost_level} Cost
                    </span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col justify-between p-6">
                  <div>
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="text-xl font-bold text-vromon-dark">{dest.name}</h3>
                      {dest.name_bn && (
                        <span className="text-sm font-medium text-vromon-olive">
                          {dest.name_bn}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-vromon-muted leading-relaxed">
                      {dest.description}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-vromon-pill pt-4 text-xs font-semibold text-vromon-muted">
                    <span>Hotel ~৳{dest.hotel_cost_per_room_night.toLocaleString()}/night</span>
                    <span className="inline-flex items-center gap-1 text-vromon-primary group-hover:underline">
                      <span>View details</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
