'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  Download,
  Loader2,
  Share2,
  Sparkles,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { apiFetch } from '@/lib/api';

function ItineraryInner() {
  const searchParams = useSearchParams();
  const destId = Number(searchParams.get('destId') || 1);
  const days = Number(searchParams.get('days') || 2);
  const usableHours = Number(searchParams.get('usable') || 14);
  const totalCost = Number(searchParams.get('totalCost') || 8250);
  const status = searchParams.get('status') || 'Fits';
  const score = Number(searchParams.get('score') || 88);
  const budget = Number(searchParams.get('budget') || 10000);
  const travelers = Number(searchParams.get('travelers') || 2);
  const month = Number(searchParams.get('month') || 12);
  const city = searchParams.get('city') || 'Dhaka';

  const [itinerary, setItinerary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [shareUrl, setShareUrl] = useState('');
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLoading(true);
    apiFetch('/itineraries/generate', {
      method: 'POST',
      body: JSON.stringify({
        destination_id: destId,
        days,
        usable_hours: usableHours,
      }),
    })
      .then(setItinerary)
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

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center space-y-4">
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-vromon-primary" />
        <h2 className="text-xl font-extrabold text-vromon-dark">
          Building Day-by-Day Grounded Itinerary
        </h2>
        <p className="text-sm text-vromon-muted">
          Scheduling stored attractions within your {usableHours} usable hours...
        </p>
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div className="mx-auto max-w-xl p-16 text-center space-y-4">
        <h2 className="text-xl font-extrabold text-vromon-dark">Could not generate itinerary</h2>
        <Link href="/plan" className="inline-flex rounded-full bg-vromon-primary px-6 py-2.5 text-sm font-bold text-white">
          Return to Planner
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-10 space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={`/destinations/${destId}`}
          className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-vromon-dark shadow-soft border border-vromon-pill"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to {itinerary.destination_name}</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleDownloadPdf}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-vromon-dark/20 bg-white px-5 text-xs font-bold text-vromon-dark hover:bg-vromon-leaf"
          >
            <Download className="h-4 w-4 text-vromon-primary" />
            <span>Export PDF</span>
          </button>

          <button
            onClick={handleShare}
            disabled={sharing}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-vromon-primary px-5 text-xs font-bold text-white hover:bg-vromon-deep"
          >
            {sharing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : copied ? (
              <Check className="h-4 w-4 text-vromon-amber" />
            ) : (
              <Share2 className="h-4 w-4 text-vromon-amber" />
            )}
            <span>{copied ? 'Link Copied!' : 'Create 30-Day Share Link'}</span>
          </button>
        </div>
      </div>

      {shareUrl && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-2xl bg-vromon-leaf border border-vromon-accent/40 p-4 text-xs">
          <span className="font-semibold text-vromon-deep">
            Public 30-day shareable link created (no personal info included):
          </span>
          <Link href={shareUrl} className="font-bold text-vromon-primary underline break-all">
            {shareUrl}
          </Link>
        </div>
      )}

      {/* Header Summary Card */}
      <div className="rounded-[28px] bg-white p-6 sm:p-8 shadow-ambient border border-vromon-pill">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-vromon-pill px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-vromon-deep">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Grounded Schedule</span>
        </div>
        <h1 className="mt-3 text-3xl font-extrabold text-vromon-dark">
          {days}-Day Itinerary for {itinerary.destination_name}
        </h1>
        <p className="mt-1.5 text-sm text-vromon-muted">
          {travelers} Traveler(s) from {city} • Total Cost Estimate: ৳{totalCost.toLocaleString()} ({status}) • {usableHours} usable exploration hours
        </p>
      </div>

      {/* Day Cards */}
      <div className="space-y-6">
        {(itinerary.days || []).map((day: any) => (
          <section
            key={day.day_number}
            className="rounded-[28px] bg-white p-6 sm:p-8 shadow-soft border border-vromon-pill space-y-5"
          >
            <div className="flex items-center gap-3 border-b border-vromon-pill pb-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-vromon-primary text-sm font-extrabold text-white">
                D{day.day_number}
              </span>
              <div>
                <h2 className="text-lg font-extrabold text-vromon-dark">
                  Day {day.day_number}: {day.title}
                </h2>
                <p className="text-xs text-vromon-muted flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Max 12h daytime pacing
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {(day.slots || []).map((slot: any, idx: number) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-vromon-leaf p-4 border border-vromon-pill"
                >
                  <div className="space-y-1">
                    <span className="inline-block rounded-full bg-vromon-amber px-2.5 py-0.5 text-[11px] font-bold text-vromon-dark">
                      {slot.time_of_day}
                    </span>
                    <h3 className="text-sm font-bold text-vromon-dark">{slot.activity_name}</h3>
                    <p className="text-xs text-vromon-muted">{slot.description}</p>
                  </div>
                  <span className="inline-flex w-fit items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-bold text-vromon-deep shrink-0">
                    <Clock className="h-3.5 w-3.5" /> {slot.hours} hrs
                  </span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export default function ItineraryPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-sm">Loading itinerary...</div>}>
      <ItineraryInner />
    </Suspense>
  );
}
