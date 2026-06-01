'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const isDark = stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDark(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggle}
      className="relative w-9 h-9 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
      aria-label={dark ? 'Mode terang' : 'Mode gelap'}
    >
      {dark ? <Sun className="w-4 h-4 text-accent" /> : <Moon className="w-4 h-4 text-primary" />}
    </button>
  );
}
