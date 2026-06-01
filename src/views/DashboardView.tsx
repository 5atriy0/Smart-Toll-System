'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Car, TrendingUp, Clock, Gauge, ArrowUp, ArrowDown, Activity, AlertTriangle, Wrench, LayoutDashboard } from 'lucide-react'
import { useAnalytics } from '@/hooks/useAnalytics'
import { useTransactions } from '@/hooks/useTransactions'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type StatCardProps = {
  title: string
  value: string
  icon: React.ReactNode
  trend?: { direction: 'up' | 'down'; label: string }
  loading?: boolean
}

function StatCard({ title, value, icon, trend, loading }: StatCardProps) {
  if (loading) return <SkeletonCard />;

  return (
    <div
      className="relative rounded-xl bg-card border border-border p-5 transition-all duration-200 hover:translate-y-[-2px] hover:shadow-md group cursor-default"
      style={{ borderLeft: '3px solid hsl(var(--accent))' }}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</span>
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/15 transition-colors">
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-foreground tracking-tight mb-1">{value}</div>
      {trend && (
        <div className="flex items-center gap-1 text-xs">
          {trend.direction === 'up' ? (
            <ArrowUp className="w-3 h-3" style={{ color: 'hsl(var(--accent))' }} />
          ) : (
            <ArrowDown className="w-3 h-3 text-danger" />
          )}
          <span className={trend.direction === 'up' ? 'text-accent' : 'text-danger'}>{trend.label}</span>
        </div>
      )}
    </div>
  );
}

export function DashboardView() {
  const { logs, loading: txLoading } = useTransactions();
  const { todayMetrics, trendData, recentAlerts, esp32Status } = useAnalytics();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const loading = !mounted || txLoading;

  const metricCards = [
    {
      title: 'Total Pengguna',
      value: todayMetrics.activeUsers.toString(),
      icon: <Users className="w-4 h-4" />,
      trend: { direction: 'up' as const, label: todayMetrics.usersTrend },
      loading,
    },
    {
      title: 'Pendapatan',
      value: `Rp ${(todayMetrics.revenue || 0).toLocaleString()}`,
      icon: <TrendingUp className="w-4 h-4" />,
      trend: { direction: 'up' as const, label: todayMetrics.revenueTrend },
      loading,
    },
    {
      title: 'Kendaraan',
      value: todayMetrics.totalVehicles.toString(),
      icon: <Car className="w-4 h-4" />,
      trend: { direction: 'up' as const, label: 'Hari ini' },
      loading,
    },
    {
      title: 'Kecepatan Rata-rata',
      value: `${todayMetrics.avgSpeed.toFixed(1)} km/h`,
      icon: <Gauge className="w-4 h-4" />,
      loading,
    },
    {
      title: 'Waktu Tempuh Rata-rata',
      value: `${todayMetrics.avgDuration.toFixed(1)} mnt`,
      icon: <Clock className="w-4 h-4" />,
      loading,
    },
  ];

  const recentTx = [...logs].slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {metricCards.map((m, i) => (
          <StatCard key={i} {...m} />
        ))}
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
            <EmptyState title="Belum ada transaksi" description="Belum ada aktivitas transaksi hari ini." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground bg-muted/50 sticky top-0">
                  <tr>
                    <th className="px-5 py-3.5 font-medium">Waktu</th>
                    <th className="px-5 py-3.5 font-medium">UID</th>
                    <th className="px-5 py-3.5 font-medium">Rute</th>
                    <th className="px-5 py-3.5 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {recentTx.map((log) => (
                    <tr key={log.id} className="hover:bg-primary/5 transition-colors">
                      <td className="px-5 py-3.5 whitespace-nowrap text-muted-foreground">{log.timeIn}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap font-mono text-foreground">{log.rfid}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-muted-foreground">{log.loc}</td>
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

      {/* Alerts & Gate Control */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Alerts */}
        <Card className="md:col-span-2 border-border shadow-sm">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-accent" />
              Notifikasi & Peringatan
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2">
            {recentAlerts.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-4">Tidak ada notifikasi</div>
            ) : (
              recentAlerts.map((a) => (
                <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    a.type === 'warning' ? 'bg-accent' : a.type === 'error' ? 'bg-danger' : 'bg-success'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{a.message}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* ESP32 Status Card */}
        <Card className="border-border shadow-sm">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Wrench className="w-4 h-4 text-accent" />
              Status Gateway
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 flex flex-col items-center gap-4">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 ${
              esp32Status === 'Online' ? 'border-success text-success' : 'border-danger text-danger'
            }`}>
              <Activity className="w-7 h-7" />
            </div>
            <span className={`text-lg font-bold ${
              esp32Status === 'Online' ? 'text-success' : 'text-danger'
            }`}>
              {esp32Status === 'Online' ? 'ONLINE' : 'OFFLINE'}
            </span>
            <p className="text-xs text-muted-foreground">ESP32 Gateway</p>
            <Link
              href="/settings"
              className="w-full text-center py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ backgroundColor: 'hsl(var(--primary))', color: 'white' }}
            >
              Buka Pengaturan
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Shortcuts */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-4">Pintasan Cepat</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { title: 'Pengguna', desc: 'Kelola akun & RFID', href: '/users', icon: <Users className="w-5 h-5" /> },
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
