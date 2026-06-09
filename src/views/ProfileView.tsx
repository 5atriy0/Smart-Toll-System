'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Mail, FileText, Shield, Calendar, Edit3, Save, X, Loader2,
  CreditCard, Car, Search, History, Download, ArrowLeft, ArrowRight,
  Activity, Plus, Trash2, Lock, Eye, EyeOff,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { updateProfile } from '@/services/profileService'
import { updateCard, updateVehicle } from '@/services/cardService'
import { useToast } from '@/contexts/ToastContext'
import { createClient } from '@/lib/supabase/client'
import { SkeletonTable } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import type { Profile, CardWithVehicle, VwTransactionDetails } from '@/lib/types/supabase'

const DATE_RANGES = ['Hari Ini', '7 Hari Terakhir', 'Bulan Ini', 'Semua Waktu']
const PAGE_SIZE = 10
const VEHICLE_TYPES = [
  { value: 'CAR', label: 'Mobil' },
  { value: 'PICKUP', label: 'Pickup' },
  { value: 'MINIBUS', label: 'Minibus' },
  { value: 'BUS', label: 'Bus' },
  { value: 'LIGHT_TRUCK', label: 'Truk Ringan' },
  { value: 'HEAVY_TRUCK', label: 'Truk Berat' },
]

function computeDateFrom(range: string): string | undefined {
  const now = new Date()
  if (range === 'Hari Ini') return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  if (range === '7 Hari Terakhir') { const d = new Date(); d.setDate(now.getDate() - 7); return d.toISOString() }
  if (range === 'Bulan Ini') return new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  return undefined
}

function StatusDot({ status }: { status: string }) {
  const c: Record<string, string> = { ACTIVE: 'text-success', BLOCKED: 'text-danger', LOST: 'text-muted-foreground' }
  const l: Record<string, string> = { ACTIVE: 'Aktif', BLOCKED: 'Diblokir', LOST: 'Hilang' }
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${c[status] || 'text-muted-foreground'}`}>
      <span className={`w-2 h-2 rounded-full ${(c[status] || 'text-muted-foreground').replace('text-', 'bg-')}`} />
      {l[status] || status}
    </span>
  )
}

function relativeTime(date: Date | null): string {
  if (!date) return '-'
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Baru saja'
  if (mins < 60) return `${mins} mnt lalu`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} jam lalu`
  const days = Math.floor(hours / 24)
  return `${days} hari lalu`
}

const statusLabel = (s: string) => s === 'COMPLETED' ? 'SELESAI' : s === 'IN_PROGRESS' ? 'DI PERJALANAN' : s
const statusStyle = (s: string) => {
  if (s === 'COMPLETED') return 'border-success/30 text-success bg-success/5'
  if (s === 'IN_PROGRESS') return 'border-accent/30 text-accent bg-accent/5'
  return 'border-border text-muted-foreground bg-muted/30'
}

export function ProfileView() {
  const { user, profile, refreshProfile, signOut } = useAuth()
  const { toast } = useToast()
  const supabase = createClient()
  const isUser = profile?.role === 'USER'

  // ── Profile fetch langsung dari tabel ──
  const [dbProfile, setDbProfile] = useState<Profile | null>(null)

  // ── Edit profile state ──
  const [showEditModal, setShowEditModal] = useState(false)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  // ── Password state ──
  const [showPassword, setShowPassword] = useState(false)
  const [pwNew, setPwNew] = useState('')
  const [pwConfirm, setPwConfirm] = useState('')
  const [pwSaving, setPwSaving] = useState(false)
  const [pwError, setPwError] = useState<string | null>(null)
  const [pwVisible, setPwVisible] = useState(false)

  // ── Cards state ──
  const [cards, setCards] = useState<any[]>([])
  const [cardsLoading, setCardsLoading] = useState(true)

  // Edit card
  const [editCard, setEditCard] = useState<any | null>(null)
  const [editCardForm, setEditCardForm] = useState({ uid: '', balance: '0', status: 'ACTIVE', plate_number: '', vehicle_type: 'CAR' })
  const [editCardLoading, setEditCardLoading] = useState(false)

  // Delete card
  const [deleteCard, setDeleteCard] = useState<{ id: string; uid: string; vehicle_id: string | null } | null>(null)
  const [deleteCardLoading, setDeleteCardLoading] = useState(false)
  const [deleteCardError, setDeleteCardError] = useState('')

  // Add card
  const [showAddCard, setShowAddCard] = useState(false)
  const [addCardForm, setAddCardForm] = useState({ uid: '', plate_number: '', vehicle_type: 'CAR' })
  const [addCardLoading, setAddCardLoading] = useState(false)
  const [addCardError, setAddCardError] = useState('')

  // ── Transaction state ──
  const [txData, setTxData] = useState<VwTransactionDetails[]>([])
  const [txTotal, setTxTotal] = useState(0)
  const [txLoading, setTxLoading] = useState(true)
  const [txPage, setTxPage] = useState(0)
  const [txSearch, setTxSearch] = useState('')
  const [txRange, setTxRange] = useState('Semua Waktu')

  const joined = dbProfile?.created_at
    ? new Date(dbProfile.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
    : '-'

  // ── Fetch fresh profile from table ──
  useEffect(() => {
    if (!profile?.id) return
    supabase.from('profiles').select('*').eq('id', profile.id).single().then(({ data }) => {
      if (data) setDbProfile(data as Profile)
    })
  }, [profile?.id])

  // ── Fetch cards ──
  const fetchCards = useCallback(async () => {
    if (!profile?.id) return
    setCardsLoading(true)
    const { data } = await supabase
      .from('cards')
      .select('*, vehicle:vehicles(plate_number, vehicle_type, id)')
      .eq('profile_id', profile.id)
    if (data) {
      setCards(data.map((c: any) => ({
        id: c.id,
        uid: c.uid,
        balance: c.balance,
        status: c.status,
        vehicle_id: c.vehicle_id,
        plate_number: c.vehicle?.plate_number ?? null,
        vehicle_type: c.vehicle?.vehicle_type ?? null,
      })))
    }
    setCardsLoading(false)
  }, [profile?.id])

  useEffect(() => { fetchCards() }, [fetchCards])

  // ── Edit Profile ──
  const openEdit = () => {
    setEditName(profile?.name || '')
    setEditEmail(profile?.email || '')
    setEditError(null)
    setShowEditModal(true)
  }

  const handleEditSave = async () => {
    if (!user) return
    if (!editName.trim()) { setEditError('Nama tidak boleh kosong'); return }
    if (!editEmail.trim()) { setEditError('Email tidak boleh kosong'); return }
    setSaving(true); setEditError(null)
    const { error: err } = await updateProfile(user.id, { name: editName.trim(), email: editEmail.trim() })
    if (err) { setEditError(err.message); setSaving(false); return }
    await refreshProfile()
    // Refresh local dbProfile too
    const { data } = await supabase.from('profiles').select('*').eq('id', profile?.id).single()
    if (data) setDbProfile(data as Profile)
    setSaving(false)
    setShowEditModal(false)
    toast('Profil berhasil diperbarui', 'success')
  }

  // ── Ubah Password ──
  const handlePasswordSave = async () => {
    if (!pwNew.trim()) { setPwError('Password baru tidak boleh kosong'); return }
    if (pwNew.length < 6) { setPwError('Password minimal 6 karakter'); return }
    if (pwNew !== pwConfirm) { setPwError('Konfirmasi password tidak cocok'); return }
    setPwSaving(true); setPwError(null)
    const { error } = await supabase.auth.updateUser({ password: pwNew })
    if (error) { setPwError(error.message); setPwSaving(false); return }
    setPwSaving(false)
    setPwNew(''); setPwConfirm('')
    setShowPassword(false)
    toast('Password berhasil diubah', 'success')
  }

  // ── Edit Card ──
  const openEditCard = (card: any) => {
    setEditCard(card)
    setEditCardForm({
      uid: card.uid,
      balance: String(card.balance ?? 0),
      status: card.status,
      plate_number: card.plate_number || '',
      vehicle_type: card.vehicle_type || 'CAR',
    })
  }

  const handleEditCardSave = async () => {
    if (!editCard) return
    setEditCardLoading(true)
    const params: Record<string, unknown> = { p_card_id: editCard.id }
    if (editCardForm.uid !== editCard.uid) params.p_uid = editCardForm.uid
    if (Number(editCardForm.balance) !== editCard.balance) params.p_balance = Number(editCardForm.balance)
    if (editCardForm.status !== editCard.status) params.p_status = editCardForm.status

    if (Object.keys(params).length > 1) {
      const { error } = await updateCard(params as any)
      if (error) { toast('Gagal memperbarui kartu', 'error'); setEditCardLoading(false); return }
    }

    if (editCard.vehicle_id && (editCardForm.plate_number !== (editCard.plate_number || '') || editCardForm.vehicle_type !== (editCard.vehicle_type || 'CAR'))) {
      const { error: vErr } = await updateVehicle(editCard.vehicle_id, {
        plate_number: editCardForm.plate_number,
        vehicle_type: editCardForm.vehicle_type,
      })
      if (vErr) { toast('Gagal memperbarui kendaraan', 'error'); setEditCardLoading(false); return }
    }

    setEditCard(null)
    setEditCardLoading(false)
    toast('Kartu berhasil diperbarui', 'success')
    fetchCards()
  }

  // ── Delete Card ──
  const handleDeleteCard = async () => {
    if (!deleteCard) return
    setDeleteCardLoading(true); setDeleteCardError('')
    try {
      const res = await fetch('/api/user/delete-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_id: profile?.id, uid: deleteCard.uid, vehicle_id: deleteCard.vehicle_id }),
      })
      const data = await res.json()
      if (!res.ok || data.error) { setDeleteCardError(data.error || 'Gagal menghapus kartu'); setDeleteCardLoading(false); return }
      setDeleteCard(null)
      toast('Kartu berhasil dihapus', 'success')
      fetchCards()
    } catch {
      setDeleteCardError('Terjadi kesalahan pada server')
    }
    setDeleteCardLoading(false)
  }

  // ── Add Card ──
  const handleAddCard = async () => {
    if (!addCardForm.uid || !addCardForm.plate_number) { setAddCardError('UID dan plat nomor wajib diisi'); return }
    setAddCardLoading(true); setAddCardError('')
    try {
      const res = await fetch('/api/user/add-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_id: profile?.id, ...addCardForm }),
      })
      const data = await res.json()
      if (!res.ok || data.error) { setAddCardError(data.error || 'Gagal menambahkan kartu'); setAddCardLoading(false); return }
      setShowAddCard(false)
      setAddCardForm({ uid: '', plate_number: '', vehicle_type: 'CAR' })
      toast('Kartu berhasil ditambahkan', 'success')
      fetchCards()
    } catch {
      setAddCardError('Terjadi kesalahan pada server')
    }
    setAddCardLoading(false)
  }

  // ── Fetch Transactions ──
  const fetchTx = useCallback(async () => {
    if (!profile?.id) return
    setTxLoading(true)
    let q = supabase.from('vw_transaction_details').select('*', { count: 'exact' }).eq('profile_id', profile.id)
    const df = computeDateFrom(txRange)
    if (df) q = q.gte('tap_in_time', df)
    if (txSearch.trim()) {
      const s = `%${txSearch.trim()}%`
      q = q.or(`gate_in_name.ilike.${s},gate_out_name.ilike.${s},plate_number.ilike.${s},uid.ilike.${s}`)
    }
    const { data, count } = await q.order('tap_in_time', { ascending: false }).range(txPage * PAGE_SIZE, (txPage + 1) * PAGE_SIZE - 1)
    if (data) setTxData(data as VwTransactionDetails[])
    if (count !== null) setTxTotal(count)
    setTxLoading(false)
  }, [profile?.id, txRange, txSearch, txPage])

  useEffect(() => { fetchTx() }, [fetchTx])
  useEffect(() => { setTxPage(0) }, [txSearch, txRange])

  const totalPages = Math.max(1, Math.ceil(txTotal / PAGE_SIZE))

  // ── Export CSV ──
  const handleExportCSV = () => {
    if (txData.length === 0) { toast('Tidak ada data untuk diexport', 'info'); return }
    const headers = ['ID', 'UID', 'Plat', 'Gate Masuk', 'Gate Keluar', 'Tap In', 'Tap Out', 'Durasi (menit)', 'Kecepatan (km/h)', 'Jarak (km)', 'Tarif', 'Status']
    const rows = txData.map((tx) => [
      tx.id, tx.uid, tx.plate_number, tx.gate_in_name, tx.gate_out_name || '',
      tx.tap_in_time, tx.tap_out_time || '',
      tx.duration_minutes ?? '', tx.average_speed ?? '', tx.distance_km ?? '',
      tx.fee ?? '', tx.status,
    ])
    const csv = ['\uFEFF' + headers.join(','),
      ...rows.map((r) => r.map((c) => {
        const s = String(c ?? ''); return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s
      }).join(',')),
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
    a.download = `riwayat_transaksi_${profile?.name || 'user'}_${new Date().toISOString().slice(0, 10)}.csv`
    a.click(); URL.revokeObjectURL(blob)
    toast('Data berhasil diunduh', 'success')
  }

  return (
    <div className="space-y-6">
      {/* ═══ Profile Overview ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="border-border shadow-sm overflow-hidden" style={{ borderLeft: '3px solid hsl(var(--accent))' }}>
            <CardHeader className="pb-4">
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-full flex items-center justify-center border-4 border-accent/20"
                  style={{ backgroundColor: 'hsl(var(--primary))' }}>
                  <span className="text-3xl font-bold text-white">
                    {(dbProfile?.name || user?.email || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-center">
                  <h2 className="text-lg font-bold text-foreground">{dbProfile?.name || user?.email?.split('@')[0] || 'User'}</h2>
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
                    <span className="w-2 h-2 rounded-full bg-success" />
                    {dbProfile?.role === 'ADMIN' ? 'Administrator' : 'Pengguna'}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Shield className="w-4 h-4 text-success" /> Status
                  </span>
                  <span className="text-sm font-bold text-success">{dbProfile?.is_active !== false ? 'Aktif' : 'Nonaktif'}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/30 border border-border text-center">
                  <p className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
                    <Calendar className="w-3 h-3" /> Bergabung
                  </p>
                  <p className="text-sm font-bold text-foreground">{joined}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-border text-center">
                  <p className="text-xs text-muted-foreground mb-1">Role</p>
                  <p className="text-sm font-bold text-primary">{dbProfile?.role === 'ADMIN' ? 'Admin' : 'User'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {/* Informasi Akun */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-accent" />
                  Informasi Akun
                </CardTitle>
                <button onClick={openEdit}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-colors"
                  style={{ backgroundColor: 'hsl(var(--sidebar-active))' }}>
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Nama</label>
                  <p className="text-foreground font-medium">{dbProfile?.name || user?.email?.split('@')[0] || 'User'}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Email</label>
                  <p className="text-foreground font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />
                    {dbProfile?.email || user?.email || '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ubah Password */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-accent" />
                  Ubah Password
                </CardTitle>
                <button onClick={() => { setShowPassword(!showPassword); setPwError(null); setPwNew(''); setPwConfirm(''); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground border border-border hover:bg-muted transition-colors">
                  {showPassword ? 'Batal' : 'Ubah'}
                </button>
              </div>
            </CardHeader>
            {showPassword && (
              <CardContent>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Password Baru</label>
                    <div className="relative">
                      <input type={pwVisible ? 'text' : 'password'} value={pwNew}
                        onChange={(e) => setPwNew(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all pr-9"
                        placeholder="Minimal 6 karakter" />
                      <button type="button" onClick={() => setPwVisible(!pwVisible)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {pwVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Konfirmasi Password Baru</label>
                    <input type={pwVisible ? 'text' : 'password'} value={pwConfirm}
                      onChange={(e) => setPwConfirm(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                      placeholder="Ulangi password baru" />
                  </div>
                  {pwError && <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{pwError}</p>}
                  <div className="flex gap-3">
                    <button onClick={() => { setShowPassword(false); setPwError(null); setPwNew(''); setPwConfirm(''); }}
                      className="px-4 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted/50 transition-colors">Batal</button>
                    <button onClick={handlePasswordSave} disabled={pwSaving}
                      className="px-4 py-2 rounded-lg bg-accent text-accent-foreground text-xs font-medium hover:bg-accent/90 transition-colors inline-flex items-center gap-1.5 disabled:opacity-50">
                      {pwSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                      Simpan Password
                    </button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>

      {/* ═══ Kartu Saya ═══ */}
      <Card className="border-border shadow-sm">
        <CardHeader className="border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-accent" />
              Kartu Saya
            </CardTitle>
            <button onClick={() => { setShowAddCard(true); setAddCardError(''); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-accent text-accent-foreground hover:bg-accent/90 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Tambah Kartu
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {cardsLoading ? (
            <div className="p-6"><SkeletonTable rows={2} /></div>
          ) : cards.length === 0 ? (
            <EmptyState icon={<CreditCard className="w-8 h-8 text-accent" />} title="Belum ada kartu" description="Anda belum memiliki kartu UID terdaftar." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground bg-muted/50 sticky top-0">
                  <tr>
                    <th className="px-5 py-3.5 font-medium">UID</th>
                    <th className="px-5 py-3.5 font-medium">Saldo</th>
                    <th className="px-5 py-3.5 font-medium">Status</th>
                    <th className="px-5 py-3.5 font-medium">Kendaraan</th>
                    <th className="px-5 py-3.5 font-medium text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {cards.map((card) => (
                    <tr key={card.id} className="hover:bg-primary/5 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-xs text-foreground">{card.uid}</td>
                      <td className="px-5 py-3.5 font-medium text-foreground">Rp {(card.balance ?? 0).toLocaleString('id-ID')}</td>
                      <td className="px-5 py-3.5"><StatusDot status={card.status} /></td>
                      <td className="px-5 py-3.5 text-muted-foreground">
                        {card.plate_number
                          ? `${card.plate_number}${card.vehicle_type ? ` (${card.vehicle_type})` : ''}`
                          : <span className="text-muted-foreground/40 italic">—</span>}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => openEditCard(card)}
                            className="p-1.5 text-accent hover:bg-accent/10 rounded-lg transition-all" title="Edit">
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => { setDeleteCard({ id: card.id, uid: card.uid, vehicle_id: card.vehicle_id }); setDeleteCardError(''); }}
                            className="p-1.5 text-muted-foreground hover:text-danger hover:bg-danger/10 rounded-lg transition-all" title="Hapus">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ═══ Riwayat Transaksi ═══ */}
      <Card className="border-border shadow-sm">
        <CardHeader className="border-b border-border pb-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <History className="w-4 h-4 text-accent" />
              Riwayat Transaksi
            </CardTitle>
            {isUser && (
              <button onClick={handleExportCSV} disabled={txData.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex gap-3 items-center px-5 py-3 border-b border-border/50">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input type="text" placeholder="Cari gate, plat, atau UID..." value={txSearch}
                onChange={(e) => setTxSearch(e.target.value)}
                className="w-full bg-background border border-border rounded-lg pl-8 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 transition-all" />
            </div>
            <div className="flex gap-1 bg-muted/30 rounded-lg p-0.5 border border-border">
              {DATE_RANGES.map((r) => (
                <button key={r} onClick={() => setTxRange(r)}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${txRange === r ? 'bg-card shadow-sm text-foreground border border-border' : 'text-muted-foreground hover:text-foreground'}`}>
                  {r === '7 Hari Terakhir' ? '7 Hari' : r}
                </button>
              ))}
            </div>
          </div>

          {txLoading ? (
            <div className="p-6"><SkeletonTable rows={5} /></div>
          ) : txData.length === 0 ? (
            <EmptyState icon={<History className="w-8 h-8 text-accent" />} title="Belum ada transaksi" description="Belum ada aktivitas transaksi." />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground bg-muted/50 sticky top-0">
                    <tr>
                      <th className="px-5 py-3.5 font-medium">Waktu</th>
                      <th className="px-5 py-3.5 font-medium">Gate</th>
                      <th className="px-5 py-3.5 font-medium">Plat</th>
                      <th className="px-5 py-3.5 font-medium text-right">Tarif</th>
                      <th className="px-5 py-3.5 font-medium text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {txData.map((tx) => {
                      const tapIn = tx.tap_in_time ? new Date(tx.tap_in_time.endsWith('Z') || tx.tap_in_time.includes('+') ? tx.tap_in_time : tx.tap_in_time + 'Z') : null
                      return (
                        <tr key={tx.id} className="hover:bg-primary/5 transition-colors">
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <span className="text-foreground font-medium">{relativeTime(tapIn)}</span>
                            <span className="text-muted-foreground ml-1.5 text-xs">{tapIn?.toLocaleString() ?? '-'}</span>
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap text-xs text-muted-foreground">
                            {tx.gate_in_name}{tx.gate_out_name ? ` → ${tx.gate_out_name}` : ''}
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap text-muted-foreground">{tx.plate_number || '-'}</td>
                          <td className="px-5 py-3.5 whitespace-nowrap text-right font-medium text-foreground">
                            Rp {(tx.fee ?? 0).toLocaleString('id-ID')}
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap text-right">
                            <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-medium border ${statusStyle(tx.status)}`}>
                              {statusLabel(tx.status)}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between px-5 py-3 border-t border-border/50">
                <p className="text-xs text-muted-foreground">
                  {txTotal > 0 ? `Menampilkan ${txPage * PAGE_SIZE + 1}-${Math.min((txPage + 1) * PAGE_SIZE, txTotal)} dari ${txTotal} transaksi` : ''}
                </p>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setTxPage((p) => Math.max(0, p - 1))} disabled={txPage === 0}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-muted-foreground px-2">{txPage + 1} / {totalPages}</span>
                  <button onClick={() => setTxPage((p) => Math.min(totalPages - 1, p + 1))} disabled={txPage >= totalPages - 1}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ═══ MODALS ═══ */}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out] p-4">
          <div className="bg-card border border-border shadow-2xl rounded-xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
              <h3 className="text-sm font-semibold flex items-center gap-2"><Edit3 className="w-4 h-4 text-accent" /> Edit Profil</h3>
              <button onClick={() => { setShowEditModal(false); setEditError(null); }}
                className="p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Nama</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all" placeholder="Nama lengkap" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email</label>
                <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all" placeholder="email@example.com" />
              </div>
              {editError && <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{editError}</p>}
            </div>
            <div className="flex justify-end gap-2 px-5 py-3.5 border-t border-border">
              <button onClick={() => { setShowEditModal(false); setEditError(null); }}
                className="px-4 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted/50 transition-colors">Batal</button>
              <button onClick={handleEditSave} disabled={saving}
                className="px-4 py-2 rounded-lg bg-accent text-accent-foreground text-xs font-medium hover:bg-accent/90 transition-colors inline-flex items-center gap-1.5 disabled:opacity-50">
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Kartu Modal */}
      {editCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out] p-4">
          <div className="bg-card border border-border shadow-2xl rounded-xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
              <h3 className="text-sm font-semibold flex items-center gap-2"><Edit3 className="w-4 h-4 text-accent" /> Edit Kartu</h3>
              <button onClick={() => setEditCard(null)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">UID Kartu</label>
                <input type="text" value={editCardForm.uid} onChange={(e) => setEditCardForm({ ...editCardForm, uid: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Saldo (Rp)</label>
                <input type="number" value={editCardForm.balance} onChange={(e) => setEditCardForm({ ...editCardForm, balance: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all" min="0" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Status</label>
                <select value={editCardForm.status} onChange={(e) => setEditCardForm({ ...editCardForm, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all">
                  <option value="ACTIVE">Aktif</option>
                  <option value="BLOCKED">Diblokir</option>
                </select>
              </div>
              <hr className="border-border/50" />
              <p className="text-xs font-medium text-muted-foreground">Kendaraan</p>
              {editCard.vehicle_id ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Plat Nomor</label>
                    <input type="text" value={editCardForm.plate_number} onChange={(e) => setEditCardForm({ ...editCardForm, plate_number: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all uppercase" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Tipe</label>
                    <select value={editCardForm.vehicle_type} onChange={(e) => setEditCardForm({ ...editCardForm, vehicle_type: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all">
                      {VEHICLE_TYPES.map((vt) => <option key={vt.value} value={vt.value}>{vt.label}</option>)}
                    </select>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">Tidak ada kendaraan terdaftar</p>
              )}
            </div>
            <div className="flex justify-end gap-2 px-5 py-3.5 border-t border-border">
              <button onClick={() => setEditCard(null)}
                className="px-4 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted/50 transition-colors">Batal</button>
              <button onClick={handleEditCardSave} disabled={editCardLoading}
                className="px-4 py-2 rounded-lg bg-accent text-accent-foreground text-xs font-medium hover:bg-accent/90 transition-colors inline-flex items-center gap-1.5 disabled:opacity-50">
                {editCardLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tambah Kartu Modal */}
      {showAddCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out] p-4">
          <div className="bg-card border border-border shadow-2xl rounded-xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
              <h3 className="text-sm font-semibold flex items-center gap-2"><Plus className="w-4 h-4 text-accent" /> Tambah Kartu</h3>
              <button onClick={() => { setShowAddCard(false); setAddCardError(''); }}
                className="p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">UID Kartu</label>
                <input type="text" value={addCardForm.uid} onChange={(e) => setAddCardForm({ ...addCardForm, uid: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all" placeholder="UID kartu" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Plat Nomor</label>
                <input type="text" value={addCardForm.plate_number} onChange={(e) => setAddCardForm({ ...addCardForm, plate_number: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all uppercase" placeholder="B 1234 ABC" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Tipe Kendaraan</label>
                <select value={addCardForm.vehicle_type} onChange={(e) => setAddCardForm({ ...addCardForm, vehicle_type: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all">
                  {VEHICLE_TYPES.map((vt) => <option key={vt.value} value={vt.value}>{vt.label}</option>)}
                </select>
              </div>
              {addCardError && <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{addCardError}</p>}
            </div>
            <div className="flex justify-end gap-2 px-5 py-3.5 border-t border-border">
              <button onClick={() => { setShowAddCard(false); setAddCardError(''); }}
                className="px-4 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted/50 transition-colors">Batal</button>
              <button onClick={handleAddCard} disabled={addCardLoading}
                className="px-4 py-2 rounded-lg bg-accent text-accent-foreground text-xs font-medium hover:bg-accent/90 transition-colors inline-flex items-center gap-1.5 disabled:opacity-50">
                {addCardLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />} Tambah
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Hapus Kartu */}
      <ConfirmModal
        isOpen={deleteCard !== null}
        onClose={() => { setDeleteCard(null); setDeleteCardError(''); }}
        onConfirm={handleDeleteCard}
        title="Hapus Kartu"
        description={
          <div>
            <p className="text-sm text-muted-foreground">Apakah Anda yakin ingin menghapus kartu <span className="font-mono text-foreground font-medium">{deleteCard?.uid}</span>?</p>
            {deleteCardError && (
              <p className="mt-2 text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{deleteCardError}</p>
            )}
          </div>
        }
        confirmLabel="Hapus"
        cancelLabel="Batal"
        variant="danger"
        loading={deleteCardLoading}
      />
    </div>
  )
}
