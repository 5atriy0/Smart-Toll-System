'use client';

import { useState, useEffect, useMemo } from "react";
import { getTransactions, updateTransaction, deleteTransaction, getGates } from "@/services/transactionService";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useToast } from "@/contexts/ToastContext";
import styles from "./TransactionsView.module.scss";
import type { VwTransactionDetails, Gate } from "@/lib/types/supabase";
import {
  Search, ArrowUpDown, ArrowUp, ArrowDown,
  Eye, Pencil, Trash2, History, X, Download,
  ChevronLeft, ChevronRight, Check, ArrowLeft,
} from "lucide-react";

type SortKey = "uid" | "name" | "tap_in_time" | "fee" | "status";
type SortDir = "asc" | "desc" | null;

const COLUMNS: { key: SortKey | null; label: string }[] = [
  { key: "uid", label: "UID" },
  { key: "name", label: "Nama" },
  { key: null, label: "Rute" },
  { key: "tap_in_time", label: "Waktu" },
  { key: "fee", label: "Tarif" },
  { key: "status", label: "Status" },
];

const PAGE_SIZES = [10, 25, 50];

const STATUS_OPTIONS = [
  { value: "all", label: "Semua Status" },
  { value: "COMPLETED", label: "Selesai" },
  { value: "IN_PROGRESS", label: "Berjalan" },
  { value: "CANCELLED", label: "Dibatalkan" },
];

const DATE_RANGE_OPTIONS = [
  { value: "Semua Waktu", label: "Semua Waktu" },
  { value: "Hari Ini", label: "Hari Ini" },
  { value: "7 Hari Terakhir", label: "7 Hari Terakhir" },
  { value: "Bulan Ini", label: "Bulan Ini" },
];

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active || !dir) return <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground/30" />;
  return dir === "asc" ? <ArrowUp className="w-3.5 h-3.5 text-accent" /> : <ArrowDown className="w-3.5 h-3.5 text-accent" />;
}

function StatusBadge({ status }: { status: string }) {
  if (status === "COMPLETED") {
    return <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-medium border border-success/30 text-success bg-success/5">Selesai</span>;
  }
  if (status === "IN_PROGRESS") {
    return <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-medium border border-accent/30 text-accent bg-accent/5">Berjalan</span>;
  }
  return <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-medium border border-border text-muted-foreground bg-muted/30">Dibatalkan</span>;
}

function formatDuration(minutes: number | null) {
  if (minutes === null || minutes === undefined) return "-";
  if (minutes < 1) return `${Math.round(minutes * 60)} detik`;
  return `${Math.floor(minutes)} menit`;
}

function formatSpeed(speed: number | null) {
  if (speed === null || speed === undefined || speed <= 0) return "-";
  return `${speed} km/h`;
}

function formatFee(fee: number | null) {
  if (fee === null || fee === undefined) return "-";
  return `Rp ${fee.toLocaleString("id-ID")}`;
}

function formatDateTime(ts: string | null) {
  if (!ts) return "-";
  try {
    const d = new Date(ts.endsWith("Z") || ts.includes("+") ? ts : ts + "Z");
    return d.toLocaleString("id-ID", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return ts;
  }
}

function getStatusLabel(status: string) {
  if (status === "COMPLETED") return "Selesai";
  if (status === "IN_PROGRESS") return "Berjalan";
  return "Dibatalkan";
}

export function TransactionsView() {
  const { toast } = useToast();

  const [data, setData] = useState<VwTransactionDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [gates, setGates] = useState<Gate[]>([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState("Semua Waktu");

  const [sortKey, setSortKey] = useState<SortKey>("tap_in_time");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [detailTx, setDetailTx] = useState<VwTransactionDetails | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editForm, setEditForm] = useState({
    status: "", fee: "", gate_out_id: "", tap_out_time: "", distance_km: "",
  });
  const [showConfirmEdit, setShowConfirmEdit] = useState(false);
  const [deleteTx, setDeleteTx] = useState<VwTransactionDetails | null>(null);

  const [mutLoading, setMutLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const result = await getTransactions({ limit: 9999 });
    setData(result.data);
    setLoading(false);
  };

  const fetchGates = async () => {
    const result = await getGates();
    setGates(result);
  };

  useEffect(() => {
    fetchData();
    fetchGates();
  }, []);

  const filtered = useMemo(() => {
    let result = [...data];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((tx) =>
        (tx.id?.toLowerCase() || "").includes(q) ||
        (tx.uid?.toLowerCase() || "").includes(q) ||
        (tx.name?.toLowerCase() || "").includes(q) ||
        (tx.plate_number?.toLowerCase() || "").includes(q)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((tx) => tx.status === statusFilter);
    }

    if (dateRange !== "Semua Waktu") {
      const now = new Date();
      let startDate: Date;
      if (dateRange === "Hari Ini") {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (dateRange === "7 Hari Terakhir") {
        startDate = new Date();
        startDate.setDate(now.getDate() - 7);
      } else {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }
      result = result.filter((tx) => {
        const txDate = new Date(tx.tap_in_time);
        return txDate >= startDate;
      });
    }

    if (sortDir) {
      result.sort((a, b) => {
        let aVal: unknown = a[sortKey as keyof VwTransactionDetails];
        let bVal: unknown = b[sortKey as keyof VwTransactionDetails];
        let cmp = 0;

        if (sortKey === "fee" || sortKey === "duration_minutes") {
          cmp = (Number(aVal) || 0) - (Number(bVal) || 0);
        } else if (sortKey === "tap_in_time" || sortKey === "tap_out_time") {
          cmp = new Date(String(aVal || "")).getTime() - new Date(String(bVal || "")).getTime();
        } else {
          cmp = String(aVal ?? "").localeCompare(String(bVal ?? ""));
        }

        return sortDir === "asc" ? cmp : -cmp;
      });
    }

    return result;
  }, [data, search, statusFilter, dateRange, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
  const start = (page - 1) * limit;
  const end = start + limit;
  const pageData = filtered.slice(start, end);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir(sortDir === null ? "asc" : sortDir === "asc" ? "desc" : null);
    else { setSortKey(key); setSortDir("asc"); }
  };

  const openDetail = (tx: VwTransactionDetails) => {
    setDetailTx(tx);
    setShowEditForm(false);
    setEditForm({
      status: tx.status,
      fee: String(tx.fee ?? ""),
      gate_out_id: "",
      tap_out_time: tx.tap_out_time ? tx.tap_out_time.slice(0, 16) : "",
      distance_km: String(tx.distance_km ?? ""),
    });
  };

  const handleEditClick = () => {
    if (!detailTx) return;
    setShowEditForm(true);
  };

  const handleEditBack = () => {
    if (showConfirmEdit) {
      setShowConfirmEdit(false);
      return;
    }
    if (showEditForm) {
      setShowEditForm(false);
      setEditForm({
        status: detailTx!.status,
        fee: String(detailTx!.fee ?? ""),
        gate_out_id: "",
        tap_out_time: detailTx!.tap_out_time ? detailTx!.tap_out_time.slice(0, 16) : "",
        distance_km: String(detailTx!.distance_km ?? ""),
      });
      return;
    }
    setDetailTx(null);
  };

  const handleEditSubmit = () => {
    if (!detailTx) return;
    const changes: string[] = [];
    if (editForm.status !== detailTx.status) changes.push(`Status: ${getStatusLabel(detailTx.status)} → ${getStatusLabel(editForm.status)}`);
    if (editForm.fee !== String(detailTx.fee ?? "")) changes.push(`Tarif: ${formatFee(detailTx.fee)} → Rp ${Number(editForm.fee).toLocaleString("id-ID")}`);
    if (editForm.distance_km !== String(detailTx.distance_km ?? "")) changes.push(`Jarak: ${detailTx.distance_km} km → ${editForm.distance_km} km`);
    if (editForm.tap_out_time !== (detailTx.tap_out_time?.slice(0, 16) || "")) {
      changes.push(`Waktu Keluar: ${formatDateTime(detailTx.tap_out_time)} → ${editForm.tap_out_time || "-"}`);
    }
    if (editForm.gate_out_id) {
      const selectedGate = gates.find((g) => g.id === editForm.gate_out_id);
      if (selectedGate) changes.push(`Gate Keluar: ${detailTx.gate_out_name || "-"} → ${selectedGate.name}`);
    }
    if (changes.length === 0) {
      toast("Tidak ada perubahan yang dilakukan", "info");
      setShowEditForm(false);
      return;
    }
    setShowConfirmEdit(true);
  };

  const handleEditConfirm = async () => {
    if (!detailTx) return;
    setMutLoading(true);
    const { error } = await updateTransaction({
      p_transaction_id: detailTx.id,
      p_status: editForm.status !== detailTx.status ? editForm.status : undefined,
      p_fee: editForm.fee !== String(detailTx.fee ?? "") ? Number(editForm.fee) : undefined,
      p_gate_out_id: editForm.gate_out_id || undefined,
      p_tap_out_time: editForm.tap_out_time ? new Date(editForm.tap_out_time).toISOString() : undefined,
      p_distance_km: editForm.distance_km !== String(detailTx.distance_km ?? "") ? Number(editForm.distance_km) : undefined,
    });
    if (!error) {
      toast("Transaksi berhasil diperbarui", "success");
      setShowConfirmEdit(false);
      setShowEditForm(false);
      setDetailTx(null);
      fetchData();
    } else {
      toast("Gagal memperbarui transaksi", "error");
    }
    setMutLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteTx) return;
    setMutLoading(true);
    const { error } = await deleteTransaction({ p_transaction_id: deleteTx.id });
    if (!error) {
      toast("Transaksi berhasil dihapus", "success");
      setData((prev) => prev.filter((tx) => tx.id !== deleteTx.id));
      setDetailTx(null);
      setDeleteTx(null);
    } else {
      toast("Gagal menghapus transaksi", "error");
    }
    setMutLoading(false);
  };

  const handleExportCSV = () => {
    if (filtered.length === 0) {
      toast("Tidak ada data untuk diexport", "info");
      return;
    }

    const headers = ["ID", "UID", "Nama", "Email", "Plat", "Tipe Kendaraan", "Gate Masuk", "Gate Keluar", "Tap In", "Tap Out", "Durasi (menit)", "Kecepatan (km/h)", "Jarak (km)", "Tarif", "Status"];
    const rows = filtered.map((tx) => [
      tx.id, tx.uid, tx.name, tx.email, tx.plate_number, tx.vehicle_type,
      tx.gate_in_name, tx.gate_out_name || "",
      tx.tap_in_time, tx.tap_out_time || "",
      tx.duration_minutes ?? "", tx.average_speed ?? "", tx.distance_km ?? "",
      tx.fee ?? "", tx.status,
    ]);

    const csvContent = [
      "\uFEFF" + headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => {
          const str = String(cell ?? "");
          return str.includes(",") || str.includes('"') || str.includes("\n")
            ? `"${str.replace(/"/g, '""')}"`
            : str;
        }).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transaksi_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Data berhasil diunduh", "success");
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className={styles.header}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
            <History className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Data Transaksi</h1>
            <p className="text-sm text-muted-foreground">Riwayat seluruh transaksi tol</p>
          </div>
        </div>
      </div>

      {/* Action Legend + CSV */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-[11px] text-muted-foreground px-1">
          <span className="inline-flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-accent" /> Detail
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Trash2 className="w-3.5 h-3.5 text-danger" /> Hapus
          </span>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari UID, nama, atau plat..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-card border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="bg-card border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all cursor-pointer"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <select
          value={dateRange}
          onChange={(e) => { setDateRange(e.target.value); setPage(1); }}
          className="bg-card border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all cursor-pointer"
        >
          {DATE_RANGE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <select
          value={limit}
          onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
          className="bg-card border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent/50 cursor-pointer"
        >
          {PAGE_SIZES.map((s) => <option key={s} value={s}>{s} / halaman</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <SkeletonTable rows={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<History className="w-8 h-8 text-accent" />}
          title={search || statusFilter !== "all" || dateRange !== "Semua Waktu" ? "Tidak ada hasil" : "Belum ada transaksi"}
          description="Tidak ditemukan data transaksi dengan filter yang dipilih."
        />
      ) : (
        <div className="rounded-xl bg-card border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-accent/20 bg-gradient-to-r from-primary/5 via-accent/5 to-transparent">
                  {COLUMNS.map((col) => (
                    <th
                      key={col.label}
                      onClick={() => col.key && handleSort(col.key)}
                      className={`px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap ${
                        col.key
                          ? "cursor-pointer select-none transition-colors hover:text-foreground"
                          : "text-muted-foreground"
                      } ${col.key && sortKey === col.key ? "text-accent" : "text-muted-foreground"}`}
                    >
                      <div className="flex items-center gap-1.5">
                        {col.label}
                        {col.key && <SortIcon active={sortKey === col.key} dir={sortDir} />}
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {pageData.map((tx, i) => (
                  <tr
                    key={tx.id}
                    className="group hover:bg-muted/20 transition-all duration-150 even:bg-muted/5 opacity-0 animate-[fadeIn_0.3s_ease-out_forwards]"
                    style={{ animationDelay: `${i * 25}ms` }}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{tx.uid}</td>
                    <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">{tx.name}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{tx.gate_in_name || "-"} → {tx.gate_out_name || "-"}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDateTime(tx.tap_in_time)}</td>
                    <td className="px-4 py-3 font-medium whitespace-nowrap">{formatFee(tx.fee)}</td>
                    <td className="px-4 py-3"><StatusBadge status={tx.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openDetail(tx)}
                          className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-all"
                          title="Detail Transaksi"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTx(tx)}
                          className="p-2 text-muted-foreground hover:text-danger hover:bg-danger/10 rounded-lg transition-all"
                          title="Hapus Transaksi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
        </div>
      )}

      {/* Detail Modal */}
      {detailTx && !showEditForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out] p-4">
          <div className="bg-card border border-border shadow-2xl rounded-xl w-full max-w-lg animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Eye className="w-4 h-4 text-accent" />
                Detail Transaksi
              </h3>
              <button onClick={() => { setDetailTx(null); }} className="p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-1">ID Transaksi</p>
                  <p className="text-xs font-mono font-bold text-foreground break-all">{detailTx.id}</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-1">UID</p>
                  <p className="text-xs font-mono font-bold text-foreground">{detailTx.uid}</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-1">Nama</p>
                  <p className="text-xs font-bold text-foreground">{detailTx.name}</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-1">Email</p>
                  <p className="text-xs text-foreground">{detailTx.email}</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-1">Plat Kendaraan</p>
                  <p className="text-xs font-bold text-foreground">{detailTx.plate_number || "-"}</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-1">Tipe Kendaraan</p>
                  <p className="text-xs text-foreground">{detailTx.vehicle_type}</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-1">Gate Masuk</p>
                  <p className="text-xs font-bold text-foreground">{detailTx.gate_in_name || "-"}</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-1">Gate Keluar</p>
                  <p className="text-xs font-bold text-foreground">{detailTx.gate_out_name || "-"}</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-1">Tap In</p>
                  <p className="text-xs font-bold text-foreground">{formatDateTime(detailTx.tap_in_time)}</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-1">Tap Out</p>
                  <p className="text-xs font-bold text-foreground">{formatDateTime(detailTx.tap_out_time)}</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-1">Durasi</p>
                  <p className="text-xs font-bold text-foreground">{formatDuration(detailTx.duration_minutes)}</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-1">Kecepatan Rata-rata</p>
                  <p className="text-xs font-bold text-foreground">{formatSpeed(detailTx.average_speed)}</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-1">Jarak (km)</p>
                  <p className="text-xs font-bold text-foreground">{detailTx.distance_km ?? "-"} km</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-1">Tarif</p>
                  <p className="text-xs font-bold text-foreground">{formatFee(detailTx.fee)}</p>
                </div>
              </div>
              <div className="bg-muted/30 rounded-lg p-3 flex items-center justify-between">
                <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Status</p>
                <StatusBadge status={detailTx.status} />
              </div>
            </div>

            <div className="flex items-center justify-between px-5 pb-5 pt-1">
              <button onClick={() => setDetailTx(null)}
                className="px-3 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted/50 transition-colors">
                Tutup
              </button>
              <button onClick={handleEditClick}
                className="px-3 py-2 rounded-lg bg-accent text-accent-foreground text-xs font-medium hover:bg-accent/90 transition-colors inline-flex items-center gap-1.5">
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {detailTx && showEditForm && !showConfirmEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out] p-4">
          <div className="bg-card border border-border shadow-2xl rounded-xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Pencil className="w-4 h-4 text-accent" />
                Edit Transaksi
              </h3>
              <button onClick={() => { setShowEditForm(false); setDetailTx(null); }}
                className="p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-muted-foreground bg-muted/30 px-3 py-2 rounded-lg font-mono">
                ID: <span className="text-foreground font-semibold">{detailTx.id.slice(0, 8)}</span>
                {" — "}
                UID: <span className="text-foreground font-semibold">{detailTx.uid}</span>
              </p>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Status</label>
                <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full bg-background/50 border border-border rounded-lg px-3.5 py-2 text-sm text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all appearance-none">
                  <option value="COMPLETED">Selesai</option>
                  <option value="IN_PROGRESS">Berjalan</option>
                  <option value="CANCELLED">Dibatalkan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Tarif (Rp)</label>
                <input type="number" value={editForm.fee} onChange={(e) => setEditForm({ ...editForm, fee: e.target.value })}
                  className="w-full bg-background/50 border border-border rounded-lg px-3.5 py-2 text-sm text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all" min="0" />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Gate Keluar</label>
                <select value={editForm.gate_out_id} onChange={(e) => setEditForm({ ...editForm, gate_out_id: e.target.value })}
                  className="w-full bg-background/50 border border-border rounded-lg px-3.5 py-2 text-sm text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all appearance-none">
                  <option value="">Pilih Gate (opsional)</option>
                  {gates.map((gate) => (
                    <option key={gate.id} value={gate.id}>{gate.name} — {gate.location}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Waktu Keluar</label>
                <input type="datetime-local" value={editForm.tap_out_time} onChange={(e) => setEditForm({ ...editForm, tap_out_time: e.target.value })}
                  className="w-full bg-background/50 border border-border rounded-lg px-3.5 py-2 text-sm text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all" />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Jarak (km)</label>
                <input type="number" step="0.01" value={editForm.distance_km} onChange={(e) => setEditForm({ ...editForm, distance_km: e.target.value })}
                  className="w-full bg-background/50 border border-border rounded-lg px-3.5 py-2 text-sm text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all" min="0" />
              </div>
            </div>

            <div className="flex items-center justify-between px-5 pb-5 pt-1">
              <button onClick={handleEditBack}
                className="px-3 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted/50 transition-colors inline-flex items-center gap-1.5">
                <ArrowLeft className="w-3.5 h-3.5" /> Kembali
              </button>
              <button onClick={handleEditSubmit}
                className="px-4 py-2 rounded-lg bg-accent text-accent-foreground text-xs font-medium hover:bg-accent/90 transition-colors inline-flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" /> Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Edit Modal */}
      <ConfirmModal
        isOpen={showConfirmEdit}
        onClose={() => setShowConfirmEdit(false)}
        onConfirm={handleEditConfirm}
        title="Konfirmasi Perubahan"
        description={
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Berikut perubahan yang akan disimpan:</p>
            <div className="bg-muted/30 rounded-lg p-3 space-y-1.5 text-xs">
              {(() => {
                if (!detailTx) return <p className="text-xs text-muted-foreground">Memuat...</p>;
                const changes: React.ReactNode[] = [];
                if (editForm.status !== detailTx.status) {
                  changes.push(
                    <div key="status" className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="text-foreground font-medium">{getStatusLabel(detailTx.status)} → {getStatusLabel(editForm.status)}</span>
                    </div>
                  );
                }
                if (editForm.fee !== String(detailTx.fee ?? "")) {
                  changes.push(
                    <div key="fee" className="flex justify-between">
                      <span className="text-muted-foreground">Tarif:</span>
                      <span className="text-foreground font-medium">{formatFee(detailTx.fee)} → Rp {Number(editForm.fee).toLocaleString("id-ID")}</span>
                    </div>
                  );
                }
                if (editForm.distance_km !== String(detailTx.distance_km ?? "")) {
                  changes.push(
                    <div key="dist" className="flex justify-between">
                      <span className="text-muted-foreground">Jarak:</span>
                      <span className="text-foreground font-medium">{detailTx.distance_km} km → {editForm.distance_km} km</span>
                    </div>
                  );
                }
                if (editForm.gate_out_id) {
                  const selectedGate = gates.find((g) => g.id === editForm.gate_out_id);
                  if (selectedGate) {
                    changes.push(
                      <div key="gate" className="flex justify-between">
                        <span className="text-muted-foreground">Gate Keluar:</span>
                        <span className="text-foreground font-medium">{detailTx.gate_out_name || "-"} → {selectedGate.name}</span>
                      </div>
                    );
                  }
                }
                if (editForm.tap_out_time !== (detailTx.tap_out_time?.slice(0, 16) || "")) {
                  changes.push(
                    <div key="time" className="flex justify-between">
                      <span className="text-muted-foreground">Waktu Keluar:</span>
                      <span className="text-foreground font-medium">{editForm.tap_out_time || "-"}</span>
                    </div>
                  );
                }
                return changes.length > 0 ? changes : <p className="text-xs text-muted-foreground">Tidak ada perubahan</p>;
              })()}
            </div>
          </div>
        }
        confirmLabel="Konfirmasi"
        variant="info"
        loading={mutLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteTx}
        onClose={() => setDeleteTx(null)}
        onConfirm={handleDelete}
        title="Hapus Transaksi"
        description={
          deleteTx ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Apakah Anda yakin ingin menghapus transaksi berikut? Tindakan ini tidak dapat dibatalkan.</p>
              <div className="bg-muted/30 rounded-lg p-3 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">ID:</span>
                  <span className="text-foreground font-medium font-mono">{deleteTx.id.slice(0, 8)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">UID:</span>
                  <span className="text-foreground font-medium font-mono">{deleteTx.uid}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Nama:</span>
                  <span className="text-foreground font-medium">{deleteTx.name}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Plat:</span>
                  <span className="text-foreground font-medium">{deleteTx.plate_number}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Status:</span>
                  <StatusBadge status={deleteTx.status} />
                </div>
              </div>
            </div>
          ) : undefined
        }
        confirmLabel="Hapus Permanen"
        cancelLabel="Batalkan"
        variant="danger"
        loading={mutLoading}
      />
    </div>
  );
}
