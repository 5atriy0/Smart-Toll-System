'use client';

import { useState, useRef, useEffect } from 'react';
import { User, UserCircle, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export function UserNav() {
  const { user, profile, signOut } = useAuth();
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

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setProfileOpen(!profileOpen)}
        className="flex items-center gap-3 pl-4 border-l border-border hover:opacity-80 transition-opacity"
        aria-expanded={profileOpen}
      >
        <div className="flex flex-col items-end hidden sm:flex">
          <span className="text-sm font-medium text-foreground">{profile?.name || user?.email?.split('@')[0] || 'User'}</span>
          <span className="text-xs text-muted-foreground">Pengguna</span>
        </div>
        <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
          <User className="w-5 h-5" />
        </div>
      </button>

      {profileOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl shadow-black/20 overflow-hidden z-50">
          <div className="px-4 py-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{profile?.name || user?.email?.split('@')[0] || 'User'}</p>
                <p className="text-xs text-muted-foreground truncate">{profile?.email || user?.email || ''}</p>
                <span className="inline-block mt-0.5 text-[10px] font-medium text-[hsl(var(--primary))] uppercase tracking-wider">
                  Pengguna
                </span>
              </div>
            </div>
          </div>

          <div className="p-1.5">
            <Link
              href="/user/profile"
              onClick={() => setProfileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent/5 transition-colors"
              role="menuitem"
            >
              <UserCircle className="w-4 h-4" />
              Profil
            </Link>
          </div>

          <div className="border-t border-border p-1.5">
            <button
              onClick={() => { setProfileOpen(false); signOut(); }}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-[#ef4444] hover:bg-[rgba(239,68,68,0.08)] transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Keluar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
