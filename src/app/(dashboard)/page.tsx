'use client';

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Activity, Car, AlertTriangle, ArrowRight, TrendingUp } from 'lucide-react'
import { GateStatus } from '@/components/dashboard/GateStatus'
import { RecentAlerts } from '@/components/dashboard/RecentAlerts'
import { ManualGateOverride } from '@/components/dashboard/ManualGateOverride'
import { useAnalytics } from '@/hooks/useAnalytics'

export default function DashboardPage() {
  const { todayMetrics } = useAnalytics();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Selamat Datang, Admin</h1>
        <p className="text-muted-foreground text-sm">Berikut adalah status terkini dari Sistem Tol Pintar Anda.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-success/20 bg-success/5 hover:bg-success/10 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Pengguna Aktif</CardTitle>
            <Users className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayMetrics.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-success flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              {todayMetrics.usersTrend} dari kemarin
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pendapatan Hari Ini</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {todayMetrics.revenue.toLocaleString()}</div>
            <p className="text-xs text-primary flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              {todayMetrics.revenueTrend} vs minggu lalu
            </p>
          </CardContent>
        </Card>

        <Card className="border-warning/20 bg-warning/5 hover:bg-warning/10 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Kendaraan Lewat</CardTitle>
            <Car className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayMetrics.totalVehicles.toLocaleString()}</div>
            <p className="text-xs text-warning flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              {todayMetrics.vehiclesTrend} vs kemarin
            </p>
          </CardContent>
        </Card>
        
        <GateStatus />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="md:col-span-2 space-y-6">
          <RecentAlerts />
        </div>
        <div className="space-y-6">
          <ManualGateOverride />
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Pintasan Cepat</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ShortcutCard title="Kelola Pengguna" desc="Tambah/blokir pengguna" href="/users" icon={<Users />} />
          <ShortcutCard title="Transaksi" desc="Ekspor CSV/PDF" href="/transactions" icon={<Activity />} />
          <ShortcutCard title="Lihat Analitik" desc="Cek tren mingguan" href="/analytics" icon={<Activity />} />
          <ShortcutCard title="Pengaturan Sistem" desc="Konfigurasi API & Gerbang" href="/settings" icon={<Activity />} />
        </div>
      </div>
    </div>
  )
}

function ShortcutCard({ title, desc, href, icon }: { title: string, desc: string, href: string, icon: React.ReactNode }) {
  return (
    <Link href={href}>
      <Card className="h-full hover:bg-white/5 transition-colors cursor-pointer group border-border/50">
        <CardContent className="p-6 flex flex-col justify-between h-full gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
              {title}
              <ArrowRight className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
            </h3>
            <p className="text-sm text-muted-foreground mt-1">{desc}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
