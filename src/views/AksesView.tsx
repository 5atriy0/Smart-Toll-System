"use client";

import { useRouter } from "next/navigation";
import { useAkses } from "@/hooks/useAkses";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { Users, CreditCard, Truck, ArrowUpRight } from "lucide-react";

const CARD_META = [
  {
    icon: Users,
    label: "Pengguna",
    href: "/manajemen-akses/pengguna",
    color: "text-blue-500 bg-blue-500/10",
    statKey: "pengguna" as const,
  },
  {
    icon: CreditCard,
    label: "UID Card",
    href: "/manajemen-akses/uid",
    color: "text-emerald-500 bg-emerald-500/10",
    statKey: "uid" as const,
  },
  {
    icon: Truck,
    label: "Kendaraan",
    href: "/manajemen-akses/kendaraan",
    color: "text-amber-500 bg-amber-500/10",
    statKey: "kendaraan" as const,
  },
];

function SummaryCard({
  icon: Icon,
  label,
  color,
  href,
  statKey,
  stats,
}: {
  icon: React.ElementType;
  label: string;
  color: string;
  href: string;
  statKey: string;
  stats: { total: number; active: number; inactive: number; noCard: number };
}) {
  const router = useRouter();
  const showNoCard = statKey !== "uid";
  const barTotal = showNoCard ? stats.active + stats.noCard + stats.inactive : stats.active + stats.inactive;
  const noCardLabel = "Tanpa Kartu";

  return (
    <button
      onClick={() => router.push(href)}
      className="rounded-xl bg-card border border-border p-5 text-left transition-all duration-200 hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5 w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className="text-2xl font-bold text-foreground mb-3">{stats.total}</p>

      {statKey === "kendaraan" && stats.types ? (
        <div className="space-y-1.5 text-xs">
          {stats.types.map((t) => (
            <div key={t.label} className="flex justify-between">
              <span className="text-muted-foreground">{t.label}</span>
              <span className="font-medium text-foreground">{t.count}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-success">Aktif</span>
            <span className="font-medium text-foreground">{stats.active}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-danger">Nonaktif</span>
            <span className="font-medium text-foreground">{stats.inactive}</span>
          </div>
          {showNoCard && (
            <div className="flex justify-between">
              <span className="text-warning">{noCardLabel}</span>
              <span className="font-medium text-foreground">{stats.noCard}</span>
            </div>
          )}
        </div>
      )}

      {statKey !== "kendaraan" && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="h-1.5 rounded-full bg-muted overflow-hidden flex">
            {stats.active > 0 && (
              <div className="h-full bg-success transition-all cursor-pointer hover:opacity-80" style={{ width: `${(stats.active / barTotal) * 100}%` }} title={`Aktif: ${stats.active}`} />
            )}
            {showNoCard && stats.noCard > 0 && (
              <div className="h-full bg-warning transition-all cursor-pointer hover:opacity-80" style={{ width: `${(stats.noCard / barTotal) * 100}%` }} title={`${noCardLabel}: ${stats.noCard}`} />
            )}
            {stats.inactive > 0 && (
              <div className="h-full bg-danger transition-all cursor-pointer hover:opacity-80" style={{ width: `${(stats.inactive / barTotal) * 100}%` }} title={`Nonaktif: ${stats.inactive}`} />
            )}
          </div>
        </div>
      )}

      {statKey === "kendaraan" && stats.types && stats.types.length > 1 && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="h-1.5 rounded-full bg-muted overflow-hidden flex">
            {stats.types.map((t, i) => {
              const TYPE_BAR_COLORS = ["bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-purple-500", "bg-orange-500", "bg-rose-500"];
              return (
                <div
                  key={t.label}
                  className={`h-full ${TYPE_BAR_COLORS[i % TYPE_BAR_COLORS.length]} transition-all cursor-pointer hover:opacity-80`}
                  style={{ width: `${(t.count / stats.total) * 100}%` }}
                  title={`${t.label}: ${t.count}`}
                />
              );
            })}
          </div>
        </div>
      )}
    </button>
  );
}

export function AksesView() {
  const { stats, loading } = useAkses();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Manajemen Akses</h1>
        <p className="text-sm text-muted-foreground mt-1">Kelola pengguna, kartu UID, dan kendaraan</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} lines={4} />)
          : CARD_META.map((meta) => (
              <SummaryCard key={meta.statKey} {...meta} stats={stats[meta.statKey]} />
            ))}
      </div>
    </div>
  );
}
