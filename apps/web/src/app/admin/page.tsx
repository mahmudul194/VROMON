'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  Database,
  Edit3,
  LayoutDashboard,
  Loader2,
  LogOut,
  MapPin,
  Search,
  ShieldCheck,
  Upload,
  X,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { adminApiFetch } from '@/lib/api';

interface AdminIdentity {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<AdminIdentity | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'destinations' | 'import'>('overview');
  const [stats, setStats] = useState<any>(null);
  const [destinations, setDestinations] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Slide-over Editor State (Stitch #24)
  const [editingDest, setEditingDest] = useState<any>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editNotice, setEditNotice] = useState('');

  // Bulk JSON Upload State
  const [jsonText, setJsonText] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState('');

  const loadAdminData = useCallback(() => {
    Promise.all([adminApiFetch('/admin/stats'), adminApiFetch('/destinations')])
      .then(([s, d]) => {
        setStats(s);
        setDestinations(d);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('vromon_admin_token');
    if (!token) {
      router.replace('/admin/login');
      return;
    }

    adminApiFetch<{ user: AdminIdentity }>('/auth/me')
      .then((res) => {
        if (!res?.user || res.user.role !== 'ADMIN') {
          localStorage.removeItem('vromon_admin_token');
          localStorage.removeItem('vromon_admin_user');
          router.replace('/admin/login');
          return;
        }
        setAdminUser(res.user);
        setCheckingAuth(false);
        loadAdminData();
      })
      .catch(() => {
        localStorage.removeItem('vromon_admin_token');
        localStorage.removeItem('vromon_admin_user');
        router.replace('/admin/login');
      });
  }, [router, loadAdminData]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onExpired = () => router.replace('/admin/login');
    window.addEventListener('vromon:admin-expired', onExpired);
    return () => window.removeEventListener('vromon:admin-expired', onExpired);
  }, [router]);

  const handleAdminLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vromon_admin_token');
      localStorage.removeItem('vromon_admin_user');
    }
    router.push('/admin/login');
  };

  const costTierData = useMemo(() => {
    const counts: Record<string, number> = { Low: 0, Medium: 0, High: 0 };
    destinations.forEach((d) => {
      counts[d.cost_level] = (counts[d.cost_level] || 0) + 1;
    });
    return Object.entries(counts).map(([tier, count]) => ({ tier, count }));
  }, [destinations]);

  const queryBudgetSeries = useMemo(() => {
    return (stats?.recent_queries || [])
      .slice(0, 8)
      .reverse()
      .map((q: any, idx: number) => ({
        idx: `#${idx + 1}`,
        budget: Number(q.budget || 0),
        travelers: q.travelers || 1,
      }));
  }, [stats]);

  const filteredDestinations = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return destinations;
    return destinations.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.division.toLowerCase().includes(q) ||
        d.district.toLowerCase().includes(q),
    );
  }, [destinations, searchTerm]);

  const handleSaveDestination = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDest) return;
    setSavingEdit(true);
    setEditNotice('');
    try {
      await adminApiFetch(`/admin/destinations/${editingDest.destination_id}`, {
        method: 'PUT',
        body: JSON.stringify({
          hotel_cost_per_room_night: Number(editingDest.hotel_cost_per_room_night),
          food_cost_per_person_day: Number(editingDest.food_cost_per_person_day),
          local_fees_per_person: Number(editingDest.local_fees_per_person),
          min_hours_needed: Number(editingDest.min_hours_needed),
          cost_level: editingDest.cost_level,
          description: editingDest.description,
        }),
      });
      setDestinations((prev) =>
        prev.map((d) =>
          d.destination_id === editingDest.destination_id ? { ...d, ...editingDest } : d,
        ),
      );
      setEditNotice('Destination updated in PostgreSQL.');
      setTimeout(() => {
        setEditingDest(null);
        setEditNotice('');
      }, 900);
    } catch (err: any) {
      setEditNotice(`Error: ${err.message}`);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setImporting(true);
    setImportResult('');
    try {
      const parsed = JSON.parse(jsonText);
      const records = Array.isArray(parsed) ? parsed : [parsed];
      const res = await adminApiFetch('/admin/destinations/bulk', {
        method: 'POST',
        body: JSON.stringify({ records }),
      });
      setImportResult(`Loaded ${res.loaded}/${res.records_read} destination records.`);
      setJsonText('');
      loadAdminData();
    } catch (err: any) {
      setImportResult(`Error: ${err.message}`);
    } finally {
      setImporting(false);
    }
  };

  if (checkingAuth || !adminUser) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#E5F0E0]">
        <Loader2 className="h-9 w-9 animate-spin text-[#2F6B2F]" />
        <p className="text-[14px] font-semibold text-[#557945]">Loading Admin Console...</p>
      </div>
    );
  }

  const adminInitial = adminUser.name?.trim().charAt(0).toUpperCase() || 'A';

  return (
    <div className="min-h-screen bg-[#E5F0E0] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1340px]">
        <div className="grid grid-cols-1 gap-7 lg:grid-cols-12">
          {/* Standalone Stitch #23/#24 Left Admin Sidebar (No Consumer Navbar) */}
          <aside className="lg:col-span-3">
            <div className="sticky top-6 flex flex-col justify-between space-y-6 rounded-[28px] border border-[#D5E6CF] bg-white p-6 shadow-[0_18px_50px_rgba(31,42,31,0.08)]">
              <div className="space-y-5">
                {/* Brand + Operations Header */}
                <div className="border-b border-[#E5F0E0] pb-5">
                  <img
                    src="/vromon_logo.png"
                    alt="VROMON"
                    className="mb-4 h-9 w-auto object-contain"
                  />
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eaf7e6] px-3 py-1 text-[13px] font-semibold uppercase tracking-[0.06em] text-[#2F6B2F]">
                    <Database className="h-3.5 w-3.5" />
                    Operations
                  </span>
                  <h1 className="mt-2.5 text-[40px] font-bold leading-tight text-[#1F2A1F]">
                    Admin Console
                  </h1>
                </div>

                {/* Navigation */}
                <nav className="space-y-1.5">
                  {[
                    { id: 'overview', label: 'Overview & Telemetry', icon: LayoutDashboard },
                    {
                      id: 'destinations',
                      label: `Destinations (${destinations.length})`,
                      icon: MapPin,
                    },
                    { id: 'import', label: 'Bulk JSON Import', icon: Upload },
                  ].map((item) => {
                    const Icon = item.icon;
                    const active = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveTab(item.id as any)}
                        className={`flex w-full items-center gap-2.5 rounded-2xl px-4 py-3 text-[14px] font-semibold transition ${
                          active
                            ? 'bg-[#2F6B2F] text-white shadow-sm'
                            : 'text-[#557945] hover:bg-[#F6FAF3] hover:text-[#1F2A1F]'
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {item.label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Admin Identity + Public Site + Admin Sign Out */}
              <div className="space-y-3 border-t border-[#E5F0E0] pt-5">
                <div className="flex items-center gap-3 rounded-2xl bg-[#F6FAF3] p-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#145219] text-[14px] font-extrabold text-[#FFCB3D]">
                    {adminInitial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <span className="truncate text-[14px] font-bold text-[#1F2A1F]">
                        {adminUser.name}
                      </span>
                      <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[#2F6B2F]" />
                    </div>
                    <p className="truncate text-[14px] text-[#557945]">{adminUser.email}</p>
                  </div>
                </div>

                <Link
                  href="/"
                  className="flex h-11 w-full items-center justify-between rounded-full border border-[#D5E6CF] bg-white px-4 text-[14px] font-semibold text-[#1F2A1F] transition hover:bg-[#EAF7E6]"
                >
                  <span>View Public Website</span>
                  <ArrowUpRight className="h-4 w-4 text-[#2F6B2F]" />
                </Link>

                <button
                  type="button"
                  onClick={handleAdminLogout}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#FFF6D6] px-4 text-[14px] font-semibold text-[#9A6B00] transition hover:bg-[#FFDF97]"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out of Admin</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Main Admin Workspace */}
          <div className="space-y-7 lg:col-span-9">
            {activeTab === 'overview' && (
              <>
                {/* 4 KPI Cards (44px bold card numbers, min 14px text) */}
                {stats && (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="rounded-[24px] border border-[#D5E6CF] bg-white p-5 shadow-sm">
                      <span className="text-[14px] font-semibold uppercase tracking-[0.04em] text-[#557945]">
                        Destinations
                      </span>
                      <p className="mt-2 text-[44px] font-bold leading-none text-[#1F2A1F]">
                        {stats.totals.destinations}
                      </p>
                    </div>
                    <div className="rounded-[24px] border border-[#D5E6CF] bg-white p-5 shadow-sm">
                      <span className="text-[14px] font-semibold uppercase tracking-[0.04em] text-[#557945]">
                        Users
                      </span>
                      <p className="mt-2 text-[44px] font-bold leading-none text-[#1F2A1F]">
                        {stats.totals.users}
                      </p>
                    </div>
                    <div className="rounded-[24px] border border-[#D5E6CF] bg-white p-5 shadow-sm">
                      <span className="text-[14px] font-semibold uppercase tracking-[0.04em] text-[#557945]">
                        Queries
                      </span>
                      <p className="mt-2 text-[44px] font-bold leading-none text-[#2F6B2F]">
                        {stats.totals.queries}
                      </p>
                    </div>
                    <div className="rounded-[24px] bg-gradient-to-br from-[#235425] to-[#145219] p-5 text-white shadow-md">
                      <span className="text-[14px] font-semibold uppercase tracking-[0.04em] text-[#D5E6CF]">
                        Shared Plans
                      </span>
                      <p className="mt-2 text-[44px] font-bold leading-none text-[#FFCB3D]">
                        {stats.totals.shared_plans}
                      </p>
                    </div>
                  </div>
                )}

                {/* Charts Row */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="rounded-[26px] border border-[#D5E6CF] bg-white p-6 shadow-sm">
                    <h2 className="text-[24px] font-semibold text-[#1F2A1F]">
                      Cost Tier Distribution
                    </h2>
                    <p className="mt-1 text-[14px] text-[#557945]">
                      Live breakdown of Low, Medium, and High districts
                    </p>
                    <div className="mt-4 h-56 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={costTierData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5F0E0" vertical={false} />
                          <XAxis dataKey="tier" tick={{ fill: '#1F2A1F', fontSize: 14 }} />
                          <YAxis tick={{ fill: '#557945', fontSize: 14 }} />
                          <Tooltip />
                          <Bar dataKey="count" fill="#2F6B2F" radius={[10, 10, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="rounded-[26px] border border-[#D5E6CF] bg-white p-6 shadow-sm">
                    <h2 className="text-[24px] font-semibold text-[#1F2A1F]">
                      Recent Budget Trend
                    </h2>
                    <p className="mt-1 text-[14px] text-[#557945]">
                      Latest traveler group budgets in BDT
                    </p>
                    <div className="mt-4 h-56 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={queryBudgetSeries}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5F0E0" vertical={false} />
                          <XAxis dataKey="idx" tick={{ fill: '#1F2A1F', fontSize: 14 }} />
                          <YAxis tick={{ fill: '#557945', fontSize: 14 }} />
                          <Tooltip />
                          <Area
                            type="monotone"
                            dataKey="budget"
                            stroke="#2F6B2F"
                            fill="#eaf7e6"
                            strokeWidth={2.5}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Recent Query Telemetry Table */}
                <div className="overflow-x-auto rounded-[26px] border border-[#D5E6CF] bg-white shadow-sm">
                  <div className="flex items-center gap-2 border-b border-[#E5F0E0] p-5">
                    <Activity className="h-4 w-4 text-[#2F6B2F]" />
                    <h2 className="text-[24px] font-semibold text-[#1F2A1F]">
                      Recent Planner Telemetry
                    </h2>
                  </div>
                  <table className="w-full min-w-[600px] text-left text-[14px]">
                    <thead>
                      <tr className="bg-[#F6FAF3] text-[14px] font-semibold uppercase tracking-[0.04em] text-[#557945]">
                        <th className="p-4">Origin Hub</th>
                        <th className="p-4">Budget (BDT)</th>
                        <th className="p-4">Travelers / Days</th>
                        <th className="p-4">Prompt Summary</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5F0E0]">
                      {(stats?.recent_queries || []).map((q: any, i: number) => (
                        <tr key={i} className="hover:bg-[#F6FAF3]/60">
                          <td className="p-4 font-semibold text-[#1F2A1F]">{q.starting_city}</td>
                          <td className="p-4 font-bold text-[#2F6B2F]">
                            ৳{Number(q.budget).toLocaleString()}
                          </td>
                          <td className="p-4 text-[#557945]">
                            {q.travelers} guests • {q.days} days
                          </td>
                          <td className="max-w-xs truncate p-4 text-[#1F2A1F]">{q.wishes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {activeTab === 'destinations' && (
              <div className="overflow-hidden rounded-[26px] border border-[#D5E6CF] bg-white shadow-sm">
                <div className="flex flex-col justify-between gap-4 border-b border-[#E5F0E0] p-6 sm:flex-row sm:items-center">
                  <div>
                    <h2 className="text-[24px] font-semibold text-[#1F2A1F]">
                      Destinations Catalog Management
                    </h2>
                    <p className="mt-1 text-[14px] text-[#557945]">
                      Click Edit on any district to update room rates, meal budgets, or transit
                      hours.
                    </p>
                  </div>
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5D9253]" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Filter destinations..."
                      className="h-11 w-full rounded-full border border-[#D5E6CF] bg-[#F6FAF3] pl-10 pr-4 text-[14px] font-medium text-[#1F2A1F] focus:border-[#2F6B2F] focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left text-[14px]">
                    <thead>
                      <tr className="bg-[#F6FAF3] text-[14px] font-semibold uppercase tracking-[0.04em] text-[#557945]">
                        <th className="p-4">Name</th>
                        <th className="p-4">Division</th>
                        <th className="p-4">Cost Tier</th>
                        <th className="p-4">Hotel/Night</th>
                        <th className="p-4">Food/Day</th>
                        <th className="p-4">Min Hours</th>
                        <th className="p-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5F0E0]">
                      {filteredDestinations.map((d) => (
                        <tr key={d.destination_id} className="hover:bg-[#F6FAF3]/60">
                          <td className="p-4 font-semibold text-[#1F2A1F]">
                            {d.name}{' '}
                            {d.name_bn && (
                              <span className="text-[14px] font-normal text-[#557945]">
                                ({d.name_bn})
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-[#557945]">{d.division}</td>
                          <td className="p-4">
                            <span className="rounded-full bg-[#eaf7e6] px-3 py-0.5 text-[14px] font-semibold text-[#2F6B2F]">
                              {d.cost_level}
                            </span>
                          </td>
                          <td className="p-4 font-semibold">৳{d.hotel_cost_per_room_night}</td>
                          <td className="p-4">৳{d.food_cost_per_person_day}</td>
                          <td className="p-4">{d.min_hours_needed}h</td>
                          <td className="p-4 text-right">
                            <button
                              type="button"
                              onClick={() => setEditingDest({ ...d })}
                              className="inline-flex items-center gap-1.5 rounded-full border border-[#D5E6CF] bg-white px-3.5 py-1.5 text-[14px] font-semibold text-[#1F2A1F] hover:bg-[#eaf7e6]"
                            >
                              <Edit3 className="h-3.5 w-3.5 text-[#2F6B2F]" />
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'import' && (
              <div className="space-y-4 rounded-[26px] border border-[#D5E6CF] bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-[#2F6B2F]" />
                  <h2 className="text-[24px] font-semibold text-[#1F2A1F]">
                    Batch JSON Catalog Import
                  </h2>
                </div>
                <p className="text-[16px] text-[#557945]">
                  Paste a JSON object or array of destination records to upsert straight into Neon
                  PostgreSQL.
                </p>
                <form onSubmit={handleBulkImport} className="space-y-4">
                  <textarea
                    rows={7}
                    value={jsonText}
                    onChange={(e) => setJsonText(e.target.value)}
                    placeholder='[{"name":"Saint Martin","division":"Chattogram","district":"Coxs Bazar","hotel_cost_per_room_night":3500,"food_cost_per_person_day":600}]'
                    className="w-full rounded-2xl border border-[#D5E6CF] bg-[#F6FAF3] p-4 font-sans text-[14px] text-[#1F2A1F] focus:border-[#2F6B2F] focus:bg-white focus:outline-none"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="text-[14px] font-semibold text-[#2F6B2F]">{importResult}</span>
                    <button
                      type="submit"
                      disabled={importing || !jsonText.trim()}
                      className="inline-flex h-11 items-center gap-2 rounded-full bg-[#2F6B2F] px-6 text-[14px] font-bold text-white hover:bg-[#145219] disabled:opacity-60"
                    >
                      {importing && <Loader2 className="h-4 w-4 animate-spin" />}
                      Upload &amp; Upsert Records
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stitch #24 Slide-Over Edit Drawer */}
      {editingDest && (
        <div className="fixed inset-0 z-50 flex justify-end bg-[#1F2A1F]/40 backdrop-blur-sm">
          <div className="flex h-full w-full max-w-md flex-col justify-between overflow-y-auto bg-white p-7 shadow-2xl">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-[#E5F0E0] pb-4">
                <div>
                  <span className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[#2F6B2F]">
                    Edit District Parameters
                  </span>
                  <h2 className="text-[24px] font-semibold text-[#1F2A1F]">{editingDest.name}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingDest(null)}
                  aria-label="Close drawer"
                  className="rounded-full p-2 text-[#557945] hover:bg-[#F6FAF3]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form id="edit-dest-form" onSubmit={handleSaveDestination} className="space-y-4">
                <div>
                  <label className="mb-1 block text-[14px] font-semibold text-[#557945]">
                    Hotel Cost / Room / Night (BDT)
                  </label>
                  <input
                    type="number"
                    required
                    value={editingDest.hotel_cost_per_room_night}
                    onChange={(e) =>
                      setEditingDest({ ...editingDest, hotel_cost_per_room_night: e.target.value })
                    }
                    className="h-11 w-full rounded-2xl border border-[#D5E6CF] bg-[#F6FAF3] px-4 text-[14px] font-semibold text-[#1F2A1F]"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[14px] font-semibold text-[#557945]">
                    Food Cost / Person / Day (BDT)
                  </label>
                  <input
                    type="number"
                    required
                    value={editingDest.food_cost_per_person_day}
                    onChange={(e) =>
                      setEditingDest({ ...editingDest, food_cost_per_person_day: e.target.value })
                    }
                    className="h-11 w-full rounded-2xl border border-[#D5E6CF] bg-[#F6FAF3] px-4 text-[14px] font-semibold text-[#1F2A1F]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-[14px] font-semibold text-[#557945]">
                      Local Fees / Person
                    </label>
                    <input
                      type="number"
                      required
                      value={editingDest.local_fees_per_person}
                      onChange={(e) =>
                        setEditingDest({ ...editingDest, local_fees_per_person: e.target.value })
                      }
                      className="h-11 w-full rounded-2xl border border-[#D5E6CF] bg-[#F6FAF3] px-4 text-[14px] font-semibold text-[#1F2A1F]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[14px] font-semibold text-[#557945]">
                      Min Hours Needed
                    </label>
                    <input
                      type="number"
                      required
                      value={editingDest.min_hours_needed}
                      onChange={(e) =>
                        setEditingDest({ ...editingDest, min_hours_needed: e.target.value })
                      }
                      className="h-11 w-full rounded-2xl border border-[#D5E6CF] bg-[#F6FAF3] px-4 text-[14px] font-semibold text-[#1F2A1F]"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-[14px] font-semibold text-[#557945]">
                    Cost Level
                  </label>
                  <select
                    value={editingDest.cost_level}
                    onChange={(e) =>
                      setEditingDest({ ...editingDest, cost_level: e.target.value })
                    }
                    className="h-11 w-full rounded-2xl border border-[#D5E6CF] bg-[#F6FAF3] px-4 text-[14px] font-semibold text-[#1F2A1F]"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-[14px] font-semibold text-[#557945]">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    value={editingDest.description || ''}
                    onChange={(e) =>
                      setEditingDest({ ...editingDest, description: e.target.value })
                    }
                    className="w-full rounded-2xl border border-[#D5E6CF] bg-[#F6FAF3] p-3.5 text-[14px] leading-relaxed text-[#1F2A1F]"
                  />
                </div>

                {editNotice && (
                  <p className="flex items-center gap-1.5 text-[14px] font-semibold text-[#2F6B2F]">
                    <CheckCircle2 className="h-4 w-4" />
                    {editNotice}
                  </p>
                )}
              </form>
            </div>

            <div className="flex items-center gap-3 border-t border-[#E5F0E0] pt-5">
              <button
                type="button"
                onClick={() => setEditingDest(null)}
                className="h-11 flex-1 rounded-full border border-[#D5E6CF] text-[14px] font-semibold text-[#1F2A1F]"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="edit-dest-form"
                disabled={savingEdit}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[#2F6B2F] text-[14px] font-semibold text-white hover:bg-[#145219] disabled:opacity-60"
              >
                {savingEdit && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Update Destination
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
