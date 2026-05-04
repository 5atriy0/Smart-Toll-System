'use client';

import Link from 'next/link'
import { AlertTriangle, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 px-4">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-2xl bg-danger/10 border border-danger/20 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-danger" />
          </div>
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-foreground tracking-tight">404</h1>
          <h2 className="text-xl font-semibold text-foreground">Halaman Tidak Ditemukan</h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
          </p>
        </div>

        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-medium transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  )
}
