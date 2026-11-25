'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Compass,
  Copy,
  Leaf,
  Link2,
  MapPin,
  MessageSquare,
  Search,
  Settings2,
  Share2,
  SlidersHorizontal,
  Sparkles,
  Star,
  Sun,
  Thermometer,
  Users,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

const QUICK_CHIPS = [
  { label: 'Weekend in Sylhet under 8000', tag: 'budget' },
  { label: 'Khulna places, food & 10k budget', tag: 'khulna' },
  { label: 'Beach trip in December', tag: 'sun' },
  { label: 'Quiet hills for 2 people', tag: 'users' },
];

const ARC_CARDS = [
  {
    name: "Cox's Bazar",
    score: '91%',
    rotate: 'lg:-rotate-6 lg:translate-y-5',
    size: 'w-44 h-60 sm:w-52 sm:h-72',
    image:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=700&q=80',
  },
  {
    name: 'Sundarbans',
    score: '88%',
    rotate: 'lg:-rotate-3 lg:translate-y-2',
    size: 'w-44 h-60 sm:w-52 sm:h-72',
    image:
      'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=700&q=80',
  },
  {
    name: 'Sajek Valley',
    score: '97%',
    rotate: 'lg:rotate-0 lg:-translate-y-4 z-10',
    size: 'w-52 h-72 sm:w-64 sm:h-[340px] border-[5px]',
    image:
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Sylhet Gardens',
    score: '94%',
    rotate: 'lg:rotate-3 lg:translate-y-2',
    size: 'w-44 h-60 sm:w-52 sm:h-72',
    image:
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=700&q=80',
  },
  {
    name: "Saint Martin's",
    score: '93%',
    rotate: 'lg:rotate-6 lg:translate-y-5',
    size: 'w-44 h-60 sm:w-52 sm:h-72',
    image:
      'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&w=700&q=80',
  },
];

const SEASONAL_MONTHS = [
  { m: 'JAN', sub: 'Low', bg: '#2F6B2F', text: '#FFFFFF' },
  { m: 'FEB', sub: 'Dry', bg: '#5D9253', text: '#FFFFFF' },
  { m: 'MAR', sub: 'Warm', bg: '#D5E6CF', text: '#1F2A1F' },
  { m: 'APR', sub: 'Rain', bg: '#FFCB3D', text: '#1F2A1F' },
  { m: 'MAY', sub: 'Wet', bg: '#FFCB3D', text: '#1F2A1F' },
  { m: 'JUN', sub: 'Off', bg: '#D5E6CF', text: '#1F2A1F' },
  { m: 'JUL', sub: 'Rain', bg: '#D5E6CF', text: '#1F2A1F' },
  { m: 'AUG', sub: 'Lush', bg: '#D5E6CF', text: '#1F2A1F' },
  { m: 'SEP', sub: 'Calm', bg: '#5D9253', text: '#FFFFFF' },
  { m: 'OCT', sub: 'Peak', bg: '#2F6B2F', text: '#FFFFFF' },
  { m: 'NOV', sub: 'Prime', bg: '#2F6B2F', text: '#FFFFFF' },
  { m: 'DEC', sub: 'Best', bg: '#2F6B2F', text: '#FFFFFF' },
];

export default function HomePage() {
  const router = useRouter();
  const [wishes, setWishes] = useState(
    '3 days, 15,000 BDT, 2 people, quiet tea gardens, December...',
  );
  const [ctaWishes, setCtaWishes] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [budget, setBudget] = useState(15000);
  const [travelers, setTravelers] = useState(2);
  const [days, setDays] = useState(3);
  const [travelMonth, setTravelMonth] = useState(12);
  const [startingCity, setStartingCity] = useState('Dhaka');
  const [destinations, setDestinations] = useState<any[]>([]);
  const [carouselOffset, setCarouselOffset] = useState(0);
  const [copiedDemoLink, setCopiedDemoLink] = useState(false);

  useEffect(() => {
    apiFetch<any[]>('/destinations')
      .then((list) => {
        const preferred = ['Sajek Valley', "Cox's Bazar", 'Sundarbans', 'Sreemangal', 'Khulna', 'Rangamati'];
        const sorted = [
          ...list.filter((d) => preferred.some((p) => d.name.toLowerCase().includes(p.toLowerCase()))),
          ...list.filter((d) => !preferred.some((p) => d.name.toLowerCase().includes(p.toLowerCase()))),
        ];
        setDestinations(sorted.slice(0, 8));
      })
      .catch(() => {});
  }, []);

  const launchSearch = (queryText: string) => {
    const clean = queryText.trim();
    if (!clean) return;
    const params = new URLSearchParams({
      wishes: clean,
      budget: String(budget),
      travelers: String(travelers),
      days: String(days),
      travel_month: String(travelMonth),
      starting_city: startingCity,
      has_holiday: 'false',
    });
    router.push(`/results?${params.toString()}`);
  };

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    launchSearch(wishes);
  };

  const visibleSeasonPicks = destinations.slice(carouselOffset, carouselOffset + 4);

  return (
    <div className="relative overflow-hidden bg-[#E5F0E0]">
      {/* Ambient Blurred Background Blobs starting right from y=0 behind navbar */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-[1120px] overflow-hidden z-0">
        <div className="absolute -top-44 -left-24 h-[640px] w-[640px] rounded-full bg-[#5D9253] opacity-30 blur-[130px]" />
        <div className="absolute -top-36 -right-24 h-[600px] w-[600px] rounded-full bg-[#FFCB3D] opacity-35 blur-[140px]" />
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 h-[480px] w-[680px] rounded-full bg-[#557945] opacity-20 blur-[150px]" />
      </div>

      {/* HERO SECTION */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 pt-32 pb-16 sm:px-6 lg:px-10 text-center">
        {/* Sub-badge */}
        <div className="inline-flex items-center gap-2.5 rounded-full bg-white px-5 py-2 shadow-[0_10px_30px_rgba(31,42,31,0.08)] border border-white/80 mb-7">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FFCB3D] animate-pulse" />
          <span className="text-[13px] font-medium tracking-tight text-[#1F2A1F]">
            AI travel recommender for Bangladesh
          </span>
        </div>

        {/* 3-line Editorial Display Headline: 48px mobile -> 112px desktop, 800, lh 1.0, ls -4% */}
        <h1 className="mx-auto max-w-7xl text-[48px] md:text-[80px] xl:text-[112px] font-extrabold leading-[1.0] tracking-[-0.04em] text-[#1F2A1F]">
          Tell us your vibe.
          <br />
          We&apos;ll find your
          <br />
          <span className="relative inline-block text-[#2F6B2F] whitespace-nowrap">
            destination.
            <svg
              className="pointer-events-none absolute -bottom-2.5 left-0 w-full h-4"
              fill="none"
              viewBox="0 0 460 28"
              preserveAspectRatio="none"
            >
              <path
                d="M3 21C75 7 240 4 457 14C350 20 180 26 50 25C150 22 320 20 440 22"
                stroke="#FFCB3D"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="7"
              />
            </svg>
          </span>
        </h1>

        <p className="mx-auto mt-8 max-w-[560px] text-[16px] md:text-[18px] font-normal leading-relaxed text-[#1F2A1F]/75">
          Describe your trip in plain words. Our AI checks your budget, time, weather and crowds,
          then ranks the places that truly fit.
        </p>

        {/* Pill AI Prompt Bar */}
        <form onSubmit={handleHeroSubmit} className="mx-auto mt-9 max-w-[780px]">
          <div className="flex h-[68px] sm:h-[76px] items-center gap-3 rounded-full bg-white pl-3.5 pr-2.5 shadow-[0_20px_60px_rgba(31,42,31,0.12)] border-[3px] border-[#2F6B2F]">
            <div className="hidden sm:flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E5F0E0]">
              <Sparkles className="h-5 w-5 text-[#2F6B2F]" strokeWidth={1.8} />
            </div>
            <input
              type="text"
              value={wishes}
              onChange={(e) => setWishes(e.target.value)}
              placeholder="e.g., quiet hill place with tea gardens under 15,000 BDT for 2 people..."
              className="flex-1 min-w-0 bg-transparent text-[16px] font-normal text-[#1F2A1F] placeholder:text-[#1F2A1F]/45 focus:outline-none px-2"
            />
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              title="Adjust budget, days & origin city"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#557945] hover:bg-[#F6FAF3] transition-colors"
            >
              <SlidersHorizontal className="h-5 w-5" strokeWidth={1.8} />
            </button>
            <button
              type="submit"
              className="inline-flex h-12 sm:h-14 shrink-0 items-center gap-2 rounded-full bg-[#2F6B2F] px-5 sm:px-7 text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(47,107,47,0.25)] hover:bg-[#265726] transition-all"
            >
              <span>Recommend</span>
              <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
            </button>
          </div>

          {/* Optional Expandable Constraints Drawer */}
          {showFilters && (
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-3 rounded-3xl bg-white/95 p-4 shadow-soft border border-[#D5E6CF] text-left">
              <div>
                <label className="block text-[13px] font-semibold uppercase tracking-[0.06em] text-[#557945] mb-1">
                  Budget (BDT)
                </label>
                <input
                  type="number"
                  min={1000}
                  step={500}
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="h-10 w-full rounded-full bg-[#F6FAF3] border border-[#D5E6CF] px-3 text-[14px] font-semibold text-[#1F2A1F]"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold uppercase tracking-[0.06em] text-[#557945] mb-1">
                  Travelers
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={travelers}
                  onChange={(e) => setTravelers(Number(e.target.value))}
                  className="h-10 w-full rounded-full bg-[#F6FAF3] border border-[#D5E6CF] px-3 text-[14px] font-semibold text-[#1F2A1F]"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold uppercase tracking-[0.06em] text-[#557945] mb-1">
                  Days
                </label>
                <input
                  type="number"
                  min={1}
                  max={14}
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="h-10 w-full rounded-full bg-[#F6FAF3] border border-[#D5E6CF] px-3 text-[14px] font-semibold text-[#1F2A1F]"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold uppercase tracking-[0.06em] text-[#557945] mb-1">
                  Month
                </label>
                <select
                  value={travelMonth}
                  onChange={(e) => setTravelMonth(Number(e.target.value))}
                  className="h-10 w-full rounded-full bg-[#F6FAF3] border border-[#D5E6CF] px-3 text-[14px] font-semibold text-[#1F2A1F]"
                >
                  {[
                    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
                  ].map((m, i) => (
                    <option key={m} value={i + 1}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-semibold uppercase tracking-[0.06em] text-[#557945] mb-1">
                  From
                </label>
                <select
                  value={startingCity}
                  onChange={(e) => setStartingCity(e.target.value)}
                  className="h-10 w-full rounded-full bg-[#F6FAF3] border border-[#D5E6CF] px-3 text-[14px] font-semibold text-[#1F2A1F]"
                >
                  {['Dhaka', 'Chattogram', 'Sylhet', 'Rajshahi', 'Khulna', 'Barishal'].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </form>

        {/* Quick Query Chips */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
          {QUICK_CHIPS.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={() => {
                setWishes(chip.label);
                launchSearch(chip.label);
              }}
              className="inline-flex items-center gap-2 rounded-full bg-white/85 border border-white px-4 py-2 text-[14px] font-normal whitespace-nowrap text-[#1F2A1F] shadow-[0_4px_14px_rgba(31,42,31,0.04)] hover:bg-white hover:border-[#5D9253] hover:-translate-y-0.5 transition-all"
            >
              {chip.tag === 'budget' && (
                <span className="font-bold text-[#2F6B2F]">৳</span>
              )}
              {chip.tag === 'sun' && <Sun className="h-3.5 w-3.5 text-[#FFCB3D]" />}
              {chip.tag === 'users' && <Users className="h-3.5 w-3.5 text-[#557945]" />}
              {chip.tag === 'khulna' && <MapPin className="h-3.5 w-3.5 text-[#2F6B2F]" />}
              <span>{chip.label}</span>
            </button>
          ))}
        </div>

        {/* TILTED 5-CARD PHOTO ARC + FLOATING GLASS BADGES */}
        <div className="relative mx-auto mt-14 max-w-6xl">
          {/* Floating Left Badge */}
          <div className="hidden md:flex absolute left-6 -top-4 z-20 items-center gap-2.5 rounded-full bg-white/90 backdrop-blur-xl border border-white px-5 py-2.5 shadow-[0_16px_40px_rgba(31,42,31,0.12)]">
            <span className="inline-block h-5 w-5 rounded-full border-[3px] border-[#2F6B2F] border-t-[#FFCB3D]" />
            <span className="text-[14px] font-semibold text-[#1F2A1F]">6-factor AI scoring</span>
          </div>

          {/* Floating Right Badge */}
          <div className="hidden md:flex absolute right-6 -top-2 z-20 items-center gap-2.5 rounded-full bg-white/90 backdrop-blur-xl border border-white px-5 py-2.5 shadow-[0_16px_40px_rgba(31,42,31,0.12)]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#5D9253] ring-4 ring-[#5D9253]/25" />
            <span className="text-[14px] font-semibold text-[#1F2A1F]">Fits your budget</span>
          </div>

          <div className="flex flex-wrap lg:flex-nowrap items-end justify-center gap-3 sm:gap-4 pt-6">
            {ARC_CARDS.map((card) => (
              <div
                key={card.name}
                onClick={() => launchSearch(`Trip to ${card.name}`)}
                className={`group relative cursor-pointer overflow-hidden rounded-[28px] border-4 border-white shadow-[0_24px_50px_rgba(31,42,31,0.16)] transition-all duration-300 hover:rotate-0 hover:-translate-y-2 hover:scale-[1.03] ${card.size} ${card.rotate}`}
              >
                <img
                  src={card.image}
                  alt={card.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex h-11 items-center justify-between rounded-full bg-white/90 backdrop-blur-md px-3.5 shadow-md">
                  <span className="truncate text-[14px] font-semibold text-[#1F2A1F]">{card.name}</span>
                  <span className="rounded-full bg-[#2F6B2F] px-2.5 py-0.5 text-[14px] font-bold text-white shrink-0">
                    {card.score}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 1: MARQUEE STATS STRIP */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 pt-6 pb-8 sm:px-6">
        <div className="rounded-[36px] bg-white px-6 py-10 shadow-[0_20px_60px_rgba(31,42,31,0.10)]">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-0">
            {[
              { icon: MapPin, val: '64', accent: '', label: 'Districts covered' },
              { icon: Compass, val: '220', accent: '+', label: 'Verified attractions' },
              { icon: Sparkles, val: '6', accent: '', label: 'Scoring factors per match' },
              { icon: Clock, val: '10', accent: 's', label: 'Average time to get results' },
            ].map((stat, idx) => (
              <div
                key={stat.label}
                className={`flex flex-col items-center text-center px-4 ${
                  idx < 3 ? 'md:border-r md:border-[#1F2A1F]/10' : ''
                }`}
              >
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#E5F0E0]">
                  <stat.icon className="h-5 w-5 text-[#2F6B2F]" strokeWidth={1.75} />
                </div>
                <div className="text-[40px] font-bold tracking-tight text-[#2F6B2F] whitespace-nowrap">
                  {stat.val}
                  {stat.accent && <span className="text-[#FFCB3D]">{stat.accent}</span>}
                </div>
                <div className="mt-1.5 text-[14px] font-normal text-[#1F2A1F]/75">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-[14px] font-semibold text-[#1F2A1F]">
          <Leaf className="h-4 w-4 text-[#2F6B2F]" strokeWidth={2} />
          <span>Built for travelers in Bangladesh</span>
        </div>
      </section>

      {/* SECTION 2: HOW IT WORKS */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-10">
        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-flex items-center rounded-full bg-[#1F2A1F] px-4 py-1.5 text-[13px] font-semibold uppercase tracking-[0.06em] text-[#FFCB3D]">
              HOW IT WORKS
            </span>
            <h2 className="mt-4 text-[36px] md:text-[64px] font-extrabold leading-[1.06] tracking-[-0.03em] text-[#1F2A1F]">
              Four steps.
              <br />
              Zero guesswork.
            </h2>
          </div>
          <p className="max-w-md text-[16px] md:text-[18px] font-normal leading-relaxed text-[#1F2A1F]/80">
            Our AI breaks down natural-language trip wishes into mathematical travel variables,
            testing budget limits, routes, and season constraints in seconds.
          </p>
        </div>

        <div className="relative">
          <div className="hidden lg:block absolute top-1/3 left-20 right-20 border-t-2 border-dashed border-[#1F2A1F]/15 z-0" />
          <div className="relative z-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                num: '01',
                title: 'Describe',
                desc: 'Type your ideal vibe, budget, group size, and travel dates in everyday words.',
                bg: 'bg-white text-[#1F2A1F] border border-white',
                iconBg: 'bg-[#E5F0E0] text-[#2F6B2F]',
                numColor: 'text-[#1F2A1F]/[0.07]',
                icon: MessageSquare,
              },
              {
                num: '02',
                title: 'AI understands',
                desc: 'Extracts intent, constraints, travel pace, and weather preferences into 6 scoring vectors.',
                bg: 'bg-[#5D9253] text-white',
                iconBg: 'bg-white/20 text-white',
                numColor: 'text-white/15',
                icon: Settings2,
              },
              {
                num: '03',
                title: 'Feasibility check',
                desc: 'Simulates real-world costs, transit schedules, crowd density, and seasonal factors.',
                bg: 'bg-[#FFCB3D] text-[#1F2A1F]',
                iconBg: 'bg-[#1F2A1F]/10 text-[#1F2A1F]',
                numColor: 'text-[#1F2A1F]/10',
                icon: Check,
              },
              {
                num: '04',
                title: 'Get your trip plan',
                desc: 'Receives ranked matches with live budget breakdowns, daily pacing, and instant PDF export.',
                bg: 'bg-[#1F2A1F] text-white',
                iconBg: 'bg-white/15 text-[#FFCB3D]',
                numColor: 'text-white/10',
                icon: Star,
              },
            ].map((step) => (
              <div
                key={step.num}
                className={`relative flex min-h-[300px] flex-col justify-between overflow-hidden rounded-[32px] p-7 shadow-[0_16px_40px_rgba(31,42,31,0.08)] ${step.bg}`}
              >
                <span
                  className={`pointer-events-none select-none absolute top-3 right-5 text-8xl font-extrabold leading-none ${step.numColor}`}
                >
                  {step.num}
                </span>
                <div className="relative z-10">
                  <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-full ${step.iconBg}`}>
                    <step.icon className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <h3 className="text-[24px] font-semibold tracking-tight">{step.title}</h3>
                </div>
                <p className="relative z-10 mt-6 text-[16px] font-normal leading-relaxed opacity-90">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: BENTO FEATURES */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-10">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h2 className="text-[36px] md:text-[64px] font-extrabold leading-[1.06] tracking-[-0.03em] text-[#1F2A1F]">
            Built to beat a Google search.
          </h2>
          <p className="mt-4 text-[16px] md:text-[18px] font-normal leading-relaxed text-[#1F2A1F]/80">
            Standard search engines show sponsored blogs. VROMON calculates trip feasibility with
            multi-dimensional logic.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Tile A: Dark Semantic AI Match */}
          <div className="lg:col-span-7 lg:row-span-2 flex flex-col justify-between rounded-[32px] bg-[#1F2A1F] p-8 text-white shadow-[0_24px_60px_rgba(31,42,31,0.22)]">
            <div>
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10">
                  <Sparkles className="h-5 w-5 text-[#FFCB3D]" />
                </div>
                <span className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[#FFCB3D]">
                  NATURAL QUERY ENGINE
                </span>
              </div>
              <h3 className="text-[24px] font-semibold tracking-tight">Semantic AI Match</h3>
              <p className="mt-3 max-w-lg text-[16px] font-normal leading-relaxed text-white/80">
                Matches natural desires like &apos;peaceful tea garden morning&apos; to verified
                locations and real travel conditions.
              </p>

              <div className="mt-6 flex items-center gap-3 rounded-full bg-white/10 border border-white/15 px-5 py-3 text-[16px] text-white/90">
                <Search className="h-4 w-4 text-[#FFCB3D] shrink-0" />
                <span className="truncate">&ldquo;peaceful tea garden morning with cool breeze&rdquo;</span>
              </div>
            </div>

            <div className="mt-7 space-y-3">
              {[
                { name: 'Sreemangal', tag: 'Misty Hills & Tea', pct: 98 },
                { name: 'Sajek Valley', tag: 'Cloudscape Ridge', pct: 94 },
                { name: 'Ratargul Swamp', tag: 'Freshwater Forest', pct: 89 },
              ].map((m) => (
                <div key={m.name} className="rounded-2xl bg-white/[0.06] p-4">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[16px] font-semibold">{m.name}</span>
                      <span className="rounded-full bg-white/10 px-3 py-0.5 text-[14px] text-white/75">
                        {m.tag}
                      </span>
                    </div>
                    <span className="text-[14px] font-bold text-[#5D9253]">{m.pct}% match</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-[#5D9253]"
                      style={{ width: `${m.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tile B: Green Budget Feasibility */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-[32px] bg-gradient-to-br from-[#2F6B2F] to-[#5D9253] p-7 text-white shadow-[0_16px_40px_rgba(47,107,47,0.22)]">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-lg font-bold">
                  ৳
                </div>
                <h3 className="text-[24px] font-semibold tracking-tight">Budget feasibility</h3>
              </div>
              <p className="text-[16px] font-normal text-white/90">
                Real-time cost projection vs your stated ceiling.
              </p>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-white px-3 py-1 text-[13px] font-semibold uppercase tracking-[0.06em] text-[#145219]">
                  Fits Ceiling
                </span>
                <span className="rounded-full bg-white/20 px-3 py-1 text-[13px] font-semibold uppercase tracking-[0.06em]">
                  Tight
                </span>
                <span className="rounded-full bg-white/20 px-3 py-1 text-[13px] font-semibold uppercase tracking-[0.06em]">
                  Over
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[32px] font-bold">৳ 14,200</span>
                <span className="text-[14px] font-medium text-white/85">of ৳ 15,000 cap</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-black/20">
                <div className="h-full w-[88%] rounded-full bg-[#FFCB3D]" />
              </div>
            </div>
          </div>

          {/* Tile C: Amber Time Feasibility */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-[32px] bg-[#FFCB3D] p-7 text-[#1F2A1F] shadow-[0_16px_40px_rgba(255,203,61,0.26)]">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1F2A1F]/10">
                  <Clock className="h-5 w-5" />
                </div>
                <h3 className="text-[24px] font-semibold tracking-tight">Time feasibility</h3>
              </div>
              <p className="text-[16px] font-normal text-[#1F2A1F]/85">
                Calculates transit vs daylight exploration hours.
              </p>
            </div>

            <div className="mt-6 flex items-end justify-between gap-3">
              <div>
                <div className="text-[40px] font-bold leading-none tracking-tight">12h</div>
                <div className="mt-1 text-[14px] font-medium text-[#1F2A1F]/80">
                  usable hours per day
                </div>
              </div>
              <div className="rounded-2xl bg-[#1F2A1F]/10 px-4 py-2.5 text-right">
                <span className="block text-[14px] font-semibold">Transit Efficiency</span>
                <span className="block text-[16px] font-bold text-[#2F6B2F]">+3.5h saved</span>
              </div>
            </div>
          </div>

          {/* Tile D: Climate & Crowd Heatmap */}
          <div className="lg:col-span-4 flex flex-col justify-between rounded-[32px] bg-white p-7 text-[#1F2A1F] shadow-[0_16px_40px_rgba(31,42,31,0.08)]">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E5F0E0]">
                  <Thermometer className="h-5 w-5 text-[#2F6B2F]" />
                </div>
                <h3 className="text-[24px] font-semibold tracking-tight">Climate &amp; crowd</h3>
              </div>
              <p className="text-[16px] font-normal text-[#1F2A1F]/80">
                Historical weather patterns and crowd spikes.
              </p>
            </div>

            <div className="mt-5">
              <div className="grid grid-cols-6 gap-1.5">
                {SEASONAL_MONTHS.map((item) => (
                  <div
                    key={item.m}
                    style={{ backgroundColor: item.bg, color: item.text }}
                    className="flex h-10 items-center justify-center rounded-xl text-[14px] font-semibold"
                  >
                    {item.m}
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between text-[14px]">
                <span className="text-[#1F2A1F]/70 font-normal">Dark green = Optimal weather</span>
                <span className="rounded-full bg-[#E5F0E0] px-2.5 py-0.5 font-semibold text-[#2F6B2F]">
                  Dec: Ideal
                </span>
              </div>
            </div>
          </div>

          {/* Tile E: Side-by-side compare */}
          <div className="lg:col-span-4 flex flex-col justify-between rounded-[32px] bg-[#D5E6CF] p-7 text-[#1F2A1F] shadow-[0_16px_40px_rgba(31,42,31,0.08)]">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1F2A1F]/10">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="text-[24px] font-semibold tracking-tight">Side-by-side compare</h3>
              </div>
              <p className="text-[16px] font-normal text-[#1F2A1F]/85">
                Rank trade-offs across budget, comfort, and travel time.
              </p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 rounded-2xl bg-white/75 p-4 text-center">
              <div className="border-r border-[#1F2A1F]/10 pr-2">
                <p className="text-[16px] font-semibold">Sajek</p>
                <div className="mx-auto my-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#2F6B2F] text-[14px] font-bold text-white">
                  96%
                </div>
                <p className="text-[14px] font-semibold text-[#2F6B2F]">Better Scenery</p>
              </div>
              <div className="pl-2">
                <p className="text-[16px] font-semibold">Bandarban</p>
                <div className="mx-auto my-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#5D9253] text-[14px] font-bold text-white">
                  91%
                </div>
                <p className="text-[14px] font-semibold text-[#2F6B2F]">Lower Budget</p>
              </div>
            </div>
          </div>

          {/* Tile F: Shareable Trip Plan */}
          <div className="lg:col-span-4 relative flex flex-col justify-between overflow-hidden rounded-[32px] bg-[#1B3519] p-7 text-white shadow-[0_20px_48px_rgba(31,42,31,0.25)]">
            <img
              src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80"
              alt="Hills"
              className="absolute inset-0 h-full w-full object-cover opacity-35"
            />
            <div className="relative z-10">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur">
                  <Share2 className="h-5 w-5 text-[#FFCB3D]" />
                </div>
                <h3 className="text-[24px] font-semibold tracking-tight">Shareable trip plan</h3>
              </div>
              <p className="text-[16px] font-normal text-white/85">
                30-day shareable links and one-click PDF export for travel companions.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setCopiedDemoLink(true);
                setTimeout(() => setCopiedDemoLink(false), 2000);
              }}
              className="relative z-10 mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white text-[14px] font-semibold text-[#1F2A1F] shadow-lg hover:bg-[#F6FAF3]"
            >
              {copiedDemoLink ? <Copy className="h-4 w-4 text-[#2F6B2F]" /> : <Link2 className="h-4 w-4" />}
              <span>{copiedDemoLink ? 'Ready on any trip plan!' : 'Try trip plan builder'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 4: CURATED PICKS */}
      {visibleSeasonPicks.length > 0 && (
        <section id="destinations" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-10">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="inline-flex items-center rounded-full bg-[#1F2A1F] px-4 py-1.5 text-[13px] font-semibold uppercase tracking-[0.06em] text-[#FFCB3D]">
                CURATED PICKS
              </span>
              <h2 className="mt-4 text-[36px] md:text-[64px] font-extrabold leading-[1.06] tracking-[-0.03em] text-[#1F2A1F]">
                Top matches this season.
              </h2>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setCarouselOffset((prev) => Math.max(0, prev - 1))}
                aria-label="Previous"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-[#1F2A1F]/20 bg-white text-[#1F2A1F] hover:bg-[#F6FAF3]"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setCarouselOffset((prev) =>
                    prev + 4 < destinations.length ? prev + 1 : 0,
                  )
                }
                aria-label="Next"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2F6B2F] text-white shadow-md hover:bg-[#145219]"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {visibleSeasonPicks.map((dest, idx) => (
              <Link
                key={dest.destination_id}
                href={`/destinations/${dest.destination_id}`}
                className="group relative flex h-[410px] flex-col justify-between overflow-hidden rounded-[32px] shadow-[0_20px_48px_rgba(31,42,31,0.16)]"
              >
                <img
                  src={
                    dest.image_url ||
                    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80'
                  }
                  alt={dest.name}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/10 to-black/75" />

                <div className="relative z-10 flex items-center justify-between p-5">
                  <span className="rounded-full bg-[#5D9253] px-3.5 py-1 text-[13px] font-semibold uppercase tracking-[0.06em] text-white">
                    {dest.cost_level === 'High' ? 'Comfort' : 'Fits'}
                  </span>
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1F2A1F]/75 backdrop-blur border-2 border-[#5D9253] text-[14px] font-bold text-white">
                    {97 - idx * 2}%
                  </div>
                </div>

                <div className="relative z-10 m-4 rounded-[22px] bg-white/15 backdrop-blur-lg border border-white/30 p-5 text-white">
                  <h3 className="text-[24px] font-semibold leading-tight truncate">{dest.name}</h3>
                  <p className="mt-1 text-[14px] text-white/85 truncate">
                    {dest.division} · {dest.min_hours_needed}h min
                  </p>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-[13px] font-semibold uppercase tracking-[0.06em] text-white/75">
                      Room / Night
                    </span>
                    <span className="text-[18px] font-bold text-[#FFCB3D]">
                      ৳ {Number(dest.hotel_cost_per_room_night).toLocaleString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 5: ALGORITHMIC TRANSPARENCY (DARK DONUT CARD) */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-10">
        <div className="relative overflow-hidden rounded-[44px] bg-[#1F2A1F] px-6 py-12 sm:px-12 sm:py-16 lg:px-16 text-white shadow-[0_28px_70px_rgba(31,42,31,0.28)]">
          <div className="pointer-events-none absolute -top-32 -right-24 h-96 w-96 rounded-full bg-[#5D9253] opacity-20 blur-[120px]" />

          <div className="relative z-10 grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            {/* Multi-segment Donut */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative h-72 w-72 sm:h-80 sm:w-80">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 360 360">
                  <circle cx="180" cy="180" r="130" fill="transparent" stroke="rgba(255,255,255,0.06)" strokeWidth="40" />
                  <circle cx="180" cy="180" r="130" fill="transparent" stroke="#5D9253" strokeDasharray="245 816" strokeDashoffset="0" strokeWidth="40" />
                  <circle cx="180" cy="180" r="130" fill="transparent" stroke="#FFCB3D" strokeDasharray="163 816" strokeDashoffset="-245" strokeWidth="40" />
                  <circle cx="180" cy="180" r="130" fill="transparent" stroke="#2F6B2F" strokeDasharray="122 816" strokeDashoffset="-408" strokeWidth="40" />
                  <circle cx="180" cy="180" r="130" fill="transparent" stroke="#86EFAC" strokeDasharray="122 816" strokeDashoffset="-530" strokeWidth="40" />
                  <circle cx="180" cy="180" r="130" fill="transparent" stroke="#FDE047" strokeDasharray="82 816" strokeDashoffset="-652" strokeWidth="40" />
                  <circle cx="180" cy="180" r="130" fill="transparent" stroke="#D5E6CF" strokeDasharray="82 816" strokeDashoffset="-734" strokeWidth="40" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[64px] font-extrabold leading-none tracking-tight whitespace-nowrap">
                    92
                  </span>
                  <span className="mt-2 text-[13px] font-semibold uppercase tracking-[0.06em] text-white/75">
                    MATCH SCORE
                  </span>
                </div>
              </div>
            </div>

            {/* 6 Factor Bars */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="inline-flex rounded-full bg-[#FFCB3D]/15 border border-[#FFCB3D]/30 px-4 py-1 text-[13px] font-semibold uppercase tracking-[0.06em] text-[#FFCB3D]">
                  ALGORITHMIC TRANSPARENCY
                </span>
                <h2 className="mt-4 text-[36px] md:text-[64px] font-extrabold leading-[1.06] tracking-[-0.03em]">
                  Six factors.
                  <br />
                  One honest score.
                </h2>
                <p className="mt-4 max-w-xl text-[16px] md:text-[18px] font-normal text-white/80 leading-relaxed">
                  Every percentage point reflects deterministic math against your stated wishes,
                  budget elasticity, and real transit conditions.
                </p>
              </div>

              <div className="space-y-3.5">
                {[
                  { name: 'Meaning', pct: 30, color: '#5D9253' },
                  { name: 'Budget', pct: 20, color: '#FFCB3D' },
                  { name: 'Interest', pct: 15, color: '#2F6B2F' },
                  { name: 'Weather', pct: 15, color: '#86EFAC' },
                  { name: 'Time', pct: 10, color: '#FDE047' },
                  { name: 'Crowd', pct: 10, color: '#D5E6CF' },
                ].map((f) => (
                  <div key={f.name} className="flex items-center gap-4">
                    <div className="flex w-28 items-center gap-2.5 shrink-0">
                      <span
                        className="h-3 w-3 rounded-full shrink-0"
                        style={{ backgroundColor: f.color }}
                      />
                      <span className="text-[14px] font-semibold">{f.name}</span>
                    </div>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${f.pct * 2.5}%`, backgroundColor: f.color }}
                      />
                    </div>
                    <span className="w-10 text-right text-[14px] font-bold">{f.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: TESTIMONIALS */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-10">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <span className="inline-flex rounded-full bg-white px-4 py-1.5 text-[13px] font-semibold uppercase tracking-[0.06em] text-[#2F6B2F]">
            TESTIMONIALS
          </span>
          <h2 className="mt-4 text-[36px] md:text-[64px] font-extrabold leading-[1.06] tracking-[-0.03em] text-[#1F2A1F]">
            Loved by real travelers.
          </h2>
          <p className="mt-3 text-[16px] md:text-[18px] font-normal text-[#1F2A1F]/80">
            How VROMON replaced 40 open browser tabs and guesswork.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-7 md:grid-cols-3 items-stretch">
          {[
            {
              quote:
                "We asked for 'rainy monsoon romance with hills, under 18k'. VROMON gave us a cloud cottage breakdown matching the budget within ৳ 500.",
              initials: 'TH',
              name: 'Tahmid Hasan',
              meta: 'Dhaka · August Trip',
              featured: false,
            },
            {
              quote:
                'The crowd predictor flagged holiday congestion on Friday morning and recommended an alternative coastal schedule that saved us hours.',
              initials: 'NF',
              name: 'Nusrat & Farhan',
              meta: 'Chattogram · Family Trip',
              featured: true,
            },
            {
              quote:
                'Most travel blogs hide local CNG and entry fees. VROMON showed itemized local fees and exact train fares before we even left home.',
              initials: 'AC',
              name: 'Anik Chowdhury',
              meta: 'Sylhet · Solo Explorer',
              featured: false,
            },
          ].map((t) => (
            <div
              key={t.name}
              className={`flex flex-col justify-between rounded-[32px] p-8 ${
                t.featured
                  ? 'bg-[#5D9253] text-white shadow-[0_24px_60px_rgba(47,107,47,0.28)] md:-translate-y-3'
                  : 'bg-white text-[#1F2A1F] shadow-[0_16px_40px_rgba(31,42,31,0.08)]'
              }`}
            >
              <div>
                <div
                  className={`mb-3 text-[40px] font-bold leading-none ${
                    t.featured ? 'text-white/90' : 'text-[#FFCB3D]'
                  }`}
                >
                  &ldquo;
                </div>
                <p className="text-[16px] md:text-[18px] font-normal leading-relaxed">{t.quote}</p>
              </div>

              <div className="mt-8 flex items-center gap-3.5">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-full text-[14px] font-bold ${
                    t.featured
                      ? 'bg-white text-[#2F6B2F] border-2 border-[#FFCB3D]'
                      : 'bg-[#D5E6CF] text-[#1F2A1F]'
                  }`}
                >
                  {t.initials}
                </div>
                <div>
                  <div className="text-[16px] font-semibold">{t.name}</div>
                  <div className={`text-[14px] ${t.featured ? 'text-white/80' : 'text-[#1F2A1F]/70'}`}>
                    {t.meta}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 7: FINAL CTA BANNER */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="relative overflow-hidden rounded-[44px] bg-gradient-to-br from-[#2F6B2F] to-[#5D9253] px-6 py-16 sm:px-12 text-center text-white shadow-[0_28px_70px_rgba(47,107,47,0.32)]">
          <div className="pointer-events-none absolute -top-20 -right-20 h-80 w-80 rounded-full bg-[#FFCB3D] opacity-35 blur-[100px]" />
          <div className="relative z-10 mx-auto max-w-2xl">
            <h2 className="text-[32px] md:text-[40px] font-bold leading-tight tracking-tight">
              Your next trip starts with one sentence.
            </h2>
            <p className="mt-4 text-[16px] md:text-[18px] font-normal text-white/85">
              No check-in dates needed yet. Just say what kind of peace or adventure you are
              craving.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                launchSearch(ctaWishes || wishes);
              }}
              className="mx-auto mt-8 flex max-w-xl items-center rounded-full bg-white p-2 pl-3 shadow-[0_20px_50px_rgba(0,0,0,0.2)]"
            >
              <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E5F0E0]">
                <Sparkles className="h-4 w-4 text-[#2F6B2F]" />
              </div>
              <input
                type="text"
                value={ctaWishes}
                onChange={(e) => setCtaWishes(e.target.value)}
                placeholder="E.g., Khulna food walk & sights under 10,000..."
                className="flex-1 min-w-0 bg-transparent px-3 text-[16px] font-normal text-[#1F2A1F] placeholder:text-[#1F2A1F]/45 focus:outline-none"
              />
              <button
                type="submit"
                className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-[#FFCB3D] px-5 text-[14px] font-semibold text-[#1F2A1F] hover:brightness-95"
              >
                <span>Plan my trip</span>
                <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
