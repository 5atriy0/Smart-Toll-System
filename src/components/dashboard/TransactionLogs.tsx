'use client';

import { useTransactions } from '@/hooks/useTransactions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History, Download, Calendar, ArrowDownToLine, Search } from 'lucide-react';

export function TransactionLogs() {
  const { logs, loading, limit, setLimit, dateRange, setDateRange, searchQuery, setSearchQuery, exportData } = useTransactions();

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-muted-foreground">Memuat data...</p>
    </div>
  );
  return (
    <Card className="col-span-1 border-primary/20">
      <CardHeader className="flex flex-col lg:flex-row items-start lg:items-center justify-between pb-4 gap-4">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg font-medium text-foreground">Log Transaksi</CardTitle>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari ID, RFID, atau Plat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-card/50 border border-border rounded-md pl-9 pr-4 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="relative">
              <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-card/50 border border-border rounded-md pl-9 pr-8 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/50 appearance-none cursor-pointer"
              >
                <option value="Hari Ini">Hari Ini</option>
                <option value="7 Hari Terakhir">7 Hari Terakhir</option>
                <option value="Bulan Ini">Bulan Ini</option>
                <option value="Semua Waktu">Semua Waktu</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Tampilkan:</span>
                <select
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="bg-card border border-border rounded-md px-2 py-1 text-xs"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              <button
                onClick={() => exportData('csv')}
                className="flex items-center gap-2 border border-border hover:bg-white/5 px-3 py-1.5 rounded-md text-sm transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">CSV</span>
              </button>

              <button
                onClick={() => exportData('pdf')}
                className="flex items-center gap-2 bg-danger/10 text-danger hover:bg-danger/20 border border-danger/20 px-3 py-1.5 rounded-md text-sm transition-colors"
              >
                <ArrowDownToLine className="w-4 h-4" />
                <span className="hidden sm:inline">PDF</span>
              </button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="relative overflow-x-auto mt-2">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">ID</th>
                <th className="px-4 py-3">Waktu Masuk</th>
                <th className="px-4 py-3">Waktu Keluar</th>
                <th className="px-4 py-3">Rute</th>
                <th className="px-4 py-3">RFID</th>
                <th className="px-4 py-3">Durasi</th>
                <th className="px-4 py-3">Kecepatan</th>
                <th className="px-4 py-3">Saldo</th>
                <th className="px-4 py-3">Tarif</th>
                <th className="px-4 py-3 rounded-tr-lg text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? logs.map((tx, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-white/5 transition-colors">

                  {/* ID */}
                  <td className="px-4 py-3 font-mono text-muted-foreground">
                    {tx.id.slice(0, 8)}
                  </td>

                  {/* Waktu Masuk*/}
                  <td className="px-4 py-3 font-medium">
                    {tx.timeIn}
                  </td>
                  {/*Waktu Keluar */}
                  <td className="px-4 py-3 font-medium">
                    {tx.timeOut}
                  </td>
                  {/* LOKASI / RUTE */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${tx.status === "SELESAI" ? "bg-success" : "bg-warning"
                        }`}></span>
                      {tx.loc}
                    </div>
                  </td>

                  {/* RFID */}
                  <td className="px-4 py-3 font-mono text-muted-foreground">
                    {tx.rfid}
                  </td>

                  {/* DURASI */}
                  <td className="px-4 py-3">
                    {tx.duration !== null ? (
                      tx.duration < 1 ? (
                        tx.duration === 0 ? "0 detik" : `${Math.round(tx.duration * 60)} detik`
                      ) : (
                        `${Math.floor(tx.duration)} menit`
                      )
                    ) : "-"}
                  </td>

                  {/* SPEED */}
                  <td className="px-4 py-3">
                    {tx.speed !== null && tx.speed > 0 ? `${tx.speed} km/h` : "-"}
                  </td>

                  {/* SALDO */}
                  <td className="px-4 py-3 font-medium text-success">
                    {tx.balance ? `Rp ${tx.balance.toLocaleString()}` : "-"}
                  </td>

                  {/* TARIF */}
                  <td className="px-4 py-3 text-danger">
                    {tx.tarif ? `Rp ${tx.tarif.toLocaleString()}` : "-"}
                  </td>
                  {/* STATUS */}
                  <td className="px-4 py-3 text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${tx.status === "SELESAI"
                      ? "bg-success/10 text-success"
                      : tx.status === "DI PERJALANAN"
                        ? "bg-warning/10 text-warning"
                        : "bg-muted text-muted-foreground"
                      }`}>
                      {tx.status === "SELESAI"
                        ? "Selesai"
                        : tx.status === "DI PERJALANAN"
                          ? "Dalam Perjalanan"
                          : "Belum Masuk"}
                    </span>
                  </td>

                </tr>
              )) : (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                    Tidak ada transaksi yang cocok dengan pencarian Anda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
