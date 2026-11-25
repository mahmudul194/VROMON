'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Database, Loader2, ShieldAlert, Upload } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [destinations, setDestinations] = useState<any[]>([]);
  const [jsonText, setJsonText] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState('');

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      Promise.all([apiFetch('/admin/stats'), apiFetch('/destinations')])
        .then(([s, d]) => {
          setStats(s);
          setDestinations(d);
        })
        .catch(() => {});
    }
  }, [user]);

  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setImporting(true);
    setImportResult('');
    try {
      const parsed = JSON.parse(jsonText);
      const records = Array.isArray(parsed) ? parsed : [parsed];
      const res = await apiFetch('/admin/destinations/bulk', {
        method: 'POST',
        body: JSON.stringify({ records }),
      });
      setImportResult(`Loaded ${res.loaded}/${res.records_read} destination records.`);
      setJsonText('');
    } catch (err: any) {
      setImportResult(`Error: ${err.message}`);
    } finally {
      setImporting(false);
    }
  };

  if (authLoading) {
    return <div className="p-16 text-center text-sm">Checking authorization...</div>;
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="mx-auto max-w-md p-16 text-center space-y-4">
        <ShieldAlert className="mx-auto h-10 w-10 text-vromon-danger" />
        <h1 className="text-2xl font-extrabold text-vromon-dark">Administrator Access Only</h1>
        <p className="text-sm text-vromon-muted">
          Sign in with an Admin account to manage the 64-district destination catalog.
        </p>
        <Link href="/login" className="inline-flex rounded-full bg-vromon-primary px-6 py-2.5 text-sm font-bold text-white">
          Sign In as Admin
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10 space-y-8">
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-vromon-pill px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-vromon-deep">
          <Database className="h-3.5 w-3.5" />
          <span>Admin Console</span>
        </span>
        <h1 className="mt-2 text-3xl font-extrabold text-vromon-dark">
          Catalog & Telemetry Management
        </h1>
      </div>

      {/* Metrics Cards */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Destinations', value: stats.totals.destinations },
            { label: 'Registered Users', value: stats.totals.users },
            { label: 'Search Queries', value: stats.totals.queries },
            { label: 'Shared Plans', value: stats.totals.shared_plans },
          ].map((m) => (
            <div
              key={m.label}
              className="rounded-[24px] bg-white p-5 shadow-soft border border-vromon-pill"
            >
              <span className="text-xs font-bold uppercase tracking-wider text-vromon-muted">
                {m.label}
              </span>
              <p className="mt-2 text-3xl font-extrabold text-vromon-deep">{m.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Bulk JSON Uploader (FR-17) */}
      <div className="rounded-[28px] bg-white p-6 sm:p-8 shadow-soft border border-vromon-pill space-y-4">
        <div className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-vromon-primary" />
          <h2 className="text-xl font-extrabold text-vromon-dark">
            Batch JSON Catalog Import (FR-17)
          </h2>
        </div>
        <form onSubmit={handleBulkImport} className="space-y-3">
          <textarea
            rows={4}
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder='[{"name":"Saint Martin","division":"Chattogram","district":"Coxs Bazar","hotel_cost_per_room_night":3500}]'
            className="w-full rounded-2xl border border-vromon-border/70 bg-vromon-leaf p-4 text-xs font-mono text-vromon-dark"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-vromon-deep">{importResult}</span>
            <button
              type="submit"
              disabled={importing || !jsonText.trim()}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-vromon-primary px-5 text-xs font-bold text-white hover:bg-vromon-deep disabled:opacity-60"
            >
              {importing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Upload & Upsert Records</span>
            </button>
          </div>
        </form>
      </div>

      {/* Destinations Table */}
      <div className="overflow-x-auto rounded-[28px] bg-white shadow-soft border border-vromon-pill">
        <div className="p-6 border-b border-vromon-pill">
          <h2 className="text-xl font-extrabold text-vromon-dark">
            Active Destinations ({destinations.length})
          </h2>
        </div>
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead>
            <tr className="bg-vromon-leaf text-xs uppercase tracking-wider text-vromon-muted">
              <th className="p-4">Name</th>
              <th className="p-4">Division</th>
              <th className="p-4">Cost Tier</th>
              <th className="p-4">Hotel/Night</th>
              <th className="p-4">Food/Day</th>
              <th className="p-4">Min Hours</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-vromon-pill">
            {destinations.map((d) => (
              <tr key={d.destination_id} className="hover:bg-vromon-canvas/40">
                <td className="p-4 font-bold text-vromon-dark">
                  {d.name} {d.name_bn ? `(${d.name_bn})` : ''}
                </td>
                <td className="p-4 text-vromon-muted">{d.division}</td>
                <td className="p-4">
                  <span className="rounded-full bg-vromon-pill px-2.5 py-0.5 text-xs font-bold text-vromon-deep">
                    {d.cost_level}
                  </span>
                </td>
                <td className="p-4 font-semibold">৳{d.hotel_cost_per_room_night}</td>
                <td className="p-4">৳{d.food_cost_per_person_day}</td>
                <td className="p-4">{d.min_hours_needed}h</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
