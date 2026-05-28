'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Activity, Car, TrendingUp } from 'lucide-react'
import { RecentAlerts } from '@/components/dashboard/RecentAlerts'
import { ManualGateOverride } from '@/components/dashboard/ManualGateOverride'
import { ShortcutCard } from '@/components/dashboard/ShortcutCard'
import { useAnalytics } from '@/hooks/useAnalytics'
import { useTransactions } from '@/hooks/useTransactions'
import styles from './DashboardView.module.scss'

export function DashboardView() {
  const { logs, loading } = useTransactions();
  const { todayMetrics, trendData, recentAlerts } = useAnalytics();

  return (
    <div className={`space-y-6 ${styles.container}`}>

      {/* HEADER */}
      <div className="flex flex-col gap-2 mb-8">
        {/* <h1 className="text-3xl font-bold">Selamat Datang, Admin</h1> */}
        <h1 className="text-xl font-semibold">
          Berikut adalah status terkini dari Sistem Tol Pintar Anda.
        </h1>
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">

        <Card className="bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-md border-0 transition-all hover:shadow-lg hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Pengguna</CardTitle>
            <Users className="h-4 w-4 text-blue-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayMetrics.activeUsers}</div>
            <p className="text-xs text-blue-200 mt-1">Hari ini</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-md border-0 transition-all hover:shadow-lg hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Pendapatan</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(todayMetrics.revenue)}
            </div>
            <p className="text-xs text-emerald-200 mt-1">Hari ini</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-500 to-violet-700 text-white shadow-md border-0 transition-all hover:shadow-lg hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Kendaraan</CardTitle>
            <Car className="h-4 w-4 text-violet-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayMetrics.totalVehicles}</div>
            <p className="text-xs text-violet-200 mt-1">Hari ini</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-md border-0 transition-all hover:shadow-lg hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Rata-rata Kecepatan</CardTitle>
            <Activity className="h-4 w-4 text-amber-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {todayMetrics.avgSpeed.toFixed(1)} km/h
            </div>
            <p className="text-xs text-amber-200 mt-1">Keseluruhan</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-500 to-rose-700 text-white shadow-md border-0 transition-all hover:shadow-lg hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Rata-rata Waktu</CardTitle>
            <Activity className="h-4 w-4 text-rose-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {todayMetrics.avgDuration.toFixed(1)} menit
            </div>
            <p className="text-xs text-rose-200 mt-1">Durasi di tol</p>
          </CardContent>
        </Card>

      </div>

      <Card className="shadow-sm border-slate-200/60 dark:border-slate-800">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-500" />
            Transaksi Terbaru
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground animate-pulse">Memuat data transaksi...</div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">Belum ada transaksi</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-900/50 uppercase">
                  <tr>
                    <th className="px-6 py-4 font-medium">Waktu</th>
                    <th className="px-6 py-4 font-medium">UID RFID</th>
                    <th className="px-6 py-4 font-medium">Rute</th>
                    <th className="px-6 py-4 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {logs.slice(0, 5).map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                        {log.time}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900 dark:text-white">
                        {log.rfid}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                        {log.loc}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          log.status === 'SELESAI' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20' :
                          log.status === 'DI PERJALANAN' ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20' :
                          'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:border-slate-500/20'
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

      {/* CONTENT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <RecentAlerts />
        </div>
        <ManualGateOverride />
      </div>

      {/* SHORTCUT */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Pintasan Cepat</h2>
        <div className="grid grid-cols-4 gap-4">
          <ShortcutCard title="Pengguna" desc="Kelola user" href="/users" icon={<Users />} />
          <ShortcutCard title="Transaksi" desc="Data transaksi" href="/transactions" icon={<Activity />} />
          <ShortcutCard title="Analitik" desc="Lihat grafik" href="/analytics" icon={<Activity />} />
          <ShortcutCard title="Pengaturan" desc="Konfigurasi" href="/settings" icon={<Activity />} />
        </div>
      </div>

    </div>
  );
}