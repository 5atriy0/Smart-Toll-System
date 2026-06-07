import Link from 'next/link';
import { Cpu, Wifi, Ruler, Shield } from 'lucide-react';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { FeatureCards } from '@/components/landing/FeatureCards';
import { Hero3D, LiveStats } from '@/components/landing/LandingDynamic';

export function LandingView() {
  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <LandingNavbar />

      {/* Skip-to-content target */}
      <main id="main-content">
        {/* Hero */}
        <section className="relative min-h-screen flex items-center" style={{ isolation: 'isolate' }}>
          <Hero3D />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 relative z-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border border-accent/20 bg-accent/5 text-accent mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                Sistem Tol Pintar v1.0
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-[1.1] mb-6">
                Monitor & Kelola{' '}
                <span className="text-accent">Sistem Tol</span>{' '}
                Anda secara Real-time
              </h1>
              <p className="text-base lg:text-lg text-muted-foreground max-w-xl mb-8 leading-relaxed">
                Platform dashboard all-in-one untuk memantau lalu lintas, mengelola gerbang,
                menganalisis data transaksi, dan menjaga kesehatan infrastruktur tol elektronik Anda.
              </p>
              <div className="flex items-center gap-4">
                <Link
                  href="/login"
                  className="px-6 py-3 text-sm font-medium text-white rounded-lg transition-all duration-200 hover:brightness-110 hover:shadow-lg"
                  style={{ backgroundColor: 'hsl(38, 91%, 41%)' }}
                >
                  Mulai Sekarang
                </Link>
                <a
                  href="#features"
                  className="px-6 py-3 text-sm font-medium text-foreground border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  Pelajari Lebih Lanjut
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Tentang Sistem */}
        <section id="about" className="relative py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
                Tentang Tollytics
              </h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-sm lg:text-base">
                Solusi monitoring dan manajemen sistem tol berbasis IoT yang dirancang untuk
                meningkatkan efisiensi operasional dan pengalaman pengguna.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-5">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Tollytics adalah platform dashboard terintegrasi yang memungkinkan operator tol
                  untuk memantau seluruh infrastruktur secara <strong className="text-foreground">real-time</strong>.
                  Mulai dari volume kendaraan, pendapatan harian, hingga kesehatan setiap perangkat
                  gateway — semuanya dapat diakses dari satu dashboard.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Dibangun dengan teknologi <strong className="text-foreground">RFID</strong> untuk
                  identifikasi kendaraan, <strong className="text-foreground">ESP32</strong> sebagai
                  gateway perangkat keras, dan sistem cloud analytics untuk pengolahan data
                  transaksi secara otomatis.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-4">
                  {[
                    { icon: Cpu, label: 'ESP32 Gateway' },
                    { icon: Wifi, label: 'IoT Terintegrasi' },
                    { icon: Ruler, label: 'Analitik & Grafik' },
                    { icon: Shield, label: 'Keamanan Data' },
                  ].map((t) => (
                    <div key={t.label} className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
                      <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                        <t.icon className="w-4 h-4 text-accent" />
                      </div>
                      <span className="text-sm font-medium text-foreground">{t.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="rounded-xl bg-card border border-border p-6 lg:p-8">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Teknologi yang Digunakan</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'RFID Reader', value: 'Identifikasi kendaraan otomatis via kartu RFID' },
                      { label: 'ESP32', value: 'Mikrokontroler untuk kontrol gerbang & sensor' },
                      { label: 'Cloud Database', value: 'Penyimpanan & analisis data transaksi real-time' },
                      { label: 'Next.js', value: 'Frontend dashboard modern & responsif' },
                      { label: 'Supabase', value: 'Backend otentikasi, database, & API terpadu' },
                    ].map((tech) => (
                      <div key={tech.label} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{tech.label}</p>
                          <p className="text-xs text-muted-foreground">{tech.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <FeatureCards />
        <LiveStats />

        {/* CTA */}
        <section className="relative py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight mb-4">
              Siap Mengelola Sistem Tol Anda?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8 text-sm lg:text-base">
              Bergabunglah dengan ribuan pengguna lain yang sudah menggunakan Tollytics
              untuk memonitor dan mengelola sistem tol pintar mereka.
            </p>
            <Link
              href="/login"
              className="inline-flex px-8 py-3.5 text-sm font-medium text-white rounded-lg transition-all duration-200 hover:brightness-110 hover:shadow-lg"
              style={{ backgroundColor: 'hsl(38, 91%, 41%)' }}
            >
              Daftar Sekarang
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-5 h-5 rounded bg-accent/10 flex items-center justify-center border border-accent/20">
              <svg width="12" height="12" viewBox="0 0 32 32" fill="none">
                <rect x="4" y="6" width="24" height="20" rx="3" stroke="hsl(38, 91%, 41%)" strokeWidth="2.5" fill="none"/>
                <rect x="11" y="11" width="10" height="10" rx="1.5" stroke="white" strokeWidth="1.8" fill="none"/>
                <line x1="14" y1="16" x2="18" y2="16" stroke="hsl(38, 91%, 41%)" strokeWidth="2"/>
                <line x1="16" y1="14" x2="16" y2="18" stroke="hsl(38, 91%, 41%)" strokeWidth="2"/>
              </svg>
            </div>
            Tollytics
          </div>
          <p className="text-xs text-muted-foreground/40">
            &copy; {new Date().getFullYear()} Tollytics — Sistem Tol Pintar. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
