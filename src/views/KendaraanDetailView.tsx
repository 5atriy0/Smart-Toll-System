"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getAllVehicles, updateVehicle, deleteVehicle } from "@/services/cardService";
import { getUsers } from "@/services/userService";
import { useToast } from "@/contexts/ToastContext";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { createClient } from "@/lib/supabase/client";
import {
  Search, ArrowUpDown, ArrowUp, ArrowDown,
  Pencil, Trash2, Truck, X, Check, ArrowLeft, Plus, Eye,
} from "lucide-react";
import type { VehicleWithOwner } from "@/services/cardService";

type SortKey = "plate_number" | "vehicle_type" | "brand" | "owner_name";
type SortDir = "asc" | "desc" | null;

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "plate_number", label: "Plat Nomor" },
  { key: "vehicle_type", label: "Tipe" },
  { key: "brand", label: "Merek" },
  { key: "owner_name", label: "Pemilik" },
];

const VEHICLE_LABELS: Record<string, string> = {
  CAR: "Mobil", PICKUP: "Pickup", MINIBUS: "Minibus",
  BUS: "Bus", LIGHT_TRUCK: "Truck Ringan", HEAVY_TRUCK: "Truck Berat",
};

const VEHICLE_ICONS: Record<string, string> = {
  CAR: "🚗", PICKUP: "🛻", MINIBUS: "🚐",
  BUS: "🚌", LIGHT_TRUCK: "🚛", HEAVY_TRUCK: "🚛",
};

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active || !dir) return <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground/40" />;
  return dir === "asc" ? <ArrowUp className="w-3.5 h-3.5 text-accent" /> : <ArrowDown className="w-3.5 h-3.5 text-accent" />;
}

export function KendaraanDetailView() {
  const router = useRouter();
  const { toast } = useToast();
  const [data, setData] = useState<VehicleWithOwner[]>([]);
  const [users, setUsers] = useState<{ id: string; name: string; email: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("plate_number");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const [detailVehicle, setDetailVehicle] = useState<VehicleWithOwner | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editForm, setEditForm] = useState({ plate_number: "", vehicle_type: "CAR", brand: "" });
  const [showConfirmEdit, setShowConfirmEdit] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const [deleteVehicleId, setDeleteVehicleId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [addModal, setAddModal] = useState({ isOpen: false, profile_id: "", plate_number: "", vehicle_type: "CAR", brand: "" });
  const [addLoading, setAddLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [vehicles, allUsers] = await Promise.all([getAllVehicles(), getUsers()]);
    setData(vehicles);
    setUsers(allUsers.map((u) => ({ id: u.id, name: u.name, email: u.email })));
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = useMemo(() => {
    let result = data;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (v) => v.plate_number.toLowerCase().includes(q) || v.vehicle_type.toLowerCase().includes(q) || (v.brand ?? "").toLowerCase().includes(q) || v.owner_name.toLowerCase().includes(q)
      );
    }
    if (sortDir) {
      result = [...result].sort((a, b) => {
        const aVal = String(a[sortKey] ?? "").toLowerCase();
        const bVal = String(b[sortKey] ?? "").toLowerCase();
        return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      });
    }
    return result;
  }, [data, search, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir(sortDir === null ? "asc" : sortDir === "asc" ? "desc" : null);
    else { setSortKey(key); setSortDir("asc"); }
  };

  const openDetail = (vehicle: VehicleWithOwner) => {
    setDetailVehicle(vehicle);
    setShowEditForm(false);
    setEditForm({ plate_number: vehicle.plate_number, vehicle_type: vehicle.vehicle_type, brand: vehicle.brand ?? "" });
  };

  const handleEditSubmit = () => {
    if (!detailVehicle) return;
    const changes: string[] = [];
    if (editForm.plate_number !== detailVehicle.plate_number) changes.push(`Plat: ${detailVehicle.plate_number} → ${editForm.plate_number}`);
    if (editForm.vehicle_type !== detailVehicle.vehicle_type) changes.push(`Tipe: ${VEHICLE_LABELS[detailVehicle.vehicle_type] || detailVehicle.vehicle_type} → ${VEHICLE_LABELS[editForm.vehicle_type] || editForm.vehicle_type}`);
    if (editForm.brand !== (detailVehicle.brand ?? "")) changes.push(`Merek: ${detailVehicle.brand || "—"} → ${editForm.brand || "—"}`);
    if (changes.length === 0) {
      toast("Tidak ada perubahan", "info");
      return;
    }
    setShowConfirmEdit(true);
  };

  const handleEditConfirm = async () => {
    if (!detailVehicle) return;
    setEditLoading(true);
    const { error } = await updateVehicle(detailVehicle.id, {
      plate_number: editForm.plate_number,
      vehicle_type: editForm.vehicle_type,
      brand: editForm.brand || null,
    });
    if (!error) {
      toast("Kendaraan diperbarui", "success");
      setShowConfirmEdit(false);
      setShowEditForm(false);
      setDetailVehicle((prev) => prev ? { ...prev, plate_number: editForm.plate_number, vehicle_type: editForm.vehicle_type, brand: editForm.brand || "" } : null);
      fetchData();
    } else toast("Gagal memperbarui kendaraan", "error");
    setEditLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteVehicleId) return;
    setDeleteLoading(true);
    const { error } = await deleteVehicle(deleteVehicleId);
    if (!error) { toast("Kendaraan dihapus", "success"); setDeleteVehicleId(null); fetchData(); }
    else { console.error("deleteVehicle error:", error); toast("Gagal menghapus kendaraan", "error"); }
    setDeleteLoading(false);
  };

  const handleAddVehicle = async () => {
    if (!addModal.profile_id || !addModal.plate_number) {
      toast("Pilih pengguna dan masukkan plat nomor", "error");
      return;
    }
    setAddLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("vehicles").insert({
      profile_id: addModal.profile_id,
      plate_number: addModal.plate_number.toUpperCase(),
      vehicle_type: addModal.vehicle_type,
      brand: addModal.brand || null,
    });
    if (!error) {
      toast("Kendaraan berhasil ditambahkan", "success");
      setAddModal({ isOpen: false, profile_id: "", plate_number: "", vehicle_type: "CAR", brand: "" });
      fetchData();
    } else toast("Gagal menambahkan kendaraan", "error");
    setAddLoading(false);
  };

  const vehicleLabel = (type: string) => VEHICLE_LABELS[type] || type;
  const vehicleIcon = (type: string) => VEHICLE_ICONS[type] || "🚗";

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/manajemen-akses")}
            className="p-1.5 text-muted-foreground hover:text-accent hover:bg-accent/10 rounded-lg transition-colors" title="Kembali">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="border-l border-border pl-3">
            <h1 className="text-xl font-bold text-foreground">Kendaraan</h1>
            <p className="text-sm text-muted-foreground">Semua kendaraan terdaftar</p>
          </div>
        </div>
        <button onClick={() => setAddModal({ isOpen: true, profile_id: "", plate_number: "", vehicle_type: "CAR", brand: "" })}
          className="px-5 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:bg-accent/90 transition-colors inline-flex items-center gap-1.5 shadow-sm">
          <Plus className="w-4 h-4" /> Tambah Kendaraan
        </button>
      </div>

      <div className="flex items-center gap-4 text-[11px] text-muted-foreground px-1">
        <span className="inline-flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-accent" /> Detail
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Trash2 className="w-3.5 h-3.5 text-muted-foreground" /> Hapus
        </span>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="text" placeholder="Cari plat nomor, tipe, merek, atau pemilik..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-card border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all" />
      </div>

      {loading ? <SkeletonTable rows={5} /> : filtered.length === 0 ? (
        <EmptyState icon={<Truck className="w-8 h-8 text-accent" />} title="Belum ada data kendaraan" description="Daftarkan kendaraan baru untuk memulai" />
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
                {filtered.map((v, i) => (
                  <tr key={v.id}
                    className="group hover:bg-muted/20 transition-all duration-150 even:bg-muted/5 opacity-0 animate-[fadeIn_0.3s_ease-out_forwards]"
                    style={{ animationDelay: `${i * 25}ms` }}>
                    <td className="px-4 py-3.5 font-medium text-foreground">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{vehicleIcon(v.vehicle_type)}</span>
                        <span>{v.plate_number}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-muted/50 text-muted-foreground border border-border/50">
                        {vehicleLabel(v.vehicle_type)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">{v.brand || <span className="text-muted-foreground/40 italic">—</span>}</td>
                    <td className="px-4 py-3.5">
                      <span className="font-medium text-foreground">{v.owner_name}</span>
                      <span className="block text-[11px] text-muted-foreground">{v.owner_email}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex justify-end gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openDetail(v)}
                          className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-all" title="Detail">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteVehicleId(v.id)}
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

      {/* Detail / Edit Modal */}
      {detailVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out] p-4">
          <div className="bg-card border border-border shadow-2xl rounded-xl w-full max-w-md animate-in zoom-in-95 duration-200">
            {!showEditForm ? (
              <>
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Eye className="w-4 h-4 text-accent" /> Detail Kendaraan
                  </h3>
                  <button onClick={() => { setDetailVehicle(null); setShowEditForm(false); }}
                    className="p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/30 rounded-lg p-3">
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-1">Plat Nomor</p>
                      <p className="text-sm font-bold text-foreground">{detailVehicle.plate_number}</p>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3">
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-1">Tipe</p>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-muted/50 text-muted-foreground border border-border/50">
                        {vehicleIcon(detailVehicle.vehicle_type)} {vehicleLabel(detailVehicle.vehicle_type)}
                      </span>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3">
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-1">Merek</p>
                      <p className="text-xs font-semibold text-foreground">{detailVehicle.brand || <span className="text-muted-foreground/40 italic">—</span>}</p>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3">
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-1">Pemilik</p>
                      <p className="text-xs font-semibold text-foreground">{detailVehicle.owner_name}</p>
                      <p className="text-[11px] text-muted-foreground">{detailVehicle.owner_email}</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between px-5 py-3.5 border-t border-border">
                  <button onClick={() => { setDetailVehicle(null); setShowEditForm(false); }}
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
                    <Pencil className="w-4 h-4 text-accent" /> Edit Kendaraan
                  </h3>
                  <button onClick={() => { if (showConfirmEdit) setShowConfirmEdit(false); else setShowEditForm(false); }}
                    className="p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-5 space-y-4">
                  <p className="text-xs text-muted-foreground bg-muted/30 px-3 py-2 rounded-lg">
                    <span className="text-lg">{vehicleIcon(detailVehicle.vehicle_type)}</span>{" "}
                    {detailVehicle.plate_number}
                    <span className="block text-foreground mt-0.5">{detailVehicle.owner_name}</span>
                  </p>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Plat Nomor</label>
                    <input type="text" value={editForm.plate_number}
                      onChange={(e) => setEditForm({ ...editForm, plate_number: e.target.value.toUpperCase() })}
                      className="w-full bg-background/50 border border-border rounded-lg px-3.5 py-2 text-sm text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all uppercase" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Tipe Kendaraan</label>
                    <select value={editForm.vehicle_type}
                      onChange={(e) => setEditForm({ ...editForm, vehicle_type: e.target.value })}
                      className="w-full bg-background/50 border border-border rounded-lg px-3.5 py-2 text-sm text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all appearance-none">
                      {Object.entries(VEHICLE_LABELS).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Merek</label>
                    <input type="text" value={editForm.brand}
                      onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
                      className="w-full bg-background/50 border border-border rounded-lg px-3.5 py-2 text-sm text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all" />
                  </div>
                </div>
                <div className="flex justify-between px-5 py-3.5 border-t border-border">
                  <button onClick={() => { setShowEditForm(false); setShowConfirmEdit(false); setEditForm({ plate_number: detailVehicle.plate_number, vehicle_type: detailVehicle.vehicle_type, brand: detailVehicle.brand ?? "" }); }}
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
            <p className="text-xs text-muted-foreground">Ringkasan perubahan untuk <span className="text-foreground font-medium">{detailVehicle?.plate_number}</span></p>
            <div className="space-y-1">
              {editForm.plate_number !== detailVehicle?.plate_number && (
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Plat:</span><span className="text-foreground font-medium">{editForm.plate_number}</span></div>
              )}
              {editForm.vehicle_type !== detailVehicle?.vehicle_type && (
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Tipe:</span><span className="text-foreground font-medium">{VEHICLE_LABELS[editForm.vehicle_type] || editForm.vehicle_type}</span></div>
              )}
              {editForm.brand !== (detailVehicle?.brand ?? "") && (
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Merek:</span><span className="text-foreground font-medium">{editForm.brand || "—"}</span></div>
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
        isOpen={deleteVehicleId !== null}
        onClose={() => setDeleteVehicleId(null)}
        onConfirm={handleDelete}
        title="Hapus Kendaraan"
        description={
          (() => {
            const v = data.find((d) => d.id === deleteVehicleId);
            return v ? (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Anda akan menghapus kendaraan ini:</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs"><span className="text-muted-foreground">Plat:</span><span className="text-foreground font-medium">{v.plate_number}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-muted-foreground">Tipe:</span><span className="text-foreground font-medium">{vehicleLabel(v.vehicle_type)}</span></div>
                  {v.brand && <div className="flex justify-between text-xs"><span className="text-muted-foreground">Merek:</span><span className="text-foreground font-medium">{v.brand}</span></div>}
                  <div className="flex justify-between text-xs"><span className="text-muted-foreground">Pemilik:</span><span className="text-foreground font-medium">{v.owner_name}</span></div>
                </div>
                <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/50">Kartu yang terhubung akan kehilangan data kendaraan.</p>
              </div>
            ) : "Apakah Anda yakin ingin menghapus kendaraan ini?"
          })()
        }
        confirmLabel="Hapus"
        cancelLabel="Batal"
        variant="danger"
        loading={deleteLoading}
      />

      {/* Tambah Kendaraan Modal */}
      {addModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out] p-4">
          <div className="bg-card border border-border shadow-2xl rounded-xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Plus className="w-4 h-4 text-accent" /> Tambah Kendaraan
              </h3>
              <button onClick={() => setAddModal({ ...addModal, isOpen: false })}
                className="p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Pemilik</label>
                <select value={addModal.profile_id} onChange={(e) => setAddModal({ ...addModal, profile_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all">
                  <option value="">Pilih pengguna...</option>
                  {users.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Plat Nomor</label>
                <input type="text" value={addModal.plate_number} onChange={(e) => setAddModal({ ...addModal, plate_number: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all uppercase" placeholder="Contoh: B 1234 ABC" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Tipe Kendaraan</label>
                <select value={addModal.vehicle_type} onChange={(e) => setAddModal({ ...addModal, vehicle_type: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all appearance-none">
                  {Object.entries(VEHICLE_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Merek <span className="text-muted-foreground/50 font-normal">(opsional)</span></label>
                <input type="text" value={addModal.brand} onChange={(e) => setAddModal({ ...addModal, brand: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all" placeholder="Contoh: Toyota" />
              </div>
            </div>
            <div className="flex justify-end gap-2 px-5 py-3.5 border-t border-border">
              <button onClick={() => setAddModal({ ...addModal, isOpen: false })}
                className="px-4 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted/50 transition-colors">Batal</button>
              <button onClick={handleAddVehicle} disabled={addLoading}
                className="px-4 py-2 rounded-lg bg-accent text-accent-foreground text-xs font-medium hover:bg-accent/90 transition-colors inline-flex items-center gap-1.5 disabled:opacity-50">
                {addLoading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
