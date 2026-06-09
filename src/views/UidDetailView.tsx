"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getUsers } from "@/services/userService";
import { getAllCards, addCard, updateCard, deleteCard } from "@/services/cardService";
import { useToast } from "@/contexts/ToastContext";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import {
  Search, ArrowUp, ArrowDown, ArrowUpDown,
  Pencil, Ban, CheckCircle, Trash2, CreditCard, X, Check, ArrowLeft, Plus, Eye,
} from "lucide-react";
import type { CardWithUser } from "@/lib/types/supabase";

type SortKey = "uid" | "profile_name" | "balance" | "plate_number" | "status";
type SortDir = "asc" | "desc" | null;

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "uid", label: "UID" },
  { key: "profile_name", label: "Pemilik" },
  { key: "balance", label: "Saldo" },
  { key: "plate_number", label: "Kendaraan" },
  { key: "status", label: "Status" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "Semua" },
  { value: "ACTIVE", label: "Aktif" },
  { value: "BLOCKED", label: "Diblokir" },
];

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active || !dir) return <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground/40" />;
  return dir === "asc" ? <ArrowUp className="w-3.5 h-3.5 text-accent" /> : <ArrowDown className="w-3.5 h-3.5 text-accent" />;
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    ACTIVE: "text-success",
    BLOCKED: "text-danger",
  };
  const labels: Record<string, string> = {
    ACTIVE: "Aktif",
    BLOCKED: "Diblokir",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${colors[status] || "text-muted-foreground"}`}>
      <span className={`w-2 h-2 rounded-full ${colors[status]?.replace("text-", "bg-") || "bg-muted-foreground"}`} />
      {labels[status] || status}
    </span>
  );
}

export function UidDetailView() {
  const router = useRouter();
  const { toast } = useToast();
  const [data, setData] = useState<CardWithUser[]>([]);
  const [users, setUsers] = useState<{ id: string; name: string; email: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("uid");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const [deleteCardId, setDeleteCardId] = useState<string | null>(null);
  const [addModal, setAddModal] = useState({ isOpen: false, profile_id: "", uid: "", balance: "0" });
  const [addLoading, setAddLoading] = useState(false);

  const [detailCard, setDetailCard] = useState<CardWithUser | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editForm, setEditForm] = useState({ balance: "0", status: "ACTIVE" });
  const [showConfirmEdit, setShowConfirmEdit] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [cards, allUsers] = await Promise.all([getAllCards(), getUsers()]);
    setData(cards);
    setUsers(allUsers.map((u) => ({ id: u.id, name: u.name, email: u.email })));
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = useMemo(() => {
    let result = data;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) => c.uid.toLowerCase().includes(q) || c.profile_name.toLowerCase().includes(q) || (c.plate_number || "").toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") {
      result = result.filter((c) => c.status === statusFilter);
    }
    if (sortDir) {
      result = [...result].sort((a, b) => {
        if (sortKey === "balance") return sortDir === "asc" ? a.balance - b.balance : b.balance - a.balance;
        const aVal = String(a[sortKey] ?? "").toLowerCase();
        const bVal = String(b[sortKey] ?? "").toLowerCase();
        return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      });
    }
    return result;
  }, [data, search, statusFilter, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir(sortDir === null ? "asc" : sortDir === "asc" ? "desc" : null);
    else { setSortKey(key); setSortDir("asc"); }
  };

  const handleToggle = async (card: CardWithUser) => {
    const newStatus = card.status === "ACTIVE" ? "BLOCKED" : "ACTIVE";
    const { error } = await updateCard({ p_card_id: card.id, p_status: newStatus });
    if (!error) {
      toast(`Kartu ${newStatus === "ACTIVE" ? "diaktifkan" : "diblokir"}`, "success");
      fetchData();
    } else toast("Gagal mengubah status", "error");
  };

  const handleDelete = async () => {
    if (!deleteCardId) return;
    const { error } = await deleteCard(deleteCardId);
    if (!error) { toast("Kartu dihapus", "success"); setDeleteCardId(null); fetchData(); }
    else toast("Gagal menghapus kartu", "error");
  };

  const handleEditSubmit = () => {
    if (!detailCard) return;
    const changes: string[] = [];
    if (Number(editForm.balance) !== detailCard.balance) changes.push(`Saldo: Rp ${detailCard.balance.toLocaleString("id-ID")} → Rp ${Number(editForm.balance).toLocaleString("id-ID")}`);
    if (editForm.status !== detailCard.status) changes.push(`Status: ${detailCard.status} → ${editForm.status}`);
    if (changes.length === 0) {
      toast("Tidak ada perubahan", "info");
      return;
    }
    setShowConfirmEdit(true);
  };

  const handleEditConfirm = async () => {
    if (!detailCard) return;
    setEditLoading(true);
    const { error } = await updateCard({
      p_card_id: detailCard.id,
      p_balance: Number(editForm.balance),
      p_status: editForm.status,
    });
    if (!error) {
      toast("Kartu diperbarui", "success");
      setShowConfirmEdit(false);
      setShowEditForm(false);
      setDetailCard((prev) => prev ? { ...prev, balance: Number(editForm.balance), status: editForm.status as CardWithUser["status"] } : null);
      fetchData();
    } else toast("Gagal memperbarui kartu", "error");
    setEditLoading(false);
  };

  const openDetail = (card: CardWithUser) => {
    setDetailCard(card);
    setShowEditForm(false);
    setEditForm({ balance: String(card.balance ?? 0), status: card.status });
  };

  const handleAddCard = async () => {
    if (!addModal.profile_id || !addModal.uid) {
      toast("Pilih pengguna dan masukkan UID", "error");
      return;
    }
    setAddLoading(true);
    const { error } = await addCard({
      p_profile_id: addModal.profile_id,
      p_uid: addModal.uid,
      p_balance: Number(addModal.balance),
    });
    if (!error) {
      toast("Kartu berhasil ditambahkan", "success");
      setAddModal({ isOpen: false, profile_id: "", uid: "", balance: "0" });
      fetchData();
    } else toast("Gagal menambahkan kartu", "error");
    setAddLoading(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/manajemen-akses")}
            className="p-1.5 text-muted-foreground hover:text-accent hover:bg-accent/10 rounded-lg transition-colors" title="Kembali">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="border-l border-border pl-3">
            <h1 className="text-xl font-bold text-foreground">UID Card</h1>
            <p className="text-sm text-muted-foreground">Semua kartu UID terdaftar</p>
          </div>
        </div>
        <button onClick={() => setAddModal({ isOpen: true, profile_id: "", uid: "", balance: "0" })}
          className="px-5 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:bg-accent/90 transition-colors inline-flex items-center gap-1.5 shadow-sm">
          <Plus className="w-4 h-4" /> Tambah Kartu
        </button>
      </div>

      <div className="flex items-center gap-4 text-[11px] text-muted-foreground px-1">
        <span className="inline-flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-accent" /> Detail
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Ban className="w-3.5 h-3.5 text-danger" /> Blokir/Aktifkan
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Trash2 className="w-3.5 h-3.5 text-muted-foreground" /> Hapus
        </span>
      </div>

      <div className="flex gap-3 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Cari UID, pemilik, atau plat nomor..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-card border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all cursor-pointer">
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {loading ? <SkeletonTable rows={5} /> : filtered.length === 0 ? (
        <EmptyState icon={<CreditCard className="w-8 h-8 text-accent" />} title="Belum ada data UID" description="Daftarkan kartu UID baru untuk memulai" />
      ) : (
        <div className="rounded-xl bg-card border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-primary/5 via-accent/5 to-transparent border-b-2 border-accent/20">
                  {COLUMNS.map((col) => (
                    <th key={col.key} onClick={() => handleSort(col.key)}
                      className={`px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer select-none transition-colors hover:text-foreground ${sortKey === col.key ? "text-accent" : "text-muted-foreground"}`}>
                      <div className="flex items-center gap-1.5">{col.label}<SortIcon active={sortKey === col.key} dir={sortDir} /></div>
                    </th>
                  ))}
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filtered.map((card, i) => (
                  <tr key={card.id}
                    className="group hover:bg-muted/20 transition-all duration-150 even:bg-muted/5 opacity-0 animate-[fadeIn_0.3s_ease-out_forwards]"
                    style={{ animationDelay: `${i * 25}ms` }}>
                    <td className="px-4 py-3.5 font-mono text-xs text-foreground">{card.uid}</td>
                    <td className="px-4 py-3.5">
                      <span className="font-medium text-foreground">{card.profile_name}</span>
                      <span className="block text-[11px] text-muted-foreground">{card.profile_email}</span>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-foreground">Rp {(card.balance ?? 0).toLocaleString("id-ID")}</td>
                    <td className="px-4 py-3.5 text-muted-foreground">{card.plate_number || <span className="text-muted-foreground/40 italic">—</span>}</td>
                    <td className="px-4 py-3.5"><StatusDot status={card.status} /></td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex justify-end gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openDetail(card)}
                          className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-all" title="Detail">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleToggle(card)}
                          className={`p-2 rounded-lg transition-all ${card.status === "ACTIVE" ? "text-danger hover:bg-danger/10" : "text-success hover:bg-success/10"}`}
                          title={card.status === "ACTIVE" ? "Blokir" : "Aktifkan"}>
                          {card.status === "ACTIVE" ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                        <button onClick={() => setDeleteCardId(card.id)}
                          className="p-2 text-muted-foreground hover:text-danger hover:bg-danger/10 rounded-lg transition-all" title="Hapus">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tambah Kartu Modal */}
      {addModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out] p-4">
          <div className="bg-card border border-border shadow-2xl rounded-xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Plus className="w-4 h-4 text-accent" /> Tambah Kartu
              </h3>
              <button onClick={() => setAddModal({ ...addModal, isOpen: false })}
                className="p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Pengguna</label>
                <select value={addModal.profile_id} onChange={(e) => setAddModal({ ...addModal, profile_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all">
                  <option value="">Pilih pengguna...</option>
                  {users.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">UID Kartu</label>
                <input type="text" value={addModal.uid} onChange={(e) => setAddModal({ ...addModal, uid: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all font-mono" placeholder="UID kartu" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Saldo Awal <span className="text-muted-foreground/50 font-normal">(opsional)</span></label>
                <input type="number" value={addModal.balance} onChange={(e) => setAddModal({ ...addModal, balance: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all" min="0" placeholder="0" />
              </div>
            </div>
            <div className="flex justify-end gap-2 px-5 py-3.5 border-t border-border">
              <button onClick={() => setAddModal({ ...addModal, isOpen: false })}
                className="px-4 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted/50 transition-colors">Batal</button>
              <button onClick={handleAddCard} disabled={addLoading}
                className="px-4 py-2 rounded-lg bg-accent text-accent-foreground text-xs font-medium hover:bg-accent/90 transition-colors inline-flex items-center gap-1.5 disabled:opacity-50">
                {addLoading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail / Edit Modal */}
      {detailCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out] p-4">
          <div className="bg-card border border-border shadow-2xl rounded-xl w-full max-w-md animate-in zoom-in-95 duration-200">
            {!showEditForm ? (
              <>
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Eye className="w-4 h-4 text-accent" /> Detail Kartu
                  </h3>
                  <button onClick={() => { setDetailCard(null); setShowEditForm(false); }}
                    className="p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/30 rounded-lg p-3">
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-1">UID</p>
                      <p className="text-sm font-mono font-bold text-foreground">{detailCard.uid}</p>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3">
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-1">Status</p>
                      <StatusDot status={detailCard.status} />
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3">
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-1">Pemilik</p>
                      <p className="text-xs font-semibold text-foreground">{detailCard.profile_name}</p>
                      <p className="text-[11px] text-muted-foreground">{detailCard.profile_email}</p>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3">
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-1">Saldo</p>
                      <p className="text-xs font-bold text-foreground">Rp {(detailCard.balance ?? 0).toLocaleString("id-ID")}</p>
                    </div>
                    {detailCard.plate_number && (
                      <div className="bg-muted/30 rounded-lg p-3 col-span-2">
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-1">Kendaraan</p>
                        <p className="text-xs font-medium text-foreground">{detailCard.plate_number}{detailCard.vehicle_type ? ` (${detailCard.vehicle_type})` : ""}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-between px-5 py-3.5 border-t border-border">
                  <button onClick={() => { setDetailCard(null); setShowEditForm(false); }}
                    className="px-4 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted/50 transition-colors">Tutup</button>
                  <button onClick={() => setShowEditForm(true)}
                    className="px-4 py-2 rounded-lg bg-accent text-accent-foreground text-xs font-medium hover:bg-accent/90 transition-colors inline-flex items-center gap-1.5">
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Pencil className="w-4 h-4 text-accent" /> Edit Kartu
                  </h3>
                  <button onClick={() => { if (showConfirmEdit) setShowConfirmEdit(false); else setShowEditForm(false); }}
                    className="p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-5 space-y-4">
                  <p className="text-xs text-muted-foreground bg-muted/30 px-3 py-2 rounded-lg">
                    UID: <span className="font-mono text-foreground">{detailCard.uid}</span>
                    <span className="block text-foreground mt-0.5">{detailCard.profile_name}</span>
                  </p>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Saldo (Rp)</label>
                    <input type="number" value={editForm.balance}
                      onChange={(e) => setEditForm({ ...editForm, balance: e.target.value })}
                      className="w-full bg-background/50 border border-border rounded-lg px-3.5 py-2 text-sm text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all" min="0" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Status</label>
                    <select value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      className="w-full bg-background/50 border border-border rounded-lg px-3.5 py-2 text-sm text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all appearance-none">
                      <option value="ACTIVE">Aktif</option>
                      <option value="BLOCKED">Diblokir</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-between px-5 py-3.5 border-t border-border">
                  <button onClick={() => { setShowEditForm(false); setShowConfirmEdit(false); setEditForm({ balance: String(detailCard.balance ?? 0), status: detailCard.status }); }}
                    className="px-4 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted/50 transition-colors">Kembali</button>
                  <button onClick={handleEditSubmit}
                    className="px-4 py-2 rounded-lg bg-accent text-accent-foreground text-xs font-medium hover:bg-accent/90 transition-colors inline-flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" /> Simpan
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Confirm Edit */}
      <ConfirmModal
        isOpen={showConfirmEdit}
        onClose={() => setShowConfirmEdit(false)}
        onConfirm={handleEditConfirm}
        title="Konfirmasi Perubahan"
        description={
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Ringkasan perubahan untuk kartu <span className="font-mono text-foreground">{detailCard?.uid}</span></p>
            <div className="space-y-1">
              {Number(editForm.balance) !== detailCard?.balance && (
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Saldo:</span><span className="text-foreground font-medium">Rp {Number(editForm.balance).toLocaleString("id-ID")}</span></div>
              )}
              {editForm.status !== detailCard?.status && (
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Status:</span><span className="text-foreground font-medium">{editForm.status === "ACTIVE" ? "Aktif" : "Diblokir"}</span></div>
              )}
            </div>
          </div>
        }
        confirmLabel="Simpan"
        cancelLabel="Batal"
        variant="info"
        loading={editLoading}
      />

      {/* Confirm Hapus */}
      <ConfirmModal
        isOpen={deleteCardId !== null}
        onClose={() => setDeleteCardId(null)}
        onConfirm={handleDelete}
        title="Hapus Kartu"
        description="Apakah Anda yakin ingin menghapus kartu ini? Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Hapus Permanen"
        cancelLabel="Batal"
        variant="danger"
      />
    </div>
  );
}
