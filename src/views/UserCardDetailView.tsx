"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCardsByProfile, addCard, updateCard, deleteCard, getProfile } from "@/services/cardService";
import { updateCardStatus } from "@/services/userService";
import { useToast } from "@/contexts/ToastContext";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  CreditCard, Pencil, Ban, CheckCircle, Trash2, ArrowLeft, Plus, X, Check,
} from "lucide-react";
import type { CardWithVehicle } from "@/lib/types/supabase";

const VEHICLE_LABELS: Record<string, string> = {
  CAR: "Mobil", PICKUP: "Pickup", MINIBUS: "Minibus",
  BUS: "Bus", LIGHT_TRUCK: "Truck Ringan", HEAVY_TRUCK: "Truck Berat",
};

function StatusDot({ status }: { status: string }) {
  const c: Record<string, string> = { ACTIVE: "text-success", BLOCKED: "text-danger", LOST: "text-warning" };
  const l: Record<string, string> = { ACTIVE: "Aktif", BLOCKED: "Diblokir", LOST: "Hilang" };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${c[status] || "text-muted-foreground"}`}>
      <span className={`w-2 h-2 rounded-full ${c[status]?.replace("text-", "bg-") || "bg-muted-foreground"}`} />
      {l[status] || status}
    </span>
  );
}

export function UserCardDetailView({ profileId }: { profileId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [cards, setCards] = useState<CardWithVehicle[]>([]);
  const [profile, setProfile] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [mutLoading, setMutLoading] = useState(false);
  const [editModal, setEditModal] = useState<{ isOpen: boolean; card: CardWithVehicle | null; balance: string; status: string }>({ isOpen: false, card: null, balance: "0", status: "ACTIVE" });
  const [addModal, setAddModal] = useState<{ isOpen: boolean; uid: string; balance: string }>({ isOpen: false, uid: "", balance: "0" });

  const fetchData = async () => {
    setLoading(true);
    const [cardsData, profileData] = await Promise.all([getCardsByProfile(profileId), getProfile(profileId)]);
    setCards(cardsData);
    setProfile(profileData);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [profileId]);

  const handleToggle = async (uid: string, currentStatus: string) => {
    setMutLoading(true);
    const ns = currentStatus === "ACTIVE" ? "BLOCKED" : "ACTIVE";
    const { error } = await updateCardStatus(uid, ns as any);
    if (!error) { toast(`Kartu ${ns === "ACTIVE" ? "diaktifkan" : "diblokir"}`, "success"); fetchData(); }
    else toast("Gagal", "error");
    setMutLoading(false);
  };

  const handleDelete = async (cardId: string) => {
    if (!window.confirm("Yakin ingin menghapus kartu ini?")) return;
    setMutLoading(true);
    const { error } = await deleteCard(cardId);
    if (!error) { toast("Kartu dihapus", "success"); fetchData(); }
    else toast("Gagal menghapus kartu", "error");
    setMutLoading(false);
  };

  const handleEditSave = async () => {
    if (!editModal.card) return;
    setMutLoading(true);
    const { error } = await updateCard({ p_card_id: editModal.card.id, p_balance: Number(editModal.balance), p_status: editModal.status });
    if (!error) { toast("Kartu diperbarui", "success"); setEditModal({ isOpen: false, card: null, balance: "0", status: "ACTIVE" }); fetchData(); }
    else toast("Gagal", "error");
    setMutLoading(false);
  };

  const handleAddCard = async () => {
    if (!addModal.uid.trim()) { toast("UID harus diisi", "error"); return; }
    setMutLoading(true);
    const { error } = await addCard({ p_profile_id: profileId, p_uid: addModal.uid.toUpperCase(), p_balance: Number(addModal.balance) });
    if (!error) { toast("Kartu ditambahkan", "success"); setAddModal({ isOpen: false, uid: "", balance: "0" }); fetchData(); }
    else toast("Gagal menambahkan kartu", "error");
    setMutLoading(false);
  };

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-8 w-48 rounded bg-muted shimmer" />
        <SkeletonTable rows={3} />
      </div>
    );
  }

  const totalBalance = cards.reduce((sum, c) => sum + (c.balance ?? 0), 0);

  return (
    <div className="space-y-5">
      <button onClick={() => router.push("/manajemen-akses/pengguna")}
        className="group text-sm text-muted-foreground hover:text-accent transition-colors mb-1 inline-flex items-center gap-1.5">
        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" /> Kembali
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-l-2 border-accent pl-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">{profile?.name ?? "Pengguna"}</h1>
          <p className="text-sm text-muted-foreground">{profile?.email}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground bg-primary/10 text-primary px-2.5 py-1.5 rounded-lg font-semibold">{cards.length} Kartu</span>
          <span className="text-xs text-muted-foreground bg-accent/10 text-accent px-2.5 py-1.5 rounded-lg font-semibold">Rp {totalBalance.toLocaleString("id-ID")}</span>
          <button onClick={() => setAddModal({ isOpen: true, uid: "", balance: "0" })}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-accent-foreground text-xs font-medium hover:bg-accent/90 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Tambah Kartu
          </button>
        </div>
      </div>

      {cards.length === 0 ? (
        <EmptyState icon={<CreditCard className="w-8 h-8 text-accent" />} title="Belum ada kartu" description="Pengguna ini belum memiliki kartu UID" />
      ) : (
        <div className="rounded-xl bg-card border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-primary/5 via-accent/5 to-transparent border-b-2 border-accent/20">
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">UID</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Saldo</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Kendaraan</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tipe</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {cards.map((card, i) => (
                  <tr key={card.id}
                    className="group hover:bg-muted/20 transition-all duration-150 even:bg-muted/5 opacity-0 animate-[fadeIn_0.3s_ease-out_forwards]"
                    style={{ animationDelay: `${i * 25}ms` }}>
                    <td className="px-4 py-3.5 font-mono text-xs text-foreground">{card.uid}</td>
                    <td className="px-4 py-3.5 font-semibold text-foreground">Rp {(card.balance ?? 0).toLocaleString("id-ID")}</td>
                    <td className="px-4 py-3.5 text-muted-foreground">{card.plate_number || <span className="text-muted-foreground/40 italic">—</span>}</td>
                    <td className="px-4 py-3.5 text-muted-foreground">{card.vehicle_type ? (VEHICLE_LABELS[card.vehicle_type] || card.vehicle_type) : <span className="text-muted-foreground/40 italic">—</span>}</td>
                    <td className="px-4 py-3.5"><StatusDot status={card.status} /></td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex justify-end gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditModal({ isOpen: true, card, balance: String(card.balance ?? 0), status: card.status })}
                          disabled={mutLoading}
                          className="p-2 text-muted-foreground hover:text-accent hover:bg-accent/10 rounded-lg transition-all disabled:opacity-40" title="Edit">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleToggle(card.uid, card.status)} disabled={mutLoading}
                          className={`p-2 rounded-lg transition-all disabled:opacity-40 ${card.status === "ACTIVE" ? "text-danger hover:bg-danger/10" : "text-success hover:bg-success/10"}`}
                          title={card.status === "ACTIVE" ? "Blokir" : "Aktifkan"}>
                          {card.status === "ACTIVE" ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                        <button onClick={() => handleDelete(card.id)} disabled={mutLoading}
                          className="p-2 text-muted-foreground hover:text-danger hover:bg-danger/10 rounded-lg transition-all disabled:opacity-40" title="Hapus">
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

      {editModal.isOpen && editModal.card && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-card border border-border shadow-2xl p-6 rounded-xl w-full max-w-sm animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-5 border-b border-border pb-3">
              <h3 className="text-base font-semibold flex items-center gap-2"><Pencil className="w-4 h-4 text-accent" /> Edit Kartu</h3>
              <button onClick={() => setEditModal({ ...editModal, isOpen: false })}
                className="p-1 text-muted-foreground hover:text-foreground rounded-md"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-xs text-muted-foreground mb-4 bg-muted/30 px-3 py-2 rounded-lg">UID: <span className="font-mono text-foreground">{editModal.card.uid}</span></p>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Saldo (Rp)</label>
                <input type="number" value={editModal.balance} onChange={(e) => setEditModal({ ...editModal, balance: e.target.value })}
                  className="w-full bg-background/50 border border-border rounded-lg px-3.5 py-2 text-sm text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all" min="0" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Status</label>
                <select value={editModal.status} onChange={(e) => setEditModal({ ...editModal, status: e.target.value })}
                  className="w-full bg-background/50 border border-border rounded-lg px-3.5 py-2 text-sm text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all appearance-none">
                  <option value="ACTIVE">Aktif</option>
                  <option value="BLOCKED">Diblokir</option>
                  <option value="LOST">Hilang</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setEditModal({ ...editModal, isOpen: false })}
                className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted/50 transition-colors">Batal</button>
              <button onClick={handleEditSave} disabled={mutLoading}
                className="px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 inline-flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" /> {mutLoading ? "..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {addModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-card border border-border shadow-2xl p-6 rounded-xl w-full max-w-sm animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-5 border-b border-border pb-3">
              <h3 className="text-base font-semibold flex items-center gap-2"><Plus className="w-4 h-4 text-accent" /> Tambah Kartu</h3>
              <button onClick={() => setAddModal({ isOpen: false, uid: "", balance: "0" })}
                className="p-1 text-muted-foreground hover:text-foreground rounded-md"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-xs text-muted-foreground mb-4 bg-muted/30 px-3 py-2 rounded-lg">
              Untuk: <span className="text-foreground font-medium">{profile?.name}</span>
            </p>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">UID <span className="text-danger">*</span></label>
                <input type="text" value={addModal.uid} onChange={(e) => setAddModal({ ...addModal, uid: e.target.value.toUpperCase() })}
                  placeholder="Contoh: UID001"
                  className="w-full bg-background/50 border border-border rounded-lg px-3.5 py-2 text-sm font-mono text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all uppercase" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Saldo Awal (Rp)</label>
                <input type="number" value={addModal.balance} onChange={(e) => setAddModal({ ...addModal, balance: e.target.value })}
                  className="w-full bg-background/50 border border-border rounded-lg px-3.5 py-2 text-sm text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all" min="0" />
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setAddModal({ isOpen: false, uid: "", balance: "0" })}
                className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted/50 transition-colors">Batal</button>
              <button onClick={handleAddCard} disabled={mutLoading || !addModal.uid.trim()}
                className="px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 inline-flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" /> {mutLoading ? "..." : "Tambah"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
