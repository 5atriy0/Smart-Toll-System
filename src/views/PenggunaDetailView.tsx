"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getUsers, deleteUserFull } from "@/services/userService";
import { updateProfile } from "@/services/cardService";
import { getCardsByProfile, updateCard, deleteCard } from "@/services/cardService";
import { useToast } from "@/contexts/ToastContext";
import { useAuth } from "@/contexts/AuthContext";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import {
  Search, ArrowUpDown, ArrowUp, ArrowDown,
  Eye, Pencil, Trash2, Users, X, Check, Ban, CheckCircle,
  CreditCard, ArrowLeft, List, ChevronRight, Wallet,
  User, LayoutGrid, Plus, Key,
} from "lucide-react";
import type { UserWithIsActive } from "@/services/userService";
import type { CardWithVehicle, UserRole, VehicleType } from "@/lib/types/supabase";

type SortKey = "name" | "email" | "role" | "is_active";
type SortDir = "asc" | "desc" | null;

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "name", label: "Nama" },
  { key: "email", label: "Email" },
  { key: "role", label: "Peran" },
  { key: "is_active", label: "Status" },
];

type ViewMode = "table" | "grid";

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active || !dir) return <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground/40" />;
  return dir === "asc" ? <ArrowUp className="w-3.5 h-3.5 text-accent" /> : <ArrowDown className="w-3.5 h-3.5 text-accent" />;
}

function getStatusInfo(user: UserWithIsActive) {
  if (!user.is_active) return { label: "Nonaktif", color: "text-danger", dot: "bg-danger", bar: "bg-danger", bg: "bg-danger/10", border: "border-danger/20" };
  if (!user.uid) return { label: "Aktif - Tidak Memiliki Kartu", color: "text-warning", dot: "bg-warning", bar: "bg-warning", bg: "bg-warning/10", border: "border-warning/20" };
  return { label: "Aktif", color: "text-success", dot: "bg-success", bar: "bg-success", bg: "bg-success/10", border: "border-success/20" };
}

function UserCard({
  user,
  onDetail,
}: {
  user: UserWithIsActive;
  onDetail: (user: UserWithIsActive) => void;
}) {
  const status = getStatusInfo(user);

  return (
    <button
      onClick={() => onDetail(user)}
      className="w-full text-left rounded-xl bg-card border border-border p-4 transition-all duration-200 hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 animate-[fadeIn_0.3s_ease-out_forwards]"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-sm font-bold text-primary shrink-0`}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate max-w-[140px] sm:max-w-[200px]">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate max-w-[140px] sm:max-w-[200px]">{user.email}</p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
      </div>

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${user.role === "ADMIN" ? "bg-accent/15 text-accent border border-accent/20" : "bg-muted/50 text-muted-foreground border border-border/50"}`}>
          {user.role}
        </span>
        <span className={`inline-flex items-center gap-1 text-xs font-medium ${status.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
          {status.label}
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <CreditCard className="w-3 h-3" />
          {user.uid ? "Memiliki Kartu" : "Tidak Ada Kartu"}
        </span>
        {user.uid && (
          <span className="inline-flex items-center gap-1">
            <Wallet className="w-3 h-3" />
            Rp {(user.balance ?? 0).toLocaleString("id-ID")}
          </span>
        )}
      </div>

    </button>
  );
}

export function PenggunaDetailView() {
  const router = useRouter();
  const { toast } = useToast();
  const { profile: currentProfile } = useAuth();
  const [data, setData] = useState<UserWithIsActive[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [mutLoading, setMutLoading] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "", email: "", password: "", confirmPassword: "", role: "USER" as string,
    uid: "", plate_number: "", vehicle_type: "CAR" as string,
  });
  const [addLoading, setAddLoading] = useState(false);
  const [showAddPassword, setShowAddPassword] = useState(false);

  const [showResetPw, setShowResetPw] = useState(false);
  const [resetPassword, setResetPassword] = useState("");
  const [resetConfirmPassword, setResetConfirmPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [showResetPwInput, setShowResetPwInput] = useState(false);

  const [detailUser, setDetailUser] = useState<UserWithIsActive | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "" as UserRole | string });
  const [showConfirmEdit, setShowConfirmEdit] = useState(false);

  const [userCards, setUserCards] = useState<CardWithVehicle[]>([]);
  const [cardsLoading, setCardsLoading] = useState(false);
  const [uidModalOpen, setUidModalOpen] = useState(false);

  const [toggleUser, setToggleUser] = useState<UserWithIsActive | null>(null);
  const [deleteUser, setDeleteUser] = useState<UserWithIsActive | null>(null);

  const [editUidCard, setEditUidCard] = useState<CardWithVehicle | null>(null);
  const [editUidForm, setEditUidForm] = useState({ balance: "0", status: "ACTIVE" });
  const [deleteUidCardId, setDeleteUidCardId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const result = await getUsers();
    setData(result);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = useMemo(() => {
    let result = data;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    if (statusFilter === "active") {
      result = result.filter((u) => u.is_active);
    } else if (statusFilter === "inactive") {
      result = result.filter((u) => !u.is_active);
    } else if (statusFilter === "has_card") {
      result = result.filter((u) => u.is_active && u.uid);
    } else if (statusFilter === "no_card") {
      result = result.filter((u) => u.is_active && !u.uid);
    }
    if (sortDir) {
      result = [...result].sort((a, b) => {
        const aVal = a[sortKey]; const bVal = b[sortKey];
        if (typeof aVal === "boolean") return sortDir === "asc" ? (aVal ? 1 : -1) - (bVal ? 1 : -1) : (bVal ? 1 : -1) - (aVal ? 1 : -1);
        return sortDir === "asc"
          ? String(aVal ?? "").localeCompare(String(bVal ?? ""))
          : String(bVal ?? "").localeCompare(String(aVal ?? ""));
      });
    }
    return result;
  }, [data, search, statusFilter, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir(sortDir === null ? "asc" : sortDir === "asc" ? "desc" : null);
    else { setSortKey(key); setSortDir("asc"); }
  };

  const openDetail = (user: UserWithIsActive) => {
    setDetailUser(user);
    setShowEditForm(false);
    setEditForm({ name: user.name, email: user.email, role: user.role });
  };

  const openUidModal = async (userId: string) => {
    setUidModalOpen(true);
    setCardsLoading(true);
    const cards = await getCardsByProfile(userId);
    setUserCards(cards);
    setCardsLoading(false);
  };

  const handleEditUidOpen = (card: CardWithVehicle) => {
    setEditUidCard(card);
    setEditUidForm({ balance: String(card.balance ?? 0), status: card.status });
  };

  const handleEditUidSave = async () => {
    if (!editUidCard || !editUidCard.id) return;
    setMutLoading(true);
    const { error } = await updateCard({
      p_card_id: editUidCard.id,
      p_balance: Number(editUidForm.balance),
      p_status: editUidForm.status,
    });
    if (!error) {
      toast("UID berhasil diperbarui", "success");
      setEditUidCard(null);
      if (uidModalOpen && detailUser) {
        const cards = await getCardsByProfile(detailUser.id);
        setUserCards(cards);
      }
    } else {
      toast("Gagal memperbarui UID", "error");
    }
    setMutLoading(false);
  };

  const handleDeleteUid = async () => {
    if (!deleteUidCardId) return;
    setMutLoading(true);
    const { error } = await deleteCard(deleteUidCardId);
    if (!error) {
      toast("UID berhasil dihapus", "success");
      setDeleteUidCardId(null);
      if (detailUser) {
        const cards = await getCardsByProfile(detailUser.id);
        setUserCards(cards);
      }
      fetchData();
    } else {
      toast("Gagal menghapus UID", "error");
    }
    setMutLoading(false);
  };

  const handleEditClick = () => {
    if (!detailUser) return;
    setShowEditForm(true);
  };

  const handleEditBack = () => {
    if (showConfirmEdit) {
      setShowConfirmEdit(false);
      return;
    }
    if (showEditForm) {
      setShowEditForm(false);
      setEditForm({ name: detailUser!.name, email: detailUser!.email, role: detailUser!.role });
      return;
    }
    setDetailUser(null);
  };

  const handleEditSubmit = () => {
    if (!detailUser) return;
    const changes: string[] = [];
    if (editForm.name !== detailUser.name) changes.push(`Nama: ${detailUser.name} → ${editForm.name}`);
    if (editForm.email !== detailUser.email) changes.push(`Email: ${detailUser.email} → ${editForm.email}`);
    if (editForm.role !== detailUser.role) changes.push(`Role: ${detailUser.role} → ${editForm.role}`);
    if (changes.length === 0) {
      toast("Tidak ada perubahan yang dilakukan", "info");
      setShowEditForm(false);
      return;
    }
    setShowConfirmEdit(true);
  };

  const handleEditConfirm = async () => {
    if (!detailUser) return;
    setMutLoading(true);
    const updates: { name?: string; email?: string; role?: string } = {};
    if (editForm.name !== detailUser.name) updates.name = editForm.name;
    if (editForm.email !== detailUser.email) updates.email = editForm.email;
    if (editForm.role !== detailUser.role) updates.role = editForm.role;
    const { error } = await updateProfile(detailUser.id, updates);
    if (!error) {
      toast("Profil berhasil diperbarui", "success");
      setShowConfirmEdit(false);
      setShowEditForm(false);
      setDetailUser((prev) => prev ? { ...prev, ...updates, name: editForm.name, email: editForm.email, role: editForm.role } as UserWithIsActive : null);
      setData((prev) => prev.map((u) => u.id === detailUser.id ? { ...u, ...updates } : u));
    } else {
      toast("Gagal memperbarui profil", "error");
    }
    setMutLoading(false);
  };

  const handleToggleAccount = async () => {
    if (!toggleUser) return;
    if (toggleUser.id === currentProfile?.id) {
      toast("Tidak dapat memproses akun sendiri", "error");
      setToggleUser(null);
      return;
    }
    const action = toggleUser.is_active ? "deactivate" : "activate";
    setMutLoading(true);
    try {
      const res = await fetch("/api/auth/users/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: toggleUser.id, action }),
      });
      const json = await res.json();
      if (json.success) {
        toast(`Akun ${action === "deactivate" ? "dinonaktifkan" : "diaktifkan"}`, "success");
        setData((prev) => prev.map((u) => u.id === toggleUser.id ? { ...u, is_active: !toggleUser.is_active } : u));
        setDetailUser((prev) => prev?.id === toggleUser.id ? { ...prev, is_active: !toggleUser.is_active } : prev);
        setToggleUser(null);
      } else {
        toast(json.error || "Gagal mengubah status", "error");
      }
    } catch {
      toast("Gagal menghubungi server", "error");
    }
    setMutLoading(false);
  };

  const handleDeleteUser = async () => {
    if (!deleteUser) return;
    if (deleteUser.id === currentProfile?.id) {
      toast("Tidak dapat menghapus akun sendiri", "error");
      setDeleteUser(null);
      return;
    }
    setMutLoading(true);
    const { error } = await deleteUserFull(deleteUser.id);
    if (!error) {
      toast(`${deleteUser.name} berhasil dihapus`, "success");
      setData((prev) => prev.filter((u) => u.id !== deleteUser.id));
      setDetailUser(null);
      setDeleteUser(null);
    } else {
      toast("Gagal menghapus pengguna", "error");
    }
    setMutLoading(false);
  };

  const handleAddUser = async () => {
    if (!addForm.name || !addForm.email || !addForm.password) {
      toast("Nama, email, dan password harus diisi", "error");
      return;
    }
    if (addForm.password.length < 6) {
      toast("Password minimal 6 karakter", "error");
      return;
    }
    if (addForm.password !== addForm.confirmPassword) {
      toast("Password dan konfirmasi password tidak cocok", "error");
      return;
    }
    setAddLoading(true);
    try {
      const res = await fetch("/api/auth/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: addForm.name,
          email: addForm.email,
          password: addForm.password,
          role: addForm.role,
          uid: addForm.uid || undefined,
          plate_number: addForm.plate_number || undefined,
          vehicle_type: addForm.vehicle_type ? (addForm.vehicle_type as string) : undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast("Pengguna berhasil ditambahkan", "success");
        setShowAddModal(false);
        setAddForm({ name: "", email: "", password: "", confirmPassword: "", role: "USER", uid: "", plate_number: "", vehicle_type: "CAR" });
        fetchData();
      } else {
        toast(json.error || "Gagal menambahkan pengguna", "error");
      }
    } catch {
      toast("Gagal menghubungi server", "error");
    }
    setAddLoading(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/manajemen-akses")}
            className="p-1.5 text-muted-foreground hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
            title="Kembali"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="border-l border-border pl-3">
            <h1 className="text-xl font-bold text-foreground">Pengguna</h1>
            <p className="text-sm text-muted-foreground">Daftar seluruh pengguna terdaftar</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 rounded-lg bg-accent text-accent-foreground text-xs font-medium hover:bg-accent/90 transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah Pengguna
          </button>
          <div className="flex bg-muted/50 rounded-lg p-0.5 border border-border">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              title="Tampilan Kartu"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md transition-colors ${viewMode === "table" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              title="Tampilan Tabel"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {viewMode === "table" && (
        <div className="flex items-center gap-4 text-[11px] text-muted-foreground px-1">
          <span className="inline-flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-accent" /> Detail
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Ban className="w-3.5 h-3.5 text-danger" /> Nonaktifkan
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Trash2 className="w-3.5 h-3.5 text-muted-foreground" /> Hapus
          </span>
        </div>
      )}

      <div className="flex gap-3 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari nama atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-card border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all cursor-pointer"
        >
          <option value="all">Semua</option>
          <option value="active">Aktif</option>
          <option value="inactive">Nonaktif</option>
          <option value="has_card">Memiliki Kartu</option>
          <option value="no_card">Tanpa Kartu</option>
        </select>
      </div>

      {loading ? (
        <SkeletonTable rows={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Users className="w-8 h-8 text-accent" />}
          title={search ? "Tidak ada hasil pencarian" : "Belum ada pengguna"}
          description={search ? "Coba gunakan kata kunci lain" : "Belum ada pengguna yang terdaftar"}
        />
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((user, i) => (
            <div key={user.id} style={{ animationDelay: `${i * 30}ms` }}>
              <UserCard user={user} onDetail={openDetail} />
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl bg-card border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-primary/5 via-accent/5 to-transparent border-b-2 border-accent/20">
                  {COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      className={`px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer select-none transition-colors hover:text-foreground ${sortKey === col.key ? "text-accent" : "text-muted-foreground"}`}
                    >
                      <div className="flex items-center gap-1.5">
                        {col.label}
                        <SortIcon active={sortKey === col.key} dir={sortDir} />
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody key={`${sortKey}-${sortDir}`} className="divide-y divide-border/30">
                {filtered.length > 0 ? filtered.map((user, i) => (
                  <tr
                    key={user.id}
                    className="group hover:bg-muted/20 transition-all duration-150 even:bg-muted/5 opacity-0 animate-[fadeIn_0.3s_ease-out_forwards]"
                    style={{ animationDelay: `${i * 25}ms` }}
                  >
                    <td className="px-4 py-3.5 font-medium text-foreground">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-xs font-bold text-primary">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span>{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">{user.email}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${user.role === "ADMIN" ? "bg-accent/15 text-accent border border-accent/20" : "bg-muted/50 text-muted-foreground border border-border/50"}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${getStatusInfo(user).color}`}>
                        <span className={`w-2 h-2 rounded-full ${getStatusInfo(user).dot}`} />
                        {getStatusInfo(user).label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex justify-end gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openDetail(user)}
                          className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-all"
                          title="Detail Pengguna"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setToggleUser(user); }}
                          disabled={user.id === currentProfile?.id}
                          className={`p-2 rounded-lg transition-all ${user.id === currentProfile?.id ? "text-muted-foreground/30 cursor-not-allowed" : user.is_active ? "text-danger hover:bg-danger/10" : "text-success hover:bg-success/10"}`}
                          title={user.id === currentProfile?.id ? "Tidak dapat memproses akun sendiri" : user.is_active ? "Nonaktifkan" : "Aktifkan"}
                        >
                          {user.is_active ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => { setDeleteUser(user); }}
                          disabled={user.id === currentProfile?.id}
                          className={`p-2 rounded-lg transition-all ${user.id === currentProfile?.id ? "text-muted-foreground/30 cursor-not-allowed" : "text-muted-foreground hover:text-danger hover:bg-danger/10"}`}
                          title={user.id === currentProfile?.id ? "Tidak dapat menghapus akun sendiri" : "Hapus"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-sm">Tidak ada hasil untuk pencarian ini</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailUser && !showEditForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out] p-4">
          <div className="bg-card border border-border shadow-2xl rounded-xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <User className="w-4 h-4 text-accent" />
                Detail Pengguna
              </h3>
              <button onClick={() => { setDetailUser(null); setShowResetPw(false); setResetPassword(""); setResetConfirmPassword(""); }} className="p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-lg font-bold text-primary shrink-0">
                  {detailUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h4 className="text-base font-semibold text-foreground">{detailUser.name}</h4>
                  <p className="text-sm text-muted-foreground">{detailUser.email}</p>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium mt-1 ${getStatusInfo(detailUser).color}`}>
                    <span className={`w-2 h-2 rounded-full ${getStatusInfo(detailUser).dot}`} />
                    {getStatusInfo(detailUser).label}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-1">Role</p>
                  <span className={`text-xs font-bold ${detailUser.role === "ADMIN" ? "text-accent" : "text-foreground"}`}>
                    {detailUser.role === "ADMIN" ? "Admin" : "User"}
                  </span>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-1">Status Akun</p>
                  <span className={`text-xs font-bold ${detailUser.is_active ? "text-success" : "text-danger"}`}>
                    {detailUser.is_active ? "Aktif" : "Nonaktif"}
                  </span>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-1">Kartu UID</p>
                  <span className="text-xs font-bold text-foreground">{detailUser.uid ? "Memiliki Kartu" : "Tidak Ada"}</span>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-1">Saldo</p>
                  <span className="text-xs font-bold text-foreground">
                    Rp {(detailUser.balance ?? 0).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {detailUser.plate_number && (
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-1">Kendaraan</p>
                  <p className="text-xs font-medium text-foreground">
                    {detailUser.plate_number}
                    {detailUser.vehicle_type && ` (${detailUser.vehicle_type})`}
                  </p>
                </div>
              )}

              <div className="border-t border-border pt-3">
                {!showResetPw ? (
                  <button
                    onClick={() => { setShowResetPw(true); setResetPassword(""); setResetConfirmPassword(""); }}
                    className="w-full px-3 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted/50 transition-colors inline-flex items-center justify-center gap-1.5"
                  >
                    <Key className="w-3.5 h-3.5" />
                    Reset Password
                  </button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Reset Password</p>
                    <div>
                      <label className="block text-[11px] text-muted-foreground mb-1">Password Baru</label>
                      <div className="relative">
                        <input type={showResetPwInput ? "text" : "password"} value={resetPassword}
                          onChange={(e) => setResetPassword(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all pr-12" placeholder="Minimal 6 karakter" />
                        <button type="button" onClick={() => setShowResetPwInput(!showResetPwInput)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
                          {showResetPwInput ? "Sembunyi" : "Lihat"}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] text-muted-foreground mb-1">Konfirmasi Password</label>
                      <input type={showResetPwInput ? "text" : "password"} value={resetConfirmPassword}
                        onChange={(e) => setResetConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all" placeholder="Ulangi password" />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowResetPw(false)}
                        disabled={resetLoading}
                        className="flex-1 px-3 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted/50 transition-colors disabled:opacity-50"
                      >
                        Batal
                      </button>
                      <button
                        onClick={async () => {
                          if (!resetPassword || !resetConfirmPassword) {
                            toast("Password dan konfirmasi harus diisi", "error");
                            return;
                          }
                          if (resetPassword.length < 6) {
                            toast("Password minimal 6 karakter", "error");
                            return;
                          }
                          if (resetPassword !== resetConfirmPassword) {
                            toast("Password tidak cocok", "error");
                            return;
                          }
                          setResetLoading(true);
                          try {
                            const res = await fetch("/api/auth/users/reset-password", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ profile_id: detailUser.id, new_password: resetPassword }),
                            });
                            const json = await res.json();
                            if (json.success) {
                              toast("Password berhasil direset", "success");
                              setShowResetPw(false);
                            } else {
                              toast(json.error || "Gagal mereset password", "error");
                            }
                          } catch {
                            toast("Gagal menghubungi server", "error");
                          }
                          setResetLoading(false);
                        }}
                        disabled={resetLoading}
                        className="flex-1 px-3 py-2 rounded-lg bg-accent text-accent-foreground text-xs font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
                      >
                        {resetLoading ? "Menyimpan..." : "Simpan"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between px-5 pb-5 pt-1">
              <div className="flex gap-2">
                <button
                  onClick={() => openUidModal(detailUser.id)}
                  className="px-3 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted/50 transition-colors inline-flex items-center gap-1.5"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  Lihat UID
                </button>
                <button
                  onClick={() => { setToggleUser(detailUser); }}
                  disabled={detailUser.id === currentProfile?.id}
                  className={`px-3 py-2 rounded-lg border text-xs inline-flex items-center gap-1.5 transition-colors ${detailUser.id === currentProfile?.id ? "border-border/30 text-muted-foreground/30 cursor-not-allowed" : detailUser.is_active ? "border-danger/30 text-danger hover:bg-danger/10" : "border-success/30 text-success hover:bg-success/10"}`}
                  title={detailUser.id === currentProfile?.id ? "Tidak dapat memproses akun sendiri" : undefined}
                >
                  {detailUser.is_active ? <Ban className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                  {detailUser.is_active ? "Nonaktifkan" : "Aktifkan"}
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setDetailUser(null); setShowResetPw(false); setResetPassword(""); setResetConfirmPassword(""); }}
                  className="px-3 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted/50 transition-colors"
                >
                  Kembali
                </button>
                <button
                  onClick={handleEditClick}
                  className="px-3 py-2 rounded-lg bg-accent text-accent-foreground text-xs font-medium hover:bg-accent/90 transition-colors inline-flex items-center gap-1.5"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Form Modal */}
      {detailUser && showEditForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out] p-4">
          <div className="bg-card border border-border shadow-2xl rounded-xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Pencil className="w-4 h-4 text-accent" />
                Edit Pengguna
              </h3>
              <button onClick={() => { setShowEditForm(false); setEditForm({ name: detailUser.name, email: detailUser.email, role: detailUser.role }); }}
                className="p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Nama</label>
                <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-background/50 border border-border rounded-lg px-3.5 py-2 text-sm text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email</label>
                <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full bg-background/50 border border-border rounded-lg px-3.5 py-2 text-sm text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Role</label>
                <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full bg-background/50 border border-border rounded-lg px-3.5 py-2 text-sm text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all appearance-none">
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>
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
              {editForm.name !== detailUser?.name && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nama:</span>
                  <span className="text-foreground font-medium">{detailUser?.name} → {editForm.name}</span>
                </div>
              )}
              {editForm.email !== detailUser?.email && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="text-foreground font-medium">{detailUser?.email} → {editForm.email}</span>
                </div>
              )}
              {editForm.role !== detailUser?.role && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Role:</span>
                  <span className="text-foreground font-medium">{detailUser?.role} → {editForm.role}</span>
                </div>
              )}
            </div>
          </div>
        }
        confirmLabel="Konfirmasi"
        variant="info"
        loading={mutLoading}
      />

      {/* UID List Modal */}
      {uidModalOpen && detailUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out] p-4">
          <div className="bg-card border border-border shadow-2xl rounded-xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-accent" />
                UID - {detailUser.name}
              </h3>
              <button onClick={() => { setUidModalOpen(false); setUserCards([]); }} className="p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 max-h-72 overflow-y-auto space-y-3">
              {cardsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <span className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                </div>
              ) : userCards.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">Pengguna ini belum memiliki kartu UID</p>
              ) : (
                userCards.map((card) => (
                  <div key={card.id} className="bg-muted/30 rounded-lg p-3 border border-border/50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-foreground">{card.uid}</span>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${card.status === "ACTIVE" ? "text-success" : card.status === "BLOCKED" ? "text-danger" : "text-warning"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${card.status === "ACTIVE" ? "bg-success" : card.status === "BLOCKED" ? "bg-danger" : "bg-warning"}`} />
                          {card.status === "ACTIVE" ? "Aktif" : card.status === "BLOCKED" ? "Diblokir" : "Hilang"}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-foreground">Rp {(card.balance ?? 0).toLocaleString("id-ID")}</span>
                    </div>
                    {card.plate_number && (
                      <p className="text-[11px] text-muted-foreground mb-2">
                        {card.plate_number} {card.vehicle_type && `(${card.vehicle_type})`}
                      </p>
                    )}
                    <div className="flex gap-1.5 justify-end">
                      <button
                        onClick={() => handleEditUidOpen(card)}
                        className="px-2.5 py-1.5 rounded-md border border-border text-[11px] text-muted-foreground hover:bg-accent/10 hover:text-accent hover:border-accent/30 transition-colors inline-flex items-center gap-1"
                      >
                        <Pencil className="w-3 h-3" /> Edit
                      </button>
                      <button
                        onClick={() => setDeleteUidCardId(card.id)}
                        className="px-2.5 py-1.5 rounded-md border border-border text-[11px] text-danger hover:bg-danger/10 hover:border-danger/30 transition-colors inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Hapus
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end px-5 pb-5 pt-1">
              <button onClick={() => { setUidModalOpen(false); setUserCards([]); }}
                className="px-4 py-2 rounded-lg bg-accent text-accent-foreground text-xs font-medium hover:bg-accent/90 transition-colors">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit UID Modal */}
      {editUidCard && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out] p-4">
          <div className="bg-card border border-border shadow-2xl rounded-xl w-full max-w-sm animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Pencil className="w-4 h-4 text-accent" /> Edit UID
              </h3>
              <button onClick={() => setEditUidCard(null)} className="p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5">
              <p className="text-xs text-muted-foreground mb-4 bg-muted/30 px-3 py-2 rounded-lg font-mono">
                UID: <span className="text-foreground font-semibold">{editUidCard.uid}</span>
              </p>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Saldo (Rp)</label>
                  <input type="number" value={editUidForm.balance} onChange={(e) => setEditUidForm({ ...editUidForm, balance: e.target.value })}
                    className="w-full bg-background/50 border border-border rounded-lg px-3.5 py-2 text-sm text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all" min="0" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Status</label>
                  <select value={editUidForm.status} onChange={(e) => setEditUidForm({ ...editUidForm, status: e.target.value })}
                    className="w-full bg-background/50 border border-border rounded-lg px-3.5 py-2 text-sm text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all appearance-none">
                    <option value="ACTIVE">Aktif</option>
                    <option value="BLOCKED">Diblokir</option>
                    <option value="LOST">Hilang</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-end px-5 pb-5">
              <button onClick={() => setEditUidCard(null)}
                className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted/50 transition-colors">Batal</button>
              <button onClick={handleEditUidSave} disabled={mutLoading}
                className="px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 inline-flex items-center gap-1.5">
                {mutLoading ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete UID Confirmation */}
      <ConfirmModal
        isOpen={!!deleteUidCardId}
        onClose={() => setDeleteUidCardId(null)}
        onConfirm={handleDeleteUid}
        title="Hapus UID"
        description="Apakah Anda yakin ingin menghapus kartu UID ini? Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Hapus Permanen"
        cancelLabel="Batalkan"
        variant="danger"
        loading={mutLoading}
      />

      {/* Toggle Account Confirmation */}
      <ConfirmModal
        isOpen={!!toggleUser}
        onClose={() => setToggleUser(null)}
        onConfirm={handleToggleAccount}
        title={toggleUser?.is_active ? "Nonaktifkan Pengguna" : "Aktifkan Pengguna"}
        description={
          toggleUser ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {toggleUser.is_active
                  ? "Apakah Anda yakin ingin menonaktifkan pengguna berikut?"
                  : "Apakah Anda yakin ingin mengaktifkan kembali pengguna berikut?"}
              </p>
              <div className="bg-muted/30 rounded-lg p-3 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Nama:</span>
                  <span className="text-foreground font-medium">{toggleUser.name}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="text-foreground font-medium">{toggleUser.email}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Status Saat Ini:</span>
                  <span className={`font-medium ${toggleUser.is_active ? "text-success" : "text-danger"}`}>
                    {toggleUser.is_active ? "Aktif" : "Nonaktif"}
                  </span>
                </div>
              </div>
            </div>
          ) : undefined
        }
        confirmLabel={toggleUser?.is_active ? "Nonaktifkan" : "Aktifkan"}
        cancelLabel="Batal"
        variant={toggleUser?.is_active ? "warning" : "info"}
        loading={mutLoading}
      />

      {/* Delete User Confirmation */}
      <ConfirmModal
        isOpen={!!deleteUser}
        onClose={() => setDeleteUser(null)}
        onConfirm={handleDeleteUser}
        title="Hapus Pengguna"
        description={
          deleteUser ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Apakah Anda yakin ingin menghapus pengguna berikut secara permanen? Semua data terkait (kartu UID, kendaraan, transaksi) akan ikut terhapus.
              </p>
              <div className="bg-muted/30 rounded-lg p-3 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Nama:</span>
                  <span className="text-foreground font-medium">{deleteUser.name}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="text-foreground font-medium">{deleteUser.email}</span>
                </div>
                {deleteUser.uid && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">UID:</span>
                    <span className="font-mono text-foreground font-medium">{deleteUser.uid}</span>
                  </div>
                )}
              </div>
            </div>
          ) : undefined
        }
        confirmLabel="Hapus Permanen"
        cancelLabel="Batalkan"
        variant="danger"
        loading={mutLoading}
      />

      {/* Tambah Pengguna Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out] p-4">
          <div className="bg-card border border-border shadow-2xl rounded-xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Plus className="w-4 h-4 text-accent" />
                Tambah Pengguna
              </h3>
              <button
                onClick={() => { setShowAddModal(false); setAddForm({ name: "", email: "", password: "", confirmPassword: "", role: "USER", uid: "", plate_number: "", vehicle_type: "CAR" }); }}
                className="p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Nama</label>
                <input type="text" value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all" placeholder="Nama lengkap" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email</label>
                <input type="email" value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all" placeholder="email@example.com" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Password</label>
                <div className="relative">
                  <input type={showAddPassword ? "text" : "password"} value={addForm.password} onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all pr-10" placeholder="Minimal 6 karakter" />
                  <button type="button" onClick={() => setShowAddPassword(!showAddPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground transition-colors px-1 py-0.5 rounded">
                    {showAddPassword ? "Sembunyi" : "Lihat"}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Konfirmasi Password</label>
                <input type={showAddPassword ? "text" : "password"} value={addForm.confirmPassword} onChange={(e) => setAddForm({ ...addForm, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all" placeholder="Ulangi password" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Role</label>
                <select value={addForm.role} onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all">
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">UID Kartu <span className="text-muted-foreground/50 font-normal">(opsional)</span></label>
                <input type="text" value={addForm.uid} onChange={(e) => setAddForm({ ...addForm, uid: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all" placeholder="UID kartu" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Plat Nomor <span className="text-muted-foreground/50 font-normal">(opsional)</span></label>
                <input type="text" value={addForm.plate_number} onChange={(e) => setAddForm({ ...addForm, plate_number: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all" placeholder="Contoh: B 1234 XYZ" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Tipe Kendaraan <span className="text-muted-foreground/50 font-normal">(opsional)</span></label>
                <select value={addForm.vehicle_type} onChange={(e) => setAddForm({ ...addForm, vehicle_type: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all">
                  <option value="CAR">Mobil</option>
                  <option value="PICKUP">Pickup</option>
                  <option value="MINIBUS">Minibus</option>
                  <option value="BUS">Bus</option>
                  <option value="LIGHT_TRUCK">Truck Ringan</option>
                  <option value="HEAVY_TRUCK">Truck Berat</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-5 py-3.5 border-t border-border">
              <button
                onClick={() => { setShowAddModal(false); setAddForm({ name: "", email: "", password: "", confirmPassword: "", role: "USER", uid: "", plate_number: "", vehicle_type: "CAR" }); }}
                className="px-4 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted/50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleAddUser}
                disabled={addLoading}
                className="px-4 py-2 rounded-lg bg-accent text-accent-foreground text-xs font-medium hover:bg-accent/90 transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
              >
                {addLoading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inline detail modal toggle/delete buttons (for table view) */}
    </div>
  );
}
