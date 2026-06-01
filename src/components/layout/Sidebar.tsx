'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Activity,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const NAV_ITEMS = [
  { icon: LayoutDashboard, href: '/', label: 'Dashboard' },
  { icon: Users, href: '/users', label: 'Pengguna' },
  { icon: Activity, href: '/transactions', label: 'Transaksi' },
  { icon: BarChart3, href: '/analytics', label: 'Analitik' },
  { icon: Settings, href: '/settings', label: 'Pengaturan' },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col h-full transition-all duration-250 ease-out relative z-30 ${
          collapsed ? 'w-[3.75rem]' : 'w-60'
        }`}
        style={{ backgroundColor: 'hsl(var(--sidebar-bg))' }}
      >
        {/* Logo + Toggle */}
        <div className={`flex items-center h-16 px-4 border-b border-white/10 ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'hsl(var(--sidebar-active))' }}>
            <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
              <rect x="4" y="6" width="24" height="20" rx="3" stroke="white" strokeWidth="2.5" fill="none"/>
              <rect x="11" y="11" width="10" height="10" rx="1.5" stroke="white" strokeWidth="1.8" fill="none"/>
              <line x1="14" y1="16" x2="18" y2="16" stroke="white" strokeWidth="2"/>
              <line x1="16" y1="14" x2="16" y2="18" stroke="white" strokeWidth="2"/>
            </svg>
          </div>
          {!collapsed && (
            <>
              <span className="font-bold text-sm tracking-widest text-white/90 uppercase">Tollytics</span>
              <button
                onClick={() => setCollapsed(true)}
                className="ml-auto flex items-center justify-center w-7 h-7 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </>
          )}
          {collapsed && (
            <button
              onClick={() => setCollapsed(false)}
              className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-white/60 hover:text-white bg-[#1a2d47] border border-white/10 shadow-md transition-colors z-10"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-hidden">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                  active
                    ? 'text-white font-medium'
                    : 'text-white/60 hover:text-white/90 hover:bg-white/5'
                }`}
                title={collapsed ? item.label : undefined}
              >
                {active && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full"
                    style={{ backgroundColor: 'hsl(var(--sidebar-active))' }}
                  />
                )}
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span className="text-sm whitespace-nowrap">{item.label}</span>}
                {collapsed && (
                  <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-md text-xs font-medium text-white bg-[#1C3557] shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 border border-white/10">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={`px-4 py-3 border-t border-white/10 ${collapsed ? 'flex justify-center' : ''}`}>
          {collapsed ? (
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--sidebar-active))' }}>
              <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
                <rect x="4" y="6" width="24" height="20" rx="3" stroke="white" strokeWidth="2.5" fill="none"/>
                <rect x="11" y="11" width="10" height="10" rx="1.5" stroke="white" strokeWidth="1.8" fill="none"/>
                <line x1="14" y1="16" x2="18" y2="16" stroke="white" strokeWidth="2"/>
                <line x1="16" y1="14" x2="16" y2="18" stroke="white" strokeWidth="2"/>
              </svg>
            </div>
          ) : (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold tracking-wider text-white/50 uppercase">Tollytics</span>
              <span className="text-[10px] text-white/30">Sistem Tol Pintar v1.0</span>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around h-16 px-2 border-t border-border"
        style={{ backgroundColor: 'hsl(var(--sidebar-bg))' }}
      >
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors min-w-0 ${
                active ? 'text-white' : 'text-white/50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] leading-tight">{item.label}</span>
              {active && (
                <span className="w-1 h-1 rounded-full" style={{ backgroundColor: 'hsl(var(--sidebar-active))' }} />
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
