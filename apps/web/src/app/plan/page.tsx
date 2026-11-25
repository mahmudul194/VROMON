'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Calendar,
  Compass,
  Landmark,
  MapPin,
  Minus,
  Mountain,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Trees,
  TrendingUp,
  Users,
  Utensils,
  Wallet,
  Waves,
} from 'lucide-react';
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
  { num: 1, short: 'Jan', full: 'January' },
  { num: 2, short: 'Feb', full: 'February' },
  { num: 3, short: 'Mar', full: 'March' },
  { num: 4, short: 'Apr', full: 'April' },
  { num: 5, short: 'May', full: 'May' },
  { num: 6, short: 'Jun', full: 'June' },
  { num: 7, short: 'Jul', full: 'July' },
  { num: 8, short: 'Aug', full: 'August' },
  { num: 9, short: 'Sep', full: 'September' },
  { num: 10, short: 'Oct', full: 'October' },
  { num: 11, short: 'Nov', full: 'November' },
  { num: 12, short: 'Dec', full: 'December' },
];

const CITIES = [
  'Dhaka',
  'Chattogram',
  'Sylhet',
  'Rajshahi',
  'Khulna',
  'Barishal',
  'Rangpur',
  'Mymensingh',
];

const VIBES = [
  { label: 'Hills & Nature', keyword: 'scenic hills and nature', icon: Mountain },
  { label: 'Tea Gardens', keyword: 'tea gardens and misty mornings', icon: Trees },
  { label: 'Beach & Islands', keyword: 'beach and coastal views', icon: Waves },
  { label: 'Heritage & Ruins', keyword: 'historical heritage and architecture', icon: Landmark },
  { label: 'Local Street Food', keyword: 'authentic local food and street cuisine', icon: Utensils },
];

const PRESET_SCENARIOS = [
  {
    title: 'Khulna Food & Heritage',
    subtitle: '2 travelers • 2 days • ৳10,000',
    wishes:
      'hey i want to go to khulna what are the places to see around, what kind of food i can explore there, i have 10k budget will it be suffecient and we are 2 people where can we stay what are the hotel price rates',
    budget: 10000,
    travelers: 2,
    days: 2,
    month: 12,
    city: 'Dhaka',
  },
  {
    title: 'Winter Tea Trails in Sylhet',
    subtitle: '2 travelers • 3 days • ৳15,000',
    wishes: 'quiet hill place with tea gardens, good in winter, under 15000 taka for two people',
    budget: 15000,
    travelers: 2,
    days: 3,
    month: 12,
    city: 'Dhaka',
  },
  {
    title: 'Cox’s Bazar & Marine Drive',
    subtitle: '4 travelers • 3 days • ৳32,000',
    wishes: 'coastal beach sunset relax trip with seafood and comfortable family hotel',
    budget: 32000,
    travelers: 4,
    days: 3,
    month: 1,
    city: 'Dhaka',
  },
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

  const extractedPills = useMemo(() => {
    const lower = wishes.toLowerCase();
    const tags: string[] = [];
    if (/hill|mountain|sajek|bandarban|sylhet/.test(lower)) tags.push('Hills');
    if (/tea|garden|green|forest|sundarban/.test(lower)) tags.push('Nature');
    if (/food|eat|cuisine|biryani|seafood/.test(lower)) tags.push('Local Food');
    if (/hotel|stay|resort|rate/.test(lower)) tags.push('Stay Rates');
    if (/beach|sea|cox|kuakata|island/.test(lower)) tags.push('Coastal');
    if (/heritage|mosque|museum|palace|khulna|bogura/.test(lower)) tags.push('Heritage');
    if (tags.length === 0) tags.push('Smart Match');
    return tags;
  }, [wishes]);

  const toggleVibe = (keyword: string) => {
    if (wishes.toLowerCase().includes(keyword.toLowerCase())) return;
    setWishes((prev) => `${prev.trim().replace(/[.,]+$/, '')}, ${keyword}`);
  };

  const applyPreset = (p: (typeof PRESET_SCENARIOS)[number]) => {
    setWishes(p.wishes);
    setBudget(p.budget);
    setTravelers(p.travelers);
    setDays(p.days);
    setTravelMonth(p.month);
    setStartingCity(p.city);
  };

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

  const activeMonthName = MONTHS.find((m) => m.num === travelMonth)?.full || 'December';

  return (
    <div className="mx-auto max-w-[1220px] space-y-12 px-4 py-8 sm:px-6 lg:px-8">
      {/* Stitch 07_plan Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eaf7e6] px-3.5 py-1 text-[13px] font-semibold uppercase tracking-[0.06em] text-[#2F6B2F]">
            <Sparkles className="h-3.5 w-3.5" />
            AI Trip Feasibility Studio
          </span>
          <h1 className="mt-2.5 text-[36px] md:text-[40px] font-extrabold tracking-tight text-[#1F2A1F] sm:text-4xl">
            Where to next?
          </h1>
          <p className="mt-1 text-[16px] text-[#557945] sm:text-base">
            Describe your ideal Bangladesh trip in plain words, refine budget and days, and score all 64 districts.
          </p>
        </div>

        <Link
          href="/trips"
          className="inline-flex items-center gap-2 self-start rounded-full border border-[#D5E6CF] bg-white px-4 py-2 text-[14px] font-bold text-[#1F2A1F] shadow-sm hover:bg-[#eaf7e6] sm:self-auto"
        >
          <Compass className="h-3.5 w-3.5 text-[#2F6B2F]" />
          View Saved Trips
        </Link>
      </div>

      {/* Main 12-Col Stitch Workspace */}
      <div className="grid grid-cols-1 gap-7 lg:grid-cols-12">
        {/* Left 8 Cols: Prompt + Extracted Understanding + Refine Parameters */}
        <form onSubmit={handlePlan} className="space-y-6 lg:col-span-8">
          {/* Card 1: Natural Language Prompt */}
          <div className="rounded-[26px] border border-[#D5E6CF]/70 bg-white p-6 shadow-[0_14px_40px_-14px_rgba(31,42,31,0.08)] sm:p-7">
            <div className="mb-3 flex items-center justify-between">
              <label className="text-[14px] font-bold uppercase tracking-wider text-[#557945]">
                Describe your dream trip
              </label>
              <span className="text-[14px] font-semibold text-[#5D9253]">
                English or Banglish supported
              </span>
            </div>

            <textarea
              rows={3}
              required
              value={wishes}
              onChange={(e) => setWishes(e.target.value)}
              placeholder="e.g. Quiet tea gardens in Sylhet under 15,000 BDT for 2 people in December..."
              className="w-full rounded-2xl border border-[#D5E6CF] bg-[#eaf7e6]/55 p-4 text-[14px] font-medium leading-relaxed text-[#1F2A1F] placeholder-[#557945]/60 focus:border-[#2F6B2F] focus:bg-white focus:outline-none sm:text-base"
            />

            {/* Here's What I Understood Live Strip */}
            <div className="mt-4 rounded-2xl bg-[#F6FAF3] p-4 border border-[#E5F0E0]">
              <p className="mb-2 text-[13px] font-semibold uppercase tracking-[0.06em] text-[#557945]">
                Here&apos;s what I understood
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[14px] font-bold text-[#1F2A1F] border border-[#D5E6CF]">
                  <MapPin className="h-3 w-3 text-[#2F6B2F]" />
                  From {startingCity}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[14px] font-bold text-[#1F2A1F] border border-[#D5E6CF]">
                  <Wallet className="h-3 w-3 text-[#2F6B2F]" />
                  ৳{budget.toLocaleString()}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[14px] font-bold text-[#1F2A1F] border border-[#D5E6CF]">
                  <Users className="h-3 w-3 text-[#2F6B2F]" />
                  {travelers} traveler{travelers > 1 ? 's' : ''}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[14px] font-bold text-[#1F2A1F] border border-[#D5E6CF]">
                  <Calendar className="h-3 w-3 text-[#2F6B2F]" />
                  {days} day{days > 1 ? 's' : ''} • {activeMonthName}
                </span>
                {extractedPills.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[#eaf7e6] px-3 py-1 text-[14px] font-bold text-[#2F6B2F]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: Refine Parameters */}
          <div className="space-y-6 rounded-[26px] border border-[#D5E6CF]/70 bg-white p-6 shadow-[0_14px_40px_-14px_rgba(31,42,31,0.08)] sm:p-7">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-[#1F2A1F]">Refine parameters</h2>
              <span className="rounded-full bg-[#fff8e1] px-3 py-1 text-[14px] font-bold text-[#9a6b00]">
                Includes 10% safety buffer
              </span>
            </div>

            {/* Max Budget Slider */}
            <div className="rounded-2xl bg-[#F6FAF3] p-4 border border-[#E5F0E0]">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[14px] font-bold uppercase tracking-wider text-[#557945]">
                  Total Group Budget (BDT)
                </span>
                <span className="rounded-full bg-[#2F6B2F] px-3.5 py-1 text-[14px] font-extrabold text-white">
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
              <div className="mt-1 flex justify-between text-[14px] font-semibold text-[#557945]">
                <span>৳2,000</span>
                <span>৳40,000</span>
                <span>৳80,000</span>
              </div>
            </div>

            {/* Steppers & Starting Hub */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* Days Stepper */}
              <div className="rounded-2xl border border-[#D5E6CF] bg-[#F6FAF3] p-3.5">
                <span className="mb-2 block text-[13px] font-semibold uppercase tracking-[0.06em] text-[#557945]">
                  Duration
                </span>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setDays((d) => Math.max(1, d - 1))}
                    aria-label="Decrease days"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D5E6CF] bg-white text-[#1F2A1F] hover:bg-[#eaf7e6]"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-base font-extrabold text-[#1F2A1F]">
                    {days} day{days > 1 ? 's' : ''}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDays((d) => Math.min(15, d + 1))}
                    aria-label="Increase days"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D5E6CF] bg-white text-[#1F2A1F] hover:bg-[#eaf7e6]"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Travelers Stepper */}
              <div className="rounded-2xl border border-[#D5E6CF] bg-[#F6FAF3] p-3.5">
                <span className="mb-2 block text-[13px] font-semibold uppercase tracking-[0.06em] text-[#557945]">
                  Travelers
                </span>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setTravelers((t) => Math.max(1, t - 1))}
                    aria-label="Decrease travelers"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D5E6CF] bg-white text-[#1F2A1F] hover:bg-[#eaf7e6]"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-base font-extrabold text-[#1F2A1F]">
                    {travelers} {travelers === 1 ? 'person' : 'people'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setTravelers((t) => Math.min(20, t + 1))}
                    aria-label="Increase travelers"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D5E6CF] bg-white text-[#1F2A1F] hover:bg-[#eaf7e6]"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Starting Hub */}
              <div className="rounded-2xl border border-[#D5E6CF] bg-[#F6FAF3] p-3.5">
                <span className="mb-2 block text-[13px] font-semibold uppercase tracking-[0.06em] text-[#557945]">
                  Starting Hub
                </span>
                <select
                  value={startingCity}
                  onChange={(e) => setStartingCity(e.target.value)}
                  className="h-9 w-full rounded-full border border-[#D5E6CF] bg-white px-3 text-[14px] font-bold text-[#1F2A1F] focus:border-[#2F6B2F] focus:outline-none"
                >
                  {CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Travel Month Pills */}
            <div>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[14px] font-bold uppercase tracking-wider text-[#557945]">
                  Travel Month (Weather &amp; Crowd Check)
                </span>
                <label className="flex cursor-pointer items-center gap-2 text-[14px] font-semibold text-[#1F2A1F]">
                  <input
                    type="checkbox"
                    checked={hasHoliday}
                    onChange={(e) => setHasHoliday(e.target.checked)}
                    className="h-4 w-4 rounded border-[#D5E6CF] text-[#2F6B2F] focus:ring-[#2F6B2F]"
                  />
                  Public holiday / Eid weekend (adds crowd penalty)
                </label>
              </div>

              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-12">
                {MONTHS.map((m) => (
                  <button
                    key={m.num}
                    type="button"
                    onClick={() => setTravelMonth(m.num)}
                    className={`rounded-full py-2 text-[14px] font-bold transition ${
                      travelMonth === m.num
                        ? 'bg-[#2F6B2F] text-white shadow-sm'
                        : 'border border-[#D5E6CF] bg-[#F6FAF3] text-[#557945] hover:bg-[#eaf7e6] hover:text-[#1F2A1F]'
                    }`}
                  >
                    {m.short}
                  </button>
                ))}
              </div>
            </div>

            {/* Trip Vibes (Zero Emojis) */}
            <div>
              <span className="mb-2 block text-[14px] font-bold uppercase tracking-wider text-[#557945]">
                Tap vibes to enrich your query
              </span>
              <div className="flex flex-wrap gap-2">
                {VIBES.map((vibe) => {
                  const Icon = vibe.icon;
                  const active = wishes.toLowerCase().includes(vibe.keyword.toLowerCase());
                  return (
                    <button
                      key={vibe.label}
                      type="button"
                      onClick={() => toggleVibe(vibe.keyword)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[14px] font-bold transition ${
                        active
                          ? 'bg-[#eaf7e6] text-[#2F6B2F] border border-[#2F6B2F]/40'
                          : 'border border-[#D5E6CF] bg-white text-[#1F2A1F] hover:bg-[#F6FAF3]'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5 text-[#2F6B2F]" />
                      {vibe.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="flex h-[56px] w-full items-center justify-between rounded-full bg-[#2F6B2F] pl-7 pr-3 text-[14px] font-bold text-white shadow-md transition hover:bg-[#145219] sm:text-base"
            >
              <span>Evaluate 64 Districts &amp; Recommend</span>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFCB3D] text-[#1F2A1F]">
                <ArrowRight className="h-5 w-5" />
              </span>
            </button>
          </div>
        </form>

        {/* Right 4 Cols Sidebar */}
        <aside className="space-y-6 lg:col-span-4">
          {/* Quick Presets / Trending */}
          <div className="rounded-[26px] border border-[#D5E6CF]/70 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#2F6B2F]" />
              <h3 className="text-[14px] font-extrabold uppercase tracking-wider text-[#1F2A1F]">
                Trending Trip Prompts
              </h3>
            </div>
            <div className="space-y-3">
              {PRESET_SCENARIOS.map((preset) => (
                <button
                  key={preset.title}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="w-full rounded-2xl border border-[#E5F0E0] bg-[#F6FAF3] p-4 text-left transition hover:border-[#5D9253] hover:bg-[#eaf7e6]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-bold text-[#1F2A1F]">{preset.title}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-[#2F6B2F]" />
                  </div>
                  <p className="mt-1 text-[14px] font-semibold text-[#557945]">{preset.subtitle}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Local Fair-Price Guard Card */}
          <div className="rounded-[26px] bg-gradient-to-br from-[#235425] to-[#145219] p-6 text-white shadow-md">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-[#FFCB3D]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-extrabold">Local Fair-Price Guard</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-[#D5E6CF]">
              Every recommendation runs deterministic math on real Bus, Train, and Launch fares from {startingCity}, twin-share hotel rooms, local daily meals, entry fees, and a 10% safety buffer before Gemini writes a word.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2.5 text-[14px]">
              <div className="rounded-xl bg-white/10 p-3">
                <p className="text-[14px] uppercase tracking-wider text-[#D5E6CF]">Daylight Budget</p>
                <p className="mt-0.5 font-extrabold text-[#FFCB3D]">12h / day</p>
              </div>
              <div className="rounded-xl bg-white/10 p-3">
                <p className="text-[14px] uppercase tracking-wider text-[#D5E6CF]">Room Rule</p>
                <p className="mt-0.5 font-extrabold text-[#FFCB3D]">1 per 2 guests</p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Bottom Destination Catalog */}
      <section className="rounded-[28px] border border-[#D5E6CF]/70 bg-white p-6 shadow-sm sm:p-8 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[#557945]">
              Verified Bangladesh Directory
            </span>
            <h2 className="mt-1 text-2xl font-extrabold text-[#1F2A1F]">
              Browse All {destinations.length || 70} Destinations
            </h2>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5D9253]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search district or spot..."
              className="h-11 w-full rounded-full border border-[#D5E6CF] bg-[#F6FAF3] pl-11 pr-4 text-[14px] text-[#1F2A1F] focus:border-[#2F6B2F] focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {DIVISIONS.map((div) => (
            <button
              key={div}
              type="button"
              onClick={() => setActiveDivision(div)}
              className={`rounded-full px-4 py-1.5 text-[14px] font-bold transition ${
                activeDivision === div
                  ? 'bg-[#2F6B2F] text-white shadow-sm'
                  : 'border border-[#D5E6CF] bg-[#F6FAF3] text-[#557945] hover:bg-[#eaf7e6] hover:text-[#1F2A1F]'
              }`}
            >
              {div}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((dest) => (
            <Link
              key={dest.destination_id}
              href={`/destinations/${dest.destination_id}`}
              className="group overflow-hidden rounded-[22px] border border-[#E5F0E0] bg-[#F6FAF3] transition hover:-translate-y-0.5 hover:border-[#5D9253] hover:shadow-md"
            >
              <div className="relative h-44 w-full overflow-hidden bg-[#E5F0E0]">
                <img
                  src={
                    dest.image_url ||
                    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80'
                  }
                  alt={dest.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[14px] font-bold text-[#1F2A1F] backdrop-blur-sm">
                  {dest.division}
                </span>
                <span className="absolute right-3 top-3 rounded-full bg-[#1F2A1F]/80 px-2.5 py-1 text-[14px] font-bold text-[#FFCB3D]">
                  {dest.cost_level} Cost
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-base font-extrabold text-[#1F2A1F] group-hover:text-[#2F6B2F]">
                    {dest.name}
                  </h3>
                  {dest.name_bn && (
                    <span className="text-[14px] font-medium text-[#557945]">{dest.name_bn}</span>
                  )}
                </div>
                <p className="mt-1 flex items-center gap-1 text-[14px] font-semibold text-[#557945]">
                  <MapPin className="h-3 w-3 text-[#2F6B2F]" />
                  {dest.district} District
                </p>
                <p className="mt-2 line-clamp-2 text-[14px] leading-relaxed text-[#557945]">
                  {dest.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
