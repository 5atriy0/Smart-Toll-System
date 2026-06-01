'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      {/* Background orbs */}
      {mounted && (
        <>
          <div className="absolute w-[32rem] h-[32rem] rounded-full pointer-events-none z-0"
            style={{
              top: '15%', left: '10%',
              background: 'hsla(215, 52%, 22%, 0.2)',
              filter: 'blur(120px)',
              transform: 'translate(-50%, -50%)'
            }}
          />
          <div className="absolute w-[26rem] h-[26rem] rounded-full pointer-events-none z-0"
            style={{
              bottom: '10%', right: '5%',
              background: 'hsla(38, 91%, 41%, 0.15)',
              filter: 'blur(120px)',
              transform: 'translate(50%, 50%)'
            }}
          />
        </>
      )}

      {/* Grid overlay */}
      <div className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(201, 149, 10, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201, 149, 10, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 20%, transparent 70%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center space-y-8 px-4 max-w-md">
        {/* Toll barrier icon */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-2xl flex items-center justify-center"
            style={{
              backgroundColor: 'hsla(38, 91%, 41%, 0.1)',
              border: '1px solid hsla(38, 91%, 41%, 0.2)'
            }}
          >
            <svg width="48" height="48" viewBox="0 0 64 64" fill="none">
              {/* Poles */}
              <rect x="14" y="8" width="4" height="48" rx="2" fill="hsl(38, 91%, 41%)" opacity="0.6" />
              <rect x="46" y="8" width="4" height="48" rx="2" fill="hsl(38, 91%, 41%)" opacity="0.6" />
              {/* Top bar */}
              <rect x="10" y="8" width="44" height="6" rx="2" fill="hsl(38, 91%, 41%)" opacity="0.8" />
              {/* Barrier pole (diagonal — blocked) */}
              <rect x="14" y="32" width="36" height="5" rx="2" fill="hsl(38, 91%, 41%)"
                style={{ transform: 'rotate(-12deg)', transformOrigin: '16px 34px' }}
                opacity="0.9"
              />
              {/* Warning stripes on barrier */}
              <rect x="18" y="32.5" width="6" height="4" rx="1" fill="hsl(38, 91%, 41%)" opacity="0.3"
                style={{ transform: 'rotate(-12deg)', transformOrigin: '21px 34px' }}
              />
              <rect x="30" y="32.5" width="6" height="4" rx="1" fill="hsl(38, 91%, 41%)" opacity="0.3"
                style={{ transform: 'rotate(-12deg)', transformOrigin: '33px 34px' }}
              />
              <rect x="42" y="32.5" width="6" height="4" rx="1" fill="hsl(38, 91%, 41%)" opacity="0.3"
                style={{ transform: 'rotate(-12deg)', transformOrigin: '45px 34px' }}
              />
            </svg>
          </div>
        </div>

        {/* 404 Text */}
        <div className="space-y-3">
          <h1 className="text-8xl font-bold tracking-tighter leading-none"
            style={{ color: 'hsl(38, 91%, 41%)' }}
          >
            404
          </h1>
          <h2 className="text-xl font-semibold text-foreground">Jalur Tidak Ditemukan</h2>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
            Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan.
            Silakan kembali ke Dashboard untuk melanjutkan.
          </p>
        </div>

        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white transition-all duration-200 group"
          style={{
            backgroundColor: 'hsl(38, 91%, 41%)',
          }}
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Kembali ke Dashboard
        </Link>

        {/* Footer */}
        <p className="text-[11px] text-muted-foreground/40 pt-8">
          Tollytics — Sistem Tol Pintar v1.0
        </p>
      </div>
    </div>
  )
}
