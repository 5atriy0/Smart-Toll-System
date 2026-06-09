'use client';

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Car, TrendingUp, Clock, Gauge, Activity, Wrench } from 'lucide-react'
import { useAnalytics } from '@/hooks/useAnalytics'
import { getTransactions } from '@/services/transactionService'
import { EmptyState } from '@/components/ui/EmptyState'
import Link from 'next/link'
import { LineChart, Line, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

const DATE_OPTIONS = ['Hari Ini', '7 Hari Terakhir', 'Bulan Ini', 'Semua Waktu']

const CARD_COLORS = [
  { bg: 'rgba(180,83,9,0.1)', text: '#B45309' },
  { bg: 'rgba(37,99,235,0.1)', text: '#2563EB' },
  { bg: 'rgba(5,146,105,0.1)', text: '#059669' },
  { bg: 'rgba(124,58,237,0.1)', text: '#7C3AED' },
  { bg: 'rgba(219,39,119,0.1)', text: '#DB2777' },
]

function relativeTime(date: Date | null): string {
  if (!date) return '-'
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Baru saja'
  if (mins < 60) return `${mins} mnt lalu`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} jam lalu`
  const days = Math.floor(hours / 24)
  return `${days} hari lalu`
}

const parseUTC = (ts: string | null) => {
  if (!ts) return null;
  return new Date(ts.endsWith("Z") || ts.includes("+") ? ts : ts + "Z");
};

const computeDateFrom = (range: string): string | undefined => {
  const now = new Date();
  if (range === "Hari Ini") {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return d.toISOString();
  }
  if (range === "7 Hari Terakhir") {
    const d = new Date();
    d.setDate(now.getDate() - 7);
    return d.toISOString();
  }
  if (range === "Bulan Ini") {
    const d = new Date(now.getFullYear(), now.getMonth(), 1);
    return d.toISOString();
  }
  return undefined;
};

function CompactStat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: typeof CARD_COLORS[number] }) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-card border border-border p-3" style={{ borderLeft: `3px solid ${color.text}` }}>
      <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: color.bg, color: color.text }}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  )
}

export function DashboardView() {
  const [dateRange, setDateRange] = useState('Hari Ini');
  const [txLogs, setTxLogs] = useState<any[]>([]);
  const [txLoading, setTxLoading] = useState(true);
  const { todayMetrics, dashboardData, loading: analyticsLoading } = useAnalytics(dateRange);

  const loading = txLoading || analyticsLoading;

  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      setTxLoading(true);
      const result = await getTransactions({ dateFrom: computeDateFrom(dateRange), limit: 5 });
      if (!cancelled && result) {
        setTxLogs(result.data.map((item) => {
          const statusLabel = item.status === "COMPLETED" ? "SELESAI" : item.status === "IN_PROGRESS" ? "DI PERJALANAN" : "BELUM MASUK";
          const tapInDate = parseUTC(item.tap_in_time);
          const tapOutDate = parseUTC(item.tap_out_time);
          return {
            id: item.id,
            timeIn: tapInDate?.toLocaleString() ?? "-",
            timeOut: tapOutDate?.toLocaleString() ?? "-",
            relativeTime: relativeTime(tapInDate),
            relativeOut: relativeTime(tapOutDate),
            loc: `${item.gate_in_name || "-"} → ${item.gate_out_name || "-"}`,
            uid: item.uid,
            plate: item.plate_number,
            fee: item.fee ?? 0,
            status: statusLabel,
          };
        }));
      }
      if (!cancelled) setTxLoading(false);
    };
    fetch();
    return () => { cancelled = true; };
  }, [dateRange]);

  const recentTx = [...txLogs].slice(0, 5);
  const miniChartData = dashboardData?.hourly_volume ?? [];
  const revenueTrendData = dashboardData?.revenue_trend ?? [];

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Ringkasan data dan aktivitas sistem</p>
        </div>
        <div className="flex gap-1.5 bg-muted/30 rounded-lg p-1 border border-border">
          {DATE_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => setDateRange(opt)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                dateRange === opt
                  ? 'bg-card shadow-sm text-foreground border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Compact Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <CompactStat
          icon={<Users className="w-4 h-4" />}
          label={todayMetrics.userLabel}
          value={todayMetrics.totalUsers.toString()}
          color={CARD_COLORS[0]}
        />
        <CompactStat
          icon={<TrendingUp className="w-4 h-4" />}
          label={todayMetrics.revenueLabel}
          value={`Rp ${(todayMetrics.revenue || 0).toLocaleString()}`}
          color={CARD_COLORS[1]}
        />
        <CompactStat
          icon={<Car className="w-4 h-4" />}
          label={todayMetrics.vehicleLabel}
          value={todayMetrics.totalVehicles.toString()}
          color={CARD_COLORS[2]}
        />
        <CompactStat
          icon={<Gauge className="w-4 h-4" />}
          label={todayMetrics.speedLabel}
          value={`${todayMetrics.avgSpeed.toFixed(1)} km/h`}
          color={CARD_COLORS[3]}
        />
        <CompactStat
          icon={<Clock className="w-4 h-4" />}
          label={todayMetrics.durationLabel}
          value={`${todayMetrics.avgDuration.toFixed(1)} mnt`}
          color={CARD_COLORS[4]}
        />
      </div>

      {/* Mini Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border shadow-sm">
          <CardHeader className="border-b border-border pb-3">
            <CardTitle className="text-sm font-semibold">Volume Per Jam</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={miniChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }}
                  />
                  <Bar dataKey="volume" fill="#B45309" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader className="border-b border-border pb-3">
            <CardTitle className="text-sm font-semibold">Tren Pendapatan</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="shadow-sm border-border">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Activity className="w-4 h-4" style={{ color: 'hsl(var(--accent))' }} />
            Transaksi Terbaru
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1,2,3,4,5].map(i => <div key={i} className="h-10 rounded bg-muted shimmer" />)}
            </div>
          ) : recentTx.length === 0 ? (
            <EmptyState title="Belum ada transaksi" description="Belum ada aktivitas transaksi untuk periode ini." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground bg-muted/50 sticky top-0">
                  <tr>
                    <th className="px-5 py-3.5 font-medium">Waktu</th>
                    <th className="px-5 py-3.5 font-medium">UID</th>
                    <th className="px-5 py-3.5 font-medium">Plat</th>
                    <th className="px-5 py-3.5 font-medium">Rute</th>
                    <th className="px-5 py-3.5 font-medium text-right">Tarif</th>
                    <th className="px-5 py-3.5 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {recentTx.map((log) => (
                    <tr key={log.id} className="hover:bg-primary/5 transition-colors">
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="text-foreground font-medium">{log.relativeTime}</span>
                        <span className="text-muted-foreground ml-1.5 text-xs">{log.timeIn}</span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap font-mono text-xs text-foreground">{log.uid}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-muted-foreground">{log.plate || '-'}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-muted-foreground text-xs">{log.loc}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-right font-medium text-foreground">
                        Rp {log.fee.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-right">
                        <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-medium border ${
                          log.status === 'SELESAI'
                            ? 'border-success/30 text-success bg-success/5'
                            : log.status === 'DI PERJALANAN'
                              ? 'border-accent/30 text-accent bg-accent/5'
                              : 'border-border text-muted-foreground bg-muted/30'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Shortcuts */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-4">Pintasan Cepat</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { title: 'Pengguna', desc: 'Kelola akun & UID', href: '/users', icon: <Users className="w-5 h-5" /> },
            { title: 'Transaksi', desc: 'Riwayat pembayaran', href: '/transactions', icon: <Activity className="w-5 h-5" /> },
            { title: 'Analitik', desc: 'Grafik & laporan', href: '/analytics', icon: <TrendingUp className="w-5 h-5" /> },
            { title: 'Pengaturan', desc: 'Konfigurasi sistem', href: '/settings', icon: <Wrench className="w-5 h-5" /> },
          ].map((s) => (
            <Link key={s.href} href={s.href}
              className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:border-accent/30 transition-all duration-200 hover:translate-y-[-1px] group"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-accent/10 group-hover:text-accent transition-colors">
                {s.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{s.title}</p>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
