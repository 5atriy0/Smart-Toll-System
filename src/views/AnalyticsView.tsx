'use client';

import { useState, useEffect, useMemo, useCallback } from "react";
import { getWeeklyAnalytics, getMonthlyAnalytics, getActiveGates } from "@/services/analyticsService";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import type { AnalyticsWeekly, AnalyticsMonthly } from "@/lib/types/supabase";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, LineChart, Line, Legend, PieChart, Pie, Cell,
} from 'recharts';
import {
  BarChart3, TrendingUp, DollarSign, Route, CreditCard, Truck,
  Calendar, Layers, FileBarChart, Building2, Wallet,
} from 'lucide-react';

type PeriodMode = "weekly" | "monthly" | "yearly";

const PIE_COLORS = ["hsl(154, 61%, 43%)", "hsl(0, 84%, 60%)"];

const toDate = (period: string) => new Date(period + "T00:00:00");

const formatPeriod = (period: string, mode: PeriodMode) => {
  if (mode === "yearly") return period;
  const d = toDate(period);
  if (mode === "weekly") {
    return `${d.getDate()} ${d.toLocaleString("id-ID", { month: "short" })}`;
  }
  return d.toLocaleString("id-ID", { month: "long", year: "numeric" });
};

const formatCurrency = (val: number) => `Rp ${val.toLocaleString("id-ID")}`;

function StatCard({ title, value, icon, loading }: { title: string; value: string; icon: React.ReactNode; loading?: boolean }) {
  if (loading) return <SkeletonCard />;
  return (
    <div className="relative rounded-xl bg-card border border-border p-5 transition-all duration-200 hover:translate-y-[-2px] hover:shadow-md group cursor-default"
      style={{ borderLeft: '3px solid hsl(var(--accent))' }}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</span>
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/15 transition-colors">
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-foreground tracking-tight mb-1">{value}</div>
    </div>
  );
}

function ChartEmpty({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
      {message}
    </div>
  );
}

function ChartCard({ title, children, loading, isEmpty }: { title: string; children: React.ReactNode; loading?: boolean; isEmpty?: boolean }) {
  return (
    <div className="h-72 flex flex-col bg-background/50 p-4 rounded-xl border border-border/50">
      <h4 className="text-sm text-foreground mb-4 font-semibold">{title}</h4>
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        </div>
      ) : isEmpty ? (
        <ChartEmpty message="Belum ada data" />
      ) : (
        <div className="flex-1">{children}</div>
      )}
    </div>
  );
}

function CompletionRateChart({ data: raw }: { data: AnalyticsWeekly[] }) {
  const total = raw.reduce((s, d) => s + d.total_transactions, 0);
  const completed = raw.reduce((s, d) => s + d.completed_transactions, 0);
  const cancelled = total - completed;
  if (total === 0) return <ChartEmpty message="Belum ada data transaksi" />;
  const rate = ((completed / total) * 100).toFixed(1);
  const pieData = [
    { name: "Selesai", value: completed },
    { name: "Dibatalkan", value: Math.max(cancelled, 0) },
  ];
  return (
    <div className="flex items-center gap-4 h-full">
      <div className="w-36 h-36 flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={pieData} cx="50%" cy="50%" innerRadius={32} outerRadius={56} paddingAngle={3} dataKey="value">
              {pieData.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i]} stroke="transparent" />
              ))}
            </Pie>
            <RechartsTooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '0.5rem' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-col gap-2 min-w-0">
        <div className="text-3xl font-bold text-foreground">{rate}%</div>
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[0] }} />
            <span>Selesai: <strong>{completed.toLocaleString("id-ID")}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[1] }} />
            <span>Batal: <strong>{Math.max(cancelled, 0).toLocaleString("id-ID")}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}

const TABS: { mode: PeriodMode; label: string; icon: typeof Calendar }[] = [
  { mode: "weekly", label: "Mingguan", icon: Calendar },
  { mode: "monthly", label: "Bulanan", icon: Layers },
  { mode: "yearly", label: "Tahunan", icon: BarChart3 },
];

export function AnalyticsView() {
  const [periodMode, setPeriodMode] = useState<PeriodMode>("weekly");
  const [weeklyData, setWeeklyData] = useState<AnalyticsWeekly[]>([]);
  const [monthlyData, setMonthlyData] = useState<AnalyticsMonthly[]>([]);
  const [activeGates, setActiveGates] = useState(0);
  const [gatesLoading, setGatesLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  const sourceData = periodMode === "weekly" ? weeklyData : monthlyData;

  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      setLoading(true);
      const [weekly, monthly] = await Promise.all([
        getWeeklyAnalytics(),
        getMonthlyAnalytics(),
      ]);
      if (!cancelled) {
        setWeeklyData(weekly);
        setMonthlyData(monthly);
        setLoading(false);
      }
    };
    fetch();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const fetchGates = async () => {
      setGatesLoading(true);
      const now = new Date();
      let dateFrom: string | undefined;
      if (periodMode === "weekly") {
        const d = new Date(now); d.setDate(now.getDate() - 7); dateFrom = d.toISOString();
      } else if (periodMode === "monthly") {
        const d = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()); dateFrom = d.toISOString();
      } else {
        const d = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()); dateFrom = d.toISOString();
      }
      const count = await getActiveGates(dateFrom);
      if (!cancelled) {
        setActiveGates(count);
        setGatesLoading(false);
      }
    };
    fetchGates();
    return () => { cancelled = true; };
  }, [periodMode]);

  const stats = useMemo(() => {
    if (sourceData.length === 0) return null;
    const totalTx = sourceData.reduce((s, d) => s + d.total_transactions, 0);
    const totalRev = sourceData.reduce((s, d) => s + Number(d.total_revenue), 0);
    const avgFeeVal = sourceData.reduce((s, d) => s + Number(d.avg_fee), 0) / sourceData.length;
    const avgDist = sourceData.reduce((s, d) => s + Number(d.avg_distance_km), 0) / sourceData.length;
    const totalCards = sourceData.reduce((s, d) => s + d.unique_cards, 0);
    const totalVehicles = sourceData.reduce((s, d) => s + d.unique_vehicles, 0);
    const revPerTx = totalTx > 0 ? totalRev / totalTx : 0;
    return { totalTx, totalRev, avgFeeVal, avgDist, totalCards, totalVehicles, revPerTx };
  }, [sourceData]);

  const chartData = useMemo(() => {
    if (periodMode === "yearly") {
      const yearMap = new Map<string, {
        total_transactions: number; total_revenue: number;
        avg_fee: number; avg_distance_km: number;
        unique_cards: number; unique_vehicles: number; count: number;
      }>();
      for (const d of monthlyData) {
        const year = d.month.substring(0, 4);
        if (!yearMap.has(year)) yearMap.set(year, { total_transactions: 0, total_revenue: 0, avg_fee: 0, avg_distance_km: 0, unique_cards: 0, unique_vehicles: 0, count: 0 });
        const a = yearMap.get(year)!;
        a.total_transactions += d.total_transactions;
        a.total_revenue += Number(d.total_revenue);
        a.avg_fee += Number(d.avg_fee);
        a.avg_distance_km += Number(d.avg_distance_km);
        a.unique_cards += d.unique_cards;
        a.unique_vehicles += d.unique_vehicles;
        a.count += 1;
      }
      return Array.from(yearMap.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([year, a]) => ({
        period: year,
        total_transactions: a.total_transactions,
        total_revenue: a.total_revenue,
        avg_fee: a.avg_fee / a.count,
        avg_distance_km: a.avg_distance_km / a.count,
        avg_duration_min: 0,
        unique_cards: a.unique_cards,
        unique_vehicles: a.unique_vehicles,
        revenue_per_tx: a.total_transactions > 0 ? a.total_revenue / a.total_transactions : 0,
      }));
    }
    return [...sourceData].sort((a, b) => {
      const ka = periodMode === "weekly" ? (a as AnalyticsWeekly).week_start : (a as AnalyticsMonthly).month;
      const kb = periodMode === "weekly" ? (b as AnalyticsWeekly).week_start : (b as AnalyticsMonthly).month;
      return new Date(ka).getTime() - new Date(kb).getTime();
    }).map((d) => {
      const period = periodMode === "weekly" ? (d as AnalyticsWeekly).week_start : (d as AnalyticsMonthly).month;
      const tx = d.total_transactions;
      const rev = Number(d.total_revenue);
      return {
        period: formatPeriod(period, periodMode),
        total_transactions: tx,
        total_revenue: rev,
        avg_fee: Number(d.avg_fee),
        avg_distance_km: Number(d.avg_distance_km),
        avg_duration_min: periodMode === "weekly" ? Number((d as AnalyticsWeekly).avg_duration_min ?? 0) : 0,
        unique_cards: d.unique_cards,
        unique_vehicles: d.unique_vehicles,
        revenue_per_tx: tx > 0 ? rev / tx : 0,
      };
    });
  }, [sourceData, periodMode, monthlyData]);

  const isEmpty = !loading && sourceData.length === 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
            <FileBarChart className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Analitik Data</h1>
            <p className="text-sm text-muted-foreground">Ringkasan Analitik Big Data</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 bg-muted/30 rounded-lg p-1 border border-border w-fit">
        {TABS.map(({ mode, label, icon: Icon }) => (
          <button
            key={mode}
            onClick={() => setPeriodMode(mode)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all inline-flex items-center gap-1.5 ${
              periodMode === mode
                ? "bg-card shadow-sm text-foreground border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : isEmpty ? (
        <EmptyState
          icon={<BarChart3 className="w-8 h-8 text-accent" />}
          title="Belum ada data analitik"
          description="Jalankan pipeline big data untuk melihat hasil analitik."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Transaksi"
              value={stats?.totalTx.toLocaleString("id-ID") ?? "0"}
              icon={<BarChart3 className="w-4 h-4" />}
            />
            <StatCard
              title="Total Pendapatan"
              value={stats ? formatCurrency(stats.totalRev) : "Rp 0"}
              icon={<DollarSign className="w-4 h-4" />}
            />
            <StatCard
              title="Rata-rata Tarif"
              value={stats ? formatCurrency(Math.round(stats.avgFeeVal)) : "Rp 0"}
              icon={<TrendingUp className="w-4 h-4" />}
            />
            <StatCard
              title="Kartu Unik"
              value={stats?.totalCards.toLocaleString("id-ID") ?? "0"}
              icon={<CreditCard className="w-4 h-4" />}
            />
            <StatCard
              title="Gate Aktif"
              value={gatesLoading ? "..." : `${activeGates} gate`}
              icon={<Building2 className="w-4 h-4" />}
            />
            <StatCard
              title="Rata-rata Jarak"
              value={stats ? `${stats.avgDist.toFixed(2)} km` : "0 km"}
              icon={<Route className="w-4 h-4" />}
            />
            <StatCard
              title="Kendaraan Unik"
              value={stats?.totalVehicles.toLocaleString("id-ID") ?? "0"}
              icon={<Truck className="w-4 h-4" />}
            />
            <StatCard
              title="Pendapatan per Transaksi"
              value={stats ? formatCurrency(Math.round(stats.revPerTx)) : "Rp 0"}
              icon={<Wallet className="w-4 h-4" />}
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Tren Pendapatan" loading={loading} isEmpty={chartData.length === 0}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a303c" vertical={false} />
                  <XAxis dataKey="period" stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `Rp${(v / 1000).toFixed(0)}k`} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '0.5rem' }} formatter={(v: number) => formatCurrency(v)} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Line type="monotone" dataKey="total_revenue" name="Pendapatan" stroke="hsl(35, 100%, 50%)" strokeWidth={3} dot={{ r: 4, fill: '#111827', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Volume Transaksi" loading={loading} isEmpty={chartData.length === 0}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a303c" vertical={false} />
                  <XAxis dataKey="period" stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
                  <RechartsTooltip cursor={{ fill: '#1f2937' }} contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '0.5rem' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="total_transactions" name="Transaksi" fill="hsl(212, 100%, 48%)" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Rata-rata Tarif" loading={loading} isEmpty={chartData.length === 0}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a303c" vertical={false} />
                  <XAxis dataKey="period" stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `Rp${v}`} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '0.5rem' }} formatter={(v: number) => formatCurrency(v)} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Line type="monotone" dataKey="avg_fee" name="Rata-rata Tarif" stroke="hsl(154, 61%, 43%)" strokeWidth={3} dot={{ r: 4, fill: '#111827', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Pendapatan per Transaksi" loading={loading} isEmpty={chartData.length === 0}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a303c" vertical={false} />
                  <XAxis dataKey="period" stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `Rp${v}`} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '0.5rem' }} formatter={(v: number) => formatCurrency(v)} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Line type="monotone" dataKey="revenue_per_tx" name="Rev/Tx" stroke="hsl(270, 60%, 60%)" strokeWidth={3} dot={{ r: 4, fill: '#111827', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Kartu vs Kendaraan" loading={loading} isEmpty={chartData.length === 0}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a303c" vertical={false} />
                  <XAxis dataKey="period" stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
                  <RechartsTooltip cursor={{ fill: '#1f2937' }} contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '0.5rem' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="unique_cards" name="Kartu" fill="hsl(212, 100%, 48%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="unique_vehicles" name="Kendaraan" fill="hsl(154, 61%, 43%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Rata-rata Jarak" loading={loading} isEmpty={chartData.length === 0}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a303c" vertical={false} />
                  <XAxis dataKey="period" stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v} km`} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '0.5rem' }} formatter={(v: number) => `${v.toFixed(2)} km`} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Line type="monotone" dataKey="avg_distance_km" name="Jarak" stroke="hsl(270, 60%, 60%)" strokeWidth={3} dot={{ r: 4, fill: '#111827', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Weekly-only charts */}
            {periodMode === "weekly" ? (
              <>
                <ChartCard title="Tingkat Penyelesaian" loading={loading} isEmpty={weeklyData.length === 0}>
                  <CompletionRateChart data={weeklyData} />
                </ChartCard>
                <ChartCard title="Rata-rata Durasi" loading={loading} isEmpty={chartData.length === 0}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a303c" vertical={false} />
                      <XAxis dataKey="period" stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v} mnt`} />
                      <RechartsTooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '0.5rem' }} formatter={(v: number) => `${v.toFixed(1)} menit`} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Line type="monotone" dataKey="avg_duration_min" name="Durasi" stroke="hsl(0, 84%, 60%)" strokeWidth={3} dot={{ r: 4, fill: '#111827', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartCard>
              </>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
