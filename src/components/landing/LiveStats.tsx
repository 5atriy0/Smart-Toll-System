'use client';

import { useEffect, useRef, useState } from 'react';

function Counter({ target, suffix = '', decimals = 0 }: { target: number; suffix?: string; decimals?: number }) {
  const [value, setValue] = useState(0);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;

    const duration = 2000;
    const startTime = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased * 10 ** decimals) / 10 ** decimals);

      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [inView, target, decimals]);

  return (
    <span ref={ref}>
      {value.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}

const stats = [
  { label: 'Total Kendaraan', target: 28450, suffix: '+', icon: '🚗' },
  { label: 'Pendapatan Hari Ini', target: 18750000, prefix: 'Rp ', decimals: 0, icon: null },
  { label: 'Pengguna Aktif', target: 3420, suffix: '+', icon: '👤' },
  { label: 'Transaksi Hari Ini', target: 1256, suffix: '', icon: '📊' },
];

export function LiveStats() {
  return (
    <section id="stats" className="relative py-20 lg:py-28">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: 'linear-gradient(135deg, hsl(215, 52%, 22%) 0%, hsl(215, 45%, 15%) 100%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
            Live Analytics
          </h2>
          <p className="mt-4 text-white/60 max-w-2xl mx-auto text-sm lg:text-base">
            Data real-time dari sistem tol pintar yang terus diperbarui.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-8">
          {stats.map((s) => (
            <div
              key={s.label}
              className="relative text-center p-6 lg:p-8 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
            >
              {s.icon && <div className="text-3xl mb-3" aria-hidden="true">{s.icon}</div>}
              <div className="text-2xl lg:text-3xl font-bold text-accent mb-2">
                {s.prefix || ''}
                <Counter target={s.target} suffix={s.suffix || ''} decimals={s.decimals || 0} />
              </div>
              <div className="text-sm text-white/60">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
