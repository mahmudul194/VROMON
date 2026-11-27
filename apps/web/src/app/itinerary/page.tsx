'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Bookmark,
  Calendar,
  Check,
  Clock,
  CloudSun,
  Download,
  Loader2,
  MapPin,
  Share2,
  Sparkles,
  Train,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { DestinationMap } from '@/components/DestinationMap';
import { FeasibilityBadge } from '@/components/FeasibilityBadge';
import { ScoreRing } from '@/components/ScoreRing';

function ItineraryInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const destId = Number(searchParams.get('destId') || 1);
  const days = Number(searchParams.get('days') || 2);
  const usableHours = Number(searchParams.get('usable') || 14);
  const totalCost = Number(searchParams.get('totalCost') || 8250);
  const status = (searchParams.get('status') || 'Fits') as any;
  const score = Number(searchParams.get('score') || 88);
  const budget = Number(searchParams.get('budget') || 10000);
  const travelers = Number(searchParams.get('travelers') || 2);
  const month = Number(searchParams.get('month') || 12);
  const city = searchParams.get('city') || 'Dhaka';

  const [itinerary, setItinerary] = useState<any>(null);
  const [destInfo, setDestInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [shareUrl, setShareUrl] = useState('');
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiFetch('/itineraries/generate', {
        method: 'POST',
        body: JSON.stringify({
          destination_id: destId,
          days,
          usable_hours: usableHours,
        }),
      }),
      apiFetch(`/destinations/${destId}`).catch(() => null),
    ])
      .then(([itData, dData]) => {
        setItinerary(itData);
        setDestInfo(dData);
      })
      .catch(() => setItinerary(null))
      .finally(() => setLoading(false));
  }, [destId, days, usableHours]);

  const handleDownloadPdf = () => {
    if (!itinerary) return;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`VROMON Trip Plan: ${itinerary.destination_name}`, 14, 20);
    doc.setFontSize(11);
    doc.text(
      `${days} Days | ${travelers} Travelers | From ${city} | Est. Total: BDT ${totalCost.toLocaleString()} (${status})`,
      14,
      30,
    );

    let y = 44;
    for (const day of itinerary.days || []) {
      if (y > 265) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(13);
      doc.text(`Day ${day.day_number}: ${day.title}`, 14, y);
      y += 8;

      doc.setFontSize(10);
      for (const slot of day.slots || []) {
        if (y > 275) {
          doc.addPage();
          y = 20;
        }
        doc.text(`- [${slot.time_of_day}] ${slot.activity_name} (${slot.hours}h)`, 18, y);
        y += 6;
      }
      y += 4;
    }

    doc.save(`VROMON_${itinerary.destination_name}_${days}days.pdf`);
  };

  const handleShare = async () => {
    if (!itinerary) return;
    setSharing(true);
    try {
      const res = await apiFetch('/shared-plans', {
        method: 'POST',
        body: JSON.stringify({
          destination_id: destId,
          starting_city: city,
          budget,
          travelers,
          days,
          travel_month: month,
          has_holiday: false,
          total_cost: totalCost,
          feasibility_status: status === 'Discard' ? 'Over budget' : status,
          final_score: score,
          reason_text: `Grounded ${days}-day plan for ${itinerary.destination_name} with ${usableHours} usable hours.`,
          itinerary,
        }),
      });
      const url = `${window.location.origin}/plan/${res.share_id}`;
      setShareUrl(url);
      navigator.clipboard?.writeText(url).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } finally {
      setSharing(false);
    }
  };

  const handleSaveTrip = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!itinerary) return;
    try {
      await apiFetch('/trips', {
        method: 'POST',
        body: JSON.stringify({
          destination_id: destId,
          title: `${days}-Day Trip to ${itinerary.destination_name}`,
          query_params: {
            budget,
            travelers,
            days,
            travel_month: month,
            starting_city: city,
          },
          recommendation_snapshot: {
            destination_id: destId,
            name: itinerary.destination_name,
            division: destInfo?.division || '',
            district: destInfo?.district || '',
            image_url: destInfo?.image_url || '',
            cost_breakdown: { total_cost: totalCost },
            feasibility_status: status,
            scores: { final_score: score },
            usable_hours: usableHours,
            itinerary,
          },
        }),
      });
      setSaved(true);
    } catch {
      // Ignore duplicate save clicks
    }
  };

  if (loading) {
    return (
      <div className="relative mx-auto flex min-h-[calc(100vh-180px)] w-full select-none flex-col items-center justify-center overflow-hidden px-4 py-12 text-center">
        {/* Atmospheric Ambient Orbs (#29 Curating Expedition Loader) */}
        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#B0F3A8]/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-[28rem] w-[28rem] rounded-full bg-[#FFCB3D]/20 blur-3xl" />

        <div className="relative z-10 flex max-w-xl flex-col items-center">
          {/* Editorial Monogram Centerpiece */}
          <div className="relative mb-9 flex h-48 w-48 items-center justify-center">
            <div
              className="absolute inset-0 animate-[spin_8s_linear_infinite] rounded-full p-[2.5px]"
              style={{
                background:
                  'conic-gradient(from 0deg, #2F6B2F 0%, #B0F3A8 35%, #FFCB3D 65%, #2F6B2F 100%)',
              }}
            >
              <div className="h-full w-full rounded-full bg-[#E5F2E0]" />
            </div>
            <div className="absolute inset-3 animate-ping rounded-full bg-[#B0F3A8]/35 opacity-35" />

            <div className="relative z-10 flex h-36 w-36 items-center justify-center rounded-full bg-white/95 shadow-xl backdrop-blur-md">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#145219]/10 via-transparent to-[#FFCB3D]/25" />
              <div className="relative z-20 animate-pulse text-[#145219]">
                <svg
                  className="h-20 w-20 drop-shadow-sm"
                  fill="none"
                  viewBox="0 0 88 88"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M44 8C44 8 20 28 20 52C20 65.2548 30.7452 76 44 76C57.2548 76 68 65.2548 68 52C68 28 44 8 44 8Z"
                    fill="#2F6B2F"
                    fillOpacity="0.12"
                  />
                  <path d="M44 14L52 44L44 74L36 44L44 14Z" fill="#145219" />
                  <path d="M44 14L52 44H44V14Z" fill="#FFCB3D" />
                  <circle cx="44" cy="44" fill="#FFFFFF" r="5" />
                  <circle cx="44" cy="44" fill="#FFCB3D" r="2.5" />
                  <circle
                    cx="44"
                    cy="44"
                    r="32"
                    stroke="#2F6B2F"
                    strokeDasharray="4 6"
                    strokeOpacity="0.4"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
              <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#FFCB3D] text-[#1F2A1F] shadow-md">
                <Sparkles className="h-4 w-4" />
              </div>
            </div>
          </div>

          <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[#1F511A]">
            Curating Your Expedition
          </span>
          <h2 className="mt-2 text-[28px] font-bold leading-[34px] tracking-tight text-[#1F2A1F] sm:text-[40px] sm:leading-[48px]">
            Discovering Bangladesh
          </h2>

          {/* Dynamic Status Pill */}
          <div className="my-6 inline-flex items-center gap-3 rounded-full bg-white/85 px-6 py-3 shadow-sm backdrop-blur-md">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FFCB3D] opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#FFCB3D]" />
            </span>
            <p className="text-[15px] font-medium text-[#41493E]">
              Scheduling verified attractions within your {usableHours} usable daylight hours...
            </p>
          </div>

          {/* 3-Phase Stepper Capsule */}
          <div className="mb-8 flex w-full max-w-md items-center justify-between rounded-full bg-[#DFECDB]/80 p-1.5 shadow-inner">
            <div className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-[13px] font-semibold uppercase tracking-[0.06em] text-[#145219] shadow-sm">
              <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
              <span>Preferences</span>
            </div>
            <div className="h-0.5 w-3 rounded-full bg-[#C1C9BB]" />
            <div className="flex items-center gap-1.5 rounded-full bg-[#145219] px-3.5 py-1.5 text-[13px] font-semibold uppercase tracking-[0.06em] text-white shadow-sm">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#FFCB3D]" />
              <span>Route Logic</span>
            </div>
            <div className="h-0.5 w-3 rounded-full bg-[#C1C9BB]" />
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 text-[13px] font-semibold uppercase tracking-[0.06em] text-[#557945]">
              <span>Day Plan</span>
            </div>
          </div>

          <div className="h-1.5 w-64 overflow-hidden rounded-full bg-[#D9E6D5]">
            <div className="h-full w-2/3 animate-pulse rounded-full bg-gradient-to-r from-[#145219] to-[#FFCB3D]" />
          </div>
        </div>
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div className="mx-auto max-w-xl space-y-4 p-16 text-center">
        <h2 className="text-xl font-extrabold text-[#1F2A1F]">Could not create trip plan</h2>
        <Link
          href="/plan"
          className="inline-flex rounded-full bg-[#2F6B2F] px-6 py-2.5 text-[14px] font-bold text-white"
        >
          Return to Planner
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1240px] space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Back + Action Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={`/destinations/${destId}?budget=${budget}&travelers=${travelers}&days=${days}&month=${month}&city=${encodeURIComponent(city)}`}
          className="inline-flex w-fit items-center gap-2 rounded-full border border-[#D5E6CF] bg-white px-4 py-2 text-[14px] font-bold text-[#1F2A1F] shadow-sm hover:bg-[#eaf7e6]"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-[#2F6B2F]" />
          <span>Back to {itinerary.destination_name}</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleSaveTrip}
            className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-[14px] font-bold transition ${
              saved
                ? 'bg-[#eaf7e6] text-[#2F6B2F]'
                : 'border border-[#D5E6CF] bg-white text-[#1F2A1F] hover:bg-[#eaf7e6]'
            }`}
          >
            {saved ? <Check className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
            <span>{saved ? 'Saved to Trips' : 'Save Trip'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-[#D5E6CF] bg-white px-4 text-[14px] font-bold text-[#1F2A1F] hover:bg-[#eaf7e6]"
          >
            <Download className="h-3.5 w-3.5 text-[#2F6B2F]" />
            <span>Download PDF</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            disabled={sharing}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-[#2F6B2F] px-5 text-[14px] font-bold text-white shadow-sm hover:bg-[#145219] disabled:opacity-60"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-[#FFCB3D]" /> : <Share2 className="h-3.5 w-3.5 text-[#FFCB3D]" />}
            <span>{copied ? 'Link Copied' : sharing ? 'Creating link...' : 'Share 30-Day Link'}</span>
          </button>
        </div>
      </div>

      {/* Share Link Banner */}
      {shareUrl && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#5D9253]/40 bg-[#eaf7e6] px-5 py-3.5 text-[14px] text-[#1F2A1F]">
          <div>
            <span className="font-extrabold text-[#2F6B2F]">30-Day Shareable Plan URL:</span>{' '}
            <a href={shareUrl} className="font-semibold underline">
              {shareUrl}
            </a>
          </div>
          <span className="rounded-full bg-white px-3 py-1 font-bold text-[#2F6B2F]">
            Public Read-Only Active
          </span>
        </div>
      )}

      {/* Top KPI Bar (Stitch 10_itinerary) */}
      <div className="grid grid-cols-1 gap-4 rounded-[26px] border border-[#D5E6CF]/70 bg-white p-6 shadow-sm lg:grid-cols-12">
        <div className="flex items-center gap-4 lg:col-span-5">
          <ScoreRing score={score} size={70} />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#eaf7e6] px-3 py-0.5 text-[14px] font-bold uppercase text-[#2F6B2F]">
                {days}-Day Plan
              </span>
              <FeasibilityBadge status={status} />
            </div>
            <h1 className="mt-1.5 text-[36px] md:text-[40px] font-extrabold tracking-tight text-[#1F2A1F]">
              {itinerary.destination_name}
            </h1>
            <p className="text-[14px] font-medium text-[#557945]">
              {travelers} traveler{travelers > 1 ? 's' : ''} departing from {city} • Month {month}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 lg:col-span-7">
          <div className="rounded-2xl border border-[#E5F0E0] bg-[#F6FAF3] p-4">
            <span className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[#557945]">
              Est. Total Cost
            </span>
            <p className="mt-1 text-xl font-black text-[#2F6B2F]">
              ৳{totalCost.toLocaleString()}
            </p>
          </div>
          <div className="rounded-2xl border border-[#E5F0E0] bg-[#F6FAF3] p-4">
            <span className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[#557945]">
              Usable Daylight
            </span>
            <p className="mt-1 text-xl font-black text-[#1F2A1F]">{usableHours} hrs</p>
          </div>
          <div className="rounded-2xl border border-[#E5F0E0] bg-[#F6FAF3] p-4">
            <span className="flex items-center gap-1 text-[13px] font-semibold uppercase tracking-[0.06em] text-[#557945]">
              <CloudSun className="h-3 w-3" /> Budget Cap
            </span>
            <p className="mt-1 text-xl font-black text-[#1F2A1F]">৳{budget.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Main 12-Col Stitch 10_itinerary Body */}
      <div className="grid grid-cols-1 gap-7 lg:grid-cols-12">
        {/* Left 7 Cols: AI Synthesis + Vertical Day Timeline */}
        <div className="space-y-6 lg:col-span-7">
          <div className="rounded-[26px] border border-[#D5E6CF] bg-[#eaf7e6]/70 p-6">
            <div className="mb-2 flex items-center gap-2 text-[14px] font-extrabold uppercase tracking-wider text-[#2F6B2F]">
              <Sparkles className="h-4 w-4" />
              AI Synthesis &amp; Route Logic
            </div>
            <p className="text-[16px] leading-relaxed text-[#1F2A1F]">
              Scheduled within {usableHours} usable explore hours across {days} day{days > 1 ? 's' : ''}, prioritizing nearby verified attractions in {itinerary.destination_name} to prevent transit rush and stay within your ৳{budget.toLocaleString()} group ceiling.
            </p>
          </div>

          <div className="space-y-6">
            {(itinerary.days || []).map((day: any) => (
              <div
                key={day.day_number}
                className="overflow-hidden rounded-[26px] border border-[#D5E6CF]/70 bg-white shadow-sm"
              >
                <div className="flex items-center justify-between bg-[#2F6B2F] px-6 py-4 text-white">
                  <div className="flex items-center gap-2.5">
                    <span className="rounded-full bg-[#FFCB3D] px-3 py-0.5 text-[14px] font-black text-[#1F2A1F]">
                      DAY {day.day_number}
                    </span>
                    <h2 className="text-base font-extrabold">{day.title}</h2>
                  </div>
                  <Calendar className="h-4 w-4 text-[#D5E6CF]" />
                </div>

                <div className="space-y-3 p-6">
                  {(day.slots || []).map((slot: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex flex-col gap-2 rounded-2xl border border-[#E5F0E0] bg-[#F6FAF3] p-4 sm:flex-row sm:items-start sm:justify-between"
                    >
                      <div className="space-y-1">
                        <span className="inline-block rounded-full bg-white px-2.5 py-0.5 text-[13px] font-semibold uppercase tracking-[0.06em] text-[#2F6B2F] border border-[#D5E6CF]">
                          {slot.time_of_day}
                        </span>
                        <h3 className="text-[14px] font-extrabold text-[#1F2A1F]">
                          {slot.activity_name}
                        </h3>
                        {slot.description && (
                          <p className="text-[14px] leading-relaxed text-[#557945]">
                            {slot.description}
                          </p>
                        )}
                      </div>

                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-3 py-1 text-[14px] font-bold text-[#1F2A1F] border border-[#D5E6CF]">
                        <Clock className="h-3 w-3 text-[#2F6B2F]" /> {slot.hours}h
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sticky Right Map & Destination Summary */}
        <aside className="lg:col-span-5">
          <div className="sticky top-24 space-y-5 rounded-[26px] border border-[#D5E6CF]/70 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-extrabold text-[#1F2A1F]">
                <MapPin className="h-4 w-4 text-[#2F6B2F]" />
                Destination Route Map
              </h2>
              {destInfo?.division && (
                <span className="rounded-full bg-[#eaf7e6] px-3 py-0.5 text-[14px] font-bold text-[#2F6B2F]">
                  {destInfo.division}
                </span>
              )}
            </div>

            {destInfo ? (
              <>
                <DestinationMap
                  latitude={destInfo.latitude}
                  longitude={destInfo.longitude}
                  name={destInfo.name}
                  district={destInfo.district}
                />
                <div className="grid grid-cols-2 gap-3 pt-1 text-[14px]">
                  <div className="rounded-2xl bg-[#F6FAF3] p-3 border border-[#E5F0E0]">
                    <p className="font-bold text-[#557945]">Avg. Room Rate</p>
                    <p className="mt-0.5 text-[16px] font-extrabold text-[#1F2A1F]">
                      ৳{destInfo.hotel_cost_per_room_night?.toLocaleString()}/night
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#F6FAF3] p-3 border border-[#E5F0E0]">
                    <p className="font-bold text-[#557945]">Daily Meals</p>
                    <p className="mt-0.5 text-[16px] font-extrabold text-[#1F2A1F]">
                      ৳{destInfo.food_cost_per_person_day?.toLocaleString()}/day
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 rounded-2xl bg-[#F6FAF3] p-5 text-[14px] text-[#557945]">
                <Train className="h-4 w-4 text-[#2F6B2F]" />
                Interactive coordinates available when viewing from catalog.
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function ItineraryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#2F6B2F]" />
        </div>
      }
    >
      <ItineraryInner />
    </Suspense>
  );
}
