'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { User, UserCircle, LogOut } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';

const PAGE_MAP: Record<string, string> = {
  '/': 'Dashboard',
  '/users': 'Pengguna',
  '/transactions': 'Transaksi',
  '/analytics': 'Analitik',
  '/settings': 'Pengaturan',
  '/profile': 'Profil',
  '/manajemen-akses': 'Manajemen Akses',
  '/manajemen-akses/pengguna': 'Pengguna',
  '/manajemen-akses/uid': 'UID',
  '/manajemen-akses/kendaraan': 'Kendaraan',
};

export function Navbar() {
  const pathname = usePathname();
  const { user, profile, signOut } = useAuth();
  const [lastUpdated, setLastUpdated] = useState('baru saja');
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated((prev) => {
        if (prev === 'baru saja') return '30 detik lalu';
        if (prev === '30 detik lalu') return '1 menit lalu';
        return prev;
      });
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const currentTitle = PAGE_MAP[pathname] || pathname.split('/').pop()?.replace(/-/g, ' ') || 'Dashboard';

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-4 lg:px-8">
      {/* Left: Title + last updated */}
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-foreground tracking-tight">{currentTitle}</h1>
        <span className="text-[11px] text-muted-foreground/60 hidden sm:inline">
          Diperbarui {lastUpdated}
        </span>
      </div>

      {/* Right: Theme toggle + Profile */}
      <div className="flex items-center gap-4 relative" ref={dropdownRef}>
        <ThemeToggle />
        <button
          onClick={() => setProfileOpen(!profileOpen)}
          className="flex items-center gap-3 pl-4 border-l border-border hover:opacity-80 transition-opacity"
          aria-expanded={profileOpen}
          aria-haspopup="true"
          aria-label="Menu profil"
        >
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-sm font-medium text-foreground">{profile?.name || user?.email?.split('@')[0] || 'User'}</span>
            <span className="text-xs text-muted-foreground">{profile?.role === 'ADMIN' ? 'Administrator' : 'User'}</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <User className="w-5 h-5" />
          </div>
        </button>

        {/* Dropdown */}
        {profileOpen && (
          <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl shadow-black/20 overflow-hidden z-50" role="menu">
            {/* User info */}
            <div className="px-4 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{profile?.name || user?.email?.split('@')[0] || 'User'}</p>
                  <p className="text-xs text-muted-foreground truncate">{profile?.email || user?.email || ''}</p>
                  <span className="inline-block mt-0.5 text-[10px] font-medium text-[hsl(var(--sidebar-active))] uppercase tracking-wider">
                    {profile?.role === 'ADMIN' ? 'Administrator' : 'User'}
                  </span>
                </div>
              </div>
            </div>

            {/* Menu */}
            <div className="p-1.5">
              <Link
                href="/profile"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent/5 transition-colors"
                role="menuitem"
              >
                <UserCircle className="w-4 h-4" />
                Profil
              </Link>
            </div>

            {/* Logout */}
            <div className="border-t border-border p-1.5">
              <button
                onClick={() => { setProfileOpen(false); signOut(); }}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-[#ef4444] hover:bg-[rgba(239,68,68,0.08)] transition-colors"
                role="menuitem"
              >
                <LogOut className="w-4 h-4" />
                Keluar
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
