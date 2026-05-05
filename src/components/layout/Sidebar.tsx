'use client';

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Activity, BarChart3, Settings, LogOut } from 'lucide-react'

export function Sidebar() {
  const pathname = usePathname()
  return (
    <div className="w-64 border-r bg-card/10 backdrop-blur-md hidden md:flex flex-col h-full items-start py-8 px-4 transition-all">
      <div className="flex items-center gap-2 px-2 mb-8 w-full">
        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
          <Activity className="text-white w-5 h-5" />
        </div>
        <span className="font-bold text-lg text-foreground tracking-wide">Tol Pintar</span>
      </div>

      <nav className="w-full flex space-y-2 flex-col">
        <NavItem icon={<LayoutDashboard size={20}/>} href="/" label="Dashboard" active={pathname === '/'} />
        <NavItem icon={<Users size={20}/>} href="/users" label="Manajemen Pengguna" active={pathname === '/users'} />
        <NavItem icon={<Activity size={20}/>} href="/transactions" label="Log Transaksi" active={pathname === '/transactions'} />
        <NavItem icon={<BarChart3 size={20}/>} href="/analytics" label="Analitik Big Data" active={pathname === '/analytics'} />
        <NavItem icon={<Settings size={20}/>} href="/settings" label="Pengaturan Sistem" active={pathname === '/settings'} />
      </nav>

      <div className="mt-auto px-4 w-full flex flex-col gap-4">
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex flex-col gap-2">
          <span className="text-sm font-semibold text-primary">Sistem Online</span>
          <span className="text-xs text-muted-foreground">Gateway ESP32 Terhubung</span>
        </div>
        <Link href="/login" className="flex items-center gap-3 px-4 py-3 rounded-lg text-danger hover:bg-danger/10 hover:text-danger font-medium transition-colors">
          <LogOut size={20} />
          <span>Keluar</span>
        </Link>
      </div>
    </div>
  )
}

function NavItem({ icon, label, href, active }: { icon: React.ReactNode, label: string, href: string, active?: boolean }) {
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group ${
        active 
          ? 'bg-primary/10 text-primary font-medium' 
          : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
      }`}
    >
      <div className={`${active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}>
        {icon}
      </div>
      <span>{label}</span>
    </Link>
  )
}
