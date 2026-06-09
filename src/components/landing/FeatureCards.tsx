import Link from 'next/link';
import { BarChart3, DoorOpen, Users, Receipt, Activity, Cpu } from 'lucide-react';

const features = [
  {
    title: 'Monitoring Real-time',
    desc: 'Pantau lalu lintas tol secara langsung dengan data yang selalu diperbarui.',
    icon: Activity,
  },
  {
    title: 'Analitik Dashboard',
    desc: 'Grafik interaktif untuk menganalisis volume kendaraan, pendapatan, dan tren.',
    icon: BarChart3,
  },
  {
    title: 'Kontrol Gerbang',
    desc: 'Kelola status gerbang tol dan kendali buka/tutup dari jarak jauh.',
    icon: DoorOpen,
  },
  {
    title: 'Manajemen Pengguna',
    desc: 'Atur akun pengguna, UID, saldo, dan riwayat transaksi dengan mudah.',
    icon: Users,
  },
  {
    title: 'Laporan Transaksi',
    desc: 'Rekap lengkap setiap transaksi masuk dan keluar dengan detail fee.',
    icon: Receipt,
  },
  {
    title: 'Kesehatan Sistem',
    desc: 'Monitoring perangkat ESP32, sensor, dan status gateway secara berkala.',
    icon: Cpu,
  },
];

export function FeatureCards() {
  return (
    <section id="features" className="relative py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
            Fitur Unggulan
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-sm lg:text-base">
            Platform all-in-one untuk monitoring dan manajemen sistem tol elektronik Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {features.map((f) => (
            <Link
              key={f.title}
              href="/login"
              className="group relative rounded-xl bg-card border border-border p-6 transition-all duration-300 hover:translate-y-[-4px] hover:shadow-lg block"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-accent/10 transition-colors">
                <f.icon className="w-5 h-5 text-primary group-hover:text-accent transition-colors" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">
                {f.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {f.desc}
              </p>
              <div className="mt-4 text-xs text-accent font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Login untuk mengakses &rarr;
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
