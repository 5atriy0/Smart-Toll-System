'use client';

import { useState } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History, Search, X, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { dateFormat } from '@/lib/utils';

const PAGE_SIZES = [10, 25, 50];

export function TransactionLogs() {
  const { logs, loading, limit, setLimit, dateRange, setDateRange, searchQuery, setSearchQuery, exportData } = useTransactions();
  const [page, setPage] = useState(1);

  const filtered = logs;
  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
  const start = (page - 1) * limit;
  const end = start + limit;
  const pageData = filtered.slice(start, end);

  return (
    <Card className="shadow-sm border-border" style={{ borderLeft: '3px solid hsl(var(--accent))' }}>
      <CardHeader className="border-b border-border pb-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <History className="w-4 h-4" style={{ color: 'hsl(var(--accent))' }} />
            Log Transaksi
          </CardTitle>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari UID atau ID..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                className="w-full bg-background border border-border rounded-lg pl-9 pr-8 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Date filter */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
            >
              <option value="Hari Ini">Hari Ini</option>
              <option value="7 Hari Terakhir">7 Hari Terakhir</option>
              <option value="Bulan Ini">Bulan Ini</option>
              <option value="Semua Waktu">Semua Waktu</option>
            </select>

            {/* Page size */}
            <select
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
            >
              {PAGE_SIZES.map((s) => <option key={s} value={s}>{s} / halaman</option>)}
            </select>

            {/* Export */}
            <button
              onClick={() => exportData('csv')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">CSV</span>
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {loading ? (
          <SkeletonTable rows={5} />
        ) : pageData.length === 0 ? (
          <EmptyState
            title="Tidak ada transaksi"
            description={searchQuery ? 'Tidak ditemukan hasil untuk pencarian ini.' : 'Belum ada transaksi pada periode ini.'}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/30 sticky top-0 z-10">
                  <tr>
                    <th className="px-5 py-3.5 font-medium">ID</th>
                    <th className="px-5 py-3.5 font-medium">Waktu Masuk</th>
                    <th className="px-5 py-3.5 font-medium">Waktu Keluar</th>
                    <th className="px-5 py-3.5 font-medium">Rute</th>
                    <th className="px-5 py-3.5 font-medium">UID</th>
                    <th className="px-5 py-3.5 font-medium">Durasi</th>
                    <th className="px-5 py-3.5 font-medium">Kecepatan</th>
                    <th className="px-5 py-3.5 font-medium">Tarif</th>
                    <th className="px-5 py-3.5 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {pageData.map((tx, i) => (
                    <tr key={tx.id || i} className="hover:bg-primary/[0.03] transition-colors">
                      <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{tx.id?.slice(0, 8)}</td>
                      <td className="px-5 py-3 whitespace-nowrap text-foreground">{tx.timeIn}</td>
                      <td className="px-5 py-3 whitespace-nowrap text-muted-foreground">{tx.timeOut}</td>
                      <td className="px-5 py-3 text-muted-foreground">{tx.loc}</td>
                      <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{tx.rfid}</td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {tx.duration !== null ? (
                          tx.duration < 1
                            ? `${Math.round(tx.duration * 60)} detik`
                            : `${Math.floor(tx.duration)} menit`
                        ) : '-'}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {tx.speed !== null && tx.speed > 0 ? `${tx.speed} km/h` : '-'}
                      </td>
                      <td className="px-5 py-3 font-medium">
                        {tx.tarif ? `Rp ${tx.tarif.toLocaleString()}` : '-'}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-medium border ${
                          tx.status === 'SELESAI'
                            ? 'border-success/30 text-success bg-success/5'
                            : tx.status === 'DI PERJALANAN'
                              ? 'border-accent/30 text-accent bg-accent/5'
                              : 'border-border text-muted-foreground bg-muted/30'
                        }`}>
                          {tx.status === 'SELESAI' ? 'Selesai' : tx.status === 'DI PERJALANAN' ? 'Berjalan' : '-'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/20">
              <span className="text-xs text-muted-foreground">
                Menampilkan {start + 1}–{Math.min(end, filtered.length)} dari {filtered.length} data
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-1.5 rounded-md border border-border text-muted-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-muted-foreground min-w-[4rem] text-center">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="p-1.5 rounded-md border border-border text-muted-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
