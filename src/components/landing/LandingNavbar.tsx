'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-background/80 backdrop-blur-lg shadow-sm border-b border-border/50'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center border border-accent/20 group-hover:bg-accent/20 transition-colors">
              <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
                <rect x="4" y="6" width="24" height="20" rx="3" stroke="hsl(38, 91%, 41%)" strokeWidth="2.5" fill="none"/>
                <rect x="11" y="11" width="10" height="10" rx="1.5" stroke="white" strokeWidth="1.8" fill="none"/>
                <line x1="14" y1="16" x2="18" y2="16" stroke="hsl(38, 91%, 41%)" strokeWidth="2"/>
                <line x1="16" y1="14" x2="16" y2="18" stroke="hsl(38, 91%, 41%)" strokeWidth="2"/>
              </svg>
            </div>
            <span className="text-lg font-bold text-foreground tracking-tight">
              Tollytics
            </span>
          </a>

          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Fitur
            </a>
            <a href="#stats" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Statistik
            </a>
            <a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Tentang
            </a>
            <ThemeToggle />
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-foreground hover:text-accent transition-colors"
              >
                Masuk
              </Link>
              <Link
                href="/login"
                className="px-5 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200 hover:brightness-110"
                style={{ backgroundColor: 'hsl(38, 91%, 41%)' }}
              >
                Daftar
              </Link>
            </div>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setOpen(!open)}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Menu"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-lg">
          <div className="px-4 py-4 space-y-3">
            <a href="#features" onClick={() => setOpen(false)} className="block text-sm text-muted-foreground hover:text-foreground py-2">
              Fitur
            </a>
            <a href="#stats" onClick={() => setOpen(false)} className="block text-sm text-muted-foreground hover:text-foreground py-2">
              Statistik
            </a>
            <a href="#about" onClick={() => setOpen(false)} className="block text-sm text-muted-foreground hover:text-foreground py-2">
              Tentang
            </a>
            <div className="pt-2 flex gap-3">
              <Link href="/login" onClick={() => setOpen(false)} className="flex-1 text-center px-4 py-2 text-sm font-medium border border-border rounded-lg text-foreground hover:bg-muted">
                Masuk
              </Link>
              <Link href="/login" onClick={() => setOpen(false)} className="flex-1 text-center px-4 py-2 text-sm font-medium text-white rounded-lg" style={{ backgroundColor: 'hsl(38, 91%, 41%)' }}>
                Daftar
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
