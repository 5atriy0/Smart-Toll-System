'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { updateCard, updateVehicle } from '@/services/cardService';
import { useToast } from '@/contexts/ToastContext';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { NfcScanButton } from '@/components/nfc/NfcScanButton';
import {
  Wallet, CreditCard, Plus, History, Loader2, AlertTriangle, CheckCircle,
  Car, Trash2, Edit3, Save, X, Search, Download, ArrowLeft, ArrowRight, Ban,
} from 'lucide-react';
import type { VwTransactionDetails } from '@/lib/types/supabase';

const DATE_RANGES = ['Hari Ini', '7 Hari Terakhir', 'Bulan Ini', 'Semua Waktu']
const PAGE_SIZE = 10
const VEHICLE_TYPES = [
  { value: 'CAR', label: 'Mobil' }, { value: 'PICKUP', label: 'Pickup' },
  { value: 'MINIBUS', label: 'Minibus' }, { value: 'BUS', label: 'Bus' },
  { value: 'LIGHT_TRUCK', label: 'Truk Ringan' }, { value: 'HEAVY_TRUCK', label: 'Truk Berat' },
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
  if (s === 'COMPLETED') return 'border-success/40 text-success bg-success/10'
  if (s === 'IN_PROGRESS') return 'border-accent/40 text-accent bg-accent/10'
  return 'border-border text-muted-foreground bg-muted/60'
}

export default function UserPage() {
  const { profile } = useAuth()
  const { toast } = useToast()
  const supabase = createClient()

  // ── Data ──
  const [cards, setCards] = useState<any[]>([])
  const [transactions, setTransactions] = useState<VwTransactionDetails[]>([])
  const [txTotal, setTxTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  // ── Top up ──
  const [showTopup, setShowTopup] = useState(false)
  const [selectedCard, setSelectedCard] = useState('')
  const [topupAmount, setTopupAmount] = useState('')
  const [topupLoading, setTopupLoading] = useState(false)
  const [topupMessage, setTopupMessage] = useState({ type: '', text: '' })

  // ── Transaction filters ──
  const [txPage, setTxPage] = useState(0)
  const [txSearch, setTxSearch] = useState('')
  const [txRange, setTxRange] = useState('Semua Waktu')

  // ── Add card ──
  const [showAddCard, setShowAddCard] = useState(false)
  const [addForm, setAddForm] = useState({ uid: '', plate_number: '', vehicle_type: 'CAR' })
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState('')

  // ── Edit card ──
  const [editCard, setEditCard] = useState<any | null>(null)
  const [editForm, setEditForm] = useState({ uid: '', balance: '0', status: 'ACTIVE', plate_number: '', vehicle_type: 'CAR' })
  const [editLoading, setEditLoading] = useState(false)

  // ── Delete card ──
  const [cardToDelete, setCardToDelete] = useState<{ uid: string; vehicle_id: string | null } | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  // ── Fetch ──
  const fetchCards = useCallback(async () => {
    if (!profile?.id) return
    const { data } = await supabase
      .from('cards')
      .select('*, vehicle:vehicles(plate_number, vehicle_type, id)')
      .eq('profile_id', profile.id)
    if (data) setCards(data.map((c: any) => ({
      id: c.id, uid: c.uid, balance: c.balance, status: c.status,
      vehicle_id: c.vehicle_id,
      plate_number: c.vehicle?.plate_number ?? null,
      vehicle_type: c.vehicle?.vehicle_type ?? null,
      _vehicle: c.vehicle,
    })))
  }, [profile?.id])

  const fetchTx = useCallback(async () => {
    if (!profile?.id) return
    let q = supabase.from('vw_transaction_details').select('*', { count: 'exact' }).eq('profile_id', profile.id)
    const df = computeDateFrom(txRange)
    if (df) q = q.gte('tap_in_time', df)
    if (txSearch.trim()) {
      const s = `%${txSearch.trim()}%`
      q = q.or(`gate_in_name.ilike.${s},gate_out_name.ilike.${s},plate_number.ilike.${s},uid.ilike.${s}`)
    }
    const { data, count } = await q.order('tap_in_time', { ascending: false }).range(txPage * PAGE_SIZE, (txPage + 1) * PAGE_SIZE - 1)
    if (data) setTransactions(data as VwTransactionDetails[])
    if (count !== null) setTxTotal(count)
  }, [profile?.id, txRange, txSearch, txPage])

  const fetchAll = async () => {
    setLoading(true)
    await Promise.all([fetchCards(), fetchTx()])
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [])
  useEffect(() => { fetchTx() }, [txRange, txSearch, txPage])
  useEffect(() => { setTxPage(0) }, [txSearch, txRange])

  // ── Top up ──
  const handleTopup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCard || !topupAmount) return
    setTopupLoading(true); setTopupMessage({ type: '', text: '' })
    const amount = parseInt(topupAmount.replace(/[^0-9]/g, ''))
    const { error } = await supabase.rpc('top_up', { p_card_uid: selectedCard, p_amount: amount, p_method: 'Transfer Bank', p_created_by: profile?.id || '' })
    setTopupLoading(false)
    if (error) { setTopupMessage({ type: 'error', text: error.message }); return }
    setTopupMessage({ type: 'success', text: `Berhasil top up Rp ${amount.toLocaleString('id-ID')}` })
    setTopupAmount(''); setSelectedCard('')
    setTimeout(() => { setShowTopup(false); fetchCards() }, 2000)
  }

  // ── Add card ──
  const handleAddCard = async () => {
    if (!addForm.uid || !addForm.plate_number) { setAddError('UID dan plat nomor wajib diisi'); return }
    setAddLoading(true); setAddError('')
    try {
      const res = await fetch('/api/user/add-card', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_id: profile?.id, ...addForm }),
      })
      const data = await res.json()
      if (!res.ok || data.error) { setAddError(data.error || 'Gagal menambahkan kartu'); setAddLoading(false); return }
      setShowAddCard(false); setAddForm({ uid: '', plate_number: '', vehicle_type: 'CAR' })
      toast('Kartu berhasil ditambahkan', 'success')
      fetchCards()
    } catch { setAddError('Terjadi kesalahan pada server') }
    setAddLoading(false)
  }

  // ── Edit card ──
  const openEditCard = (card: any) => {
    setEditCard(card)
    setEditForm({
      uid: card.uid, balance: String(card.balance ?? 0), status: card.status,
      plate_number: card.plate_number || '', vehicle_type: card.vehicle_type || 'CAR',
    })
  }

  const handleEditCardSave = async () => {
    if (!editCard) return
    setEditLoading(true)
    const params: Record<string, unknown> = { p_card_id: editCard.id }
    if (editForm.uid !== editCard.uid) params.p_uid = editForm.uid
    if (Number(editForm.balance) !== editCard.balance) params.p_balance = Number(editForm.balance)
    if (editForm.status !== editCard.status) params.p_status = editForm.status
    if (Object.keys(params).length > 1) {
      const { error } = await updateCard(params as any)
      if (error) { toast('Gagal memperbarui kartu', 'error'); setEditLoading(false); return }
    }
    if (editCard.vehicle_id && (editForm.plate_number !== (editCard.plate_number || '') || editForm.vehicle_type !== (editCard.vehicle_type || 'CAR'))) {
      const { error: vErr } = await updateVehicle(editCard.vehicle_id, { plate_number: editForm.plate_number, vehicle_type: editForm.vehicle_type })
      if (vErr) { toast('Gagal memperbarui kendaraan', 'error'); setEditLoading(false); return }
    }
    setEditCard(null); setEditLoading(false)
    toast('Kartu berhasil diperbarui', 'success')
    fetchCards()
  }

  // ── Delete card ──
  const handleDeleteCard = async () => {
    if (!cardToDelete) return
    setDeleteLoading(true); setDeleteError('')
    try {
      const res = await fetch('/api/user/delete-card', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_id: profile?.id, uid: cardToDelete.uid, vehicle_id: cardToDelete.vehicle_id }),
      })
      const data = await res.json()
      if (!res.ok || data.error) { setDeleteError(data.error || 'Gagal menghapus kartu'); setDeleteLoading(false); return }
      setCardToDelete(null)
      toast('Kartu berhasil dihapus', 'success')
      fetchCards()
    } catch { setDeleteError('Terjadi kesalahan pada server') }
    setDeleteLoading(false)
  }

  // ── Export CSV ──
  const handleExportCSV = () => {
    if (transactions.length === 0) { toast('Tidak ada data untuk diexport', 'info'); return }
    const headers = ['ID', 'UID', 'Plat', 'Gate Masuk', 'Gate Keluar', 'Tap In', 'Tap Out', 'Durasi (menit)', 'Kecepatan (km/h)', 'Jarak (km)', 'Tarif', 'Status']
    const rows = transactions.map((tx) => [
      tx.id, tx.uid, tx.plate_number, tx.gate_in_name, tx.gate_out_name || '',
      tx.tap_in_time, tx.tap_out_time || '',
      tx.duration_minutes ?? '', tx.average_speed ?? '', tx.distance_km ?? '',
      tx.fee ?? '', tx.status,
    ])
    const csv = ['\uFEFF' + headers.join(','), ...rows.map((r) => r.map((c) => { const s = String(c ?? ''); return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s }).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
    a.download = `riwayat_transaksi_${profile?.name || 'user'}_${new Date().toISOString().slice(0, 10)}.csv`
    a.click(); URL.revokeObjectURL(blob)
    toast('Data berhasil diunduh', 'success')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const totalBalance = cards.reduce((sum: number, c: any) => sum + (c.balance || 0), 0)
  const totalPages = Math.max(1, Math.ceil(txTotal / PAGE_SIZE))

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ═══ Header Greeting ═══ */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full flex items-center justify-center border-4 border-accent/20 bg-primary shrink-0">
          <span className="text-lg font-bold text-white">{(profile?.name || 'U').charAt(0).toUpperCase()}</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Halo, {profile?.name?.split(' ')[0] || 'User'}!</h1>
          <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      {/* ═══ Quick Stats ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 relative overflow-hidden">
          <p className="text-xs text-primary font-medium mb-1">Total Saldo</p>
          <h2 className="text-2xl font-bold text-foreground">Rp {totalBalance.toLocaleString('id-ID')}</h2>
          <p className="text-[11px] text-muted-foreground mt-1">Dari {cards.length} kartu</p>
          <Wallet className="absolute right-[-10px] bottom-[-10px] w-24 h-24 text-primary opacity-5" />
        </Card>
        <Card className="p-5 flex flex-col justify-center">
          <p className="text-xs text-muted-foreground mb-1">Total Kartu</p>
          <h2 className="text-2xl font-bold text-foreground">{cards.length}</h2>
          <p className="text-[11px] text-muted-foreground mt-1">Kartu terdaftar</p>
        </Card>
        <Card className="p-5 flex flex-col justify-center">
          <p className="text-xs text-muted-foreground mb-1">Total Transaksi</p>
          <h2 className="text-2xl font-bold text-foreground">{txTotal}</h2>
          <p className="text-[11px] text-muted-foreground mt-1">Riwayat transaksi</p>
        </Card>
      </div>

      {/* ═══ Quick Actions ═══ */}
      <div className="flex gap-3">
        <button onClick={() => { setShowTopup(!showTopup); setShowAddCard(false) }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all ${
            showTopup ? 'bg-topup text-topup-foreground' : 'bg-topup/15 text-topup hover:bg-topup/25'
          }`}>
          <Wallet className="w-4 h-4" /> Top Up
        </button>
        <button onClick={() => { setShowAddCard(!showAddCard); setShowTopup(false); setAddError('') }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all ${
            showAddCard ? 'bg-accent text-accent-foreground' : 'bg-accent/15 text-accent hover:bg-accent/25'
          }`}>
          <Plus className="w-4 h-4" /> Tambah Kartu
        </button>
      </div>

      {/* ═══ Top Up Form ═══ */}
      {showTopup && (
        <Card className="p-5 border-topup/20 bg-topup/5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Wallet className="w-4 h-4 text-topup" /> Top Up Saldo</h3>
          <form onSubmit={handleTopup} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Pilih Kartu</label>
              <select value={selectedCard} onChange={(e) => setSelectedCard(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" required>
                <option value="">Pilih kartu...</option>
                {cards.map((c: any) => (
                  <option key={c.uid} value={c.uid}>{c.uid} - {c.plate_number || '-'} (Rp {c.balance.toLocaleString('id-ID')})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Nominal</label>
              <input type="text" placeholder="Rp 50.000" value={topupAmount}
                onChange={(e) => { const v = e.target.value.replace(/[^0-9]/g, ''); setTopupAmount(v ? `Rp ${parseInt(v).toLocaleString('id-ID')}` : '') }}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/30" required />
            </div>
            {topupMessage.text && (
              <div className={`flex items-center gap-2 text-xs p-3 rounded-lg ${topupMessage.type === 'error' ? 'bg-red-400/10 text-red-400' : 'bg-green-500/10 text-green-600'}`}>
                {topupMessage.type === 'error' ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                {topupMessage.text}
              </div>
            )}
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowTopup(false)}
                className="px-4 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted/50 transition-colors">Tutup</button>
              <button type="submit" disabled={topupLoading}
                className="px-4 py-2 rounded-lg bg-topup text-topup-foreground text-xs font-medium hover:bg-topup/90 transition-colors flex items-center gap-1.5 disabled:opacity-50">
                {topupLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                Konfirmasi Top Up
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* ═══ Add Card Modal ═══ */}
      {showAddCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out] p-4">
          <div className="bg-card border border-border shadow-2xl rounded-xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
              <h3 className="text-sm font-semibold flex items-center gap-2"><Plus className="w-4 h-4 text-accent" /> Tambah Kartu Baru</h3>
              <button onClick={() => { setShowAddCard(false); setAddError('') }} className="p-1 text-muted-foreground hover:text-foreground rounded-md"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">UID Kartu</label>
                <div className="flex gap-2">
                  <input type="text" value={addForm.uid} onChange={(e) => setAddForm({ ...addForm, uid: e.target.value.toUpperCase() })}
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30" placeholder="UID kartu" />
                  <NfcScanButton onScan={(uid) => setAddForm(f => ({ ...f, uid }))} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Plat Nomor</label>
                <input type="text" value={addForm.plate_number} onChange={(e) => setAddForm({ ...addForm, plate_number: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 uppercase" placeholder="B 1234 ABC" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Tipe Kendaraan</label>
                <select value={addForm.vehicle_type} onChange={(e) => setAddForm({ ...addForm, vehicle_type: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30">
                  {VEHICLE_TYPES.map((vt) => <option key={vt.value} value={vt.value}>{vt.label}</option>)}
                </select>
              </div>
              {addError && <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{addError}</p>}
            </div>
            <div className="flex justify-end gap-2 px-5 py-3.5 border-t border-border">
              <button onClick={() => { setShowAddCard(false); setAddError('') }}
                className="px-4 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted/50 transition-colors">Batal</button>
              <button onClick={handleAddCard} disabled={addLoading}
                className="px-4 py-2 rounded-lg bg-accent text-accent-foreground text-xs font-medium hover:bg-accent/90 transition-colors inline-flex items-center gap-1.5 disabled:opacity-50">
                {addLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />} Tambah
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Kartu Saya ═══ */}
      <Card className="border-border shadow-sm">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold flex items-center gap-2"><CreditCard className="w-4 h-4 text-accent" /> Kartu Saya</h3>
          <button onClick={() => setShowAddCard(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-accent/15 text-accent hover:bg-accent/25 transition-colors">
            <Plus className="w-3 h-3" /> Tambah
          </button>
        </div>

        {cards.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Belum ada kartu</p>
            <p className="text-xs mt-1">Tambahkan kartu UID untuk memulai</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {cards.map((card: any) => (
              <div key={card.id} className="flex items-center justify-between p-4 hover:bg-accent/5 transition-colors gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Car className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{card.plate_number || <span className="italic text-muted-foreground/50">Tanpa kendaraan</span>}</p>
                    <p className="text-xs text-muted-foreground font-mono truncate">{card.uid}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-foreground">Rp {(card.balance ?? 0).toLocaleString('id-ID')}</p>
                    <StatusDot status={card.status} />
                  </div>
                  <div className="flex items-center gap-3 sm:hidden">
                    <p className="text-sm font-bold text-foreground">Rp {(card.balance ?? 0).toLocaleString('id-ID')}</p>
                  </div>
                  <button onClick={() => openEditCard(card)}
                    className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-all" title="Edit">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => { setCardToDelete({ uid: card.uid, vehicle_id: card.vehicle_id }); setDeleteError('') }}
                    className="p-2 text-muted-foreground hover:text-danger hover:bg-danger/10 rounded-lg transition-all" title="Hapus">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ═══ Riwayat Transaksi ═══ */}
      <Card className="border-border shadow-sm">
        <div className="px-5 py-4 border-b border-border">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="text-sm font-semibold flex items-center gap-2"><History className="w-4 h-4 text-accent" /> Riwayat Transaksi</h3>
            <button onClick={handleExportCSV} disabled={transactions.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/15 text-primary hover:bg-primary/25 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
          </div>
          {/* Filters */}
          <div className="flex gap-3 items-center mt-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input type="text" placeholder="Cari gate, plat, atau UID..." value={txSearch}
                onChange={(e) => setTxSearch(e.target.value)}
                className="w-full bg-background border border-border rounded-lg pl-8 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 transition-all" />
            </div>
            <div className="flex gap-1 bg-muted/60 rounded-lg p-0.5 border border-border overflow-x-auto">
              {DATE_RANGES.map((r) => (
                <button key={r} onClick={() => setTxRange(r)}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                    txRange === r ? 'bg-card shadow-sm text-foreground border border-border' : 'text-muted-foreground hover:text-foreground'
                  }`}>
                  {r === '7 Hari Terakhir' ? '7 Hari' : r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <History className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Belum ada transaksi</p>
          </div>
        ) : (
          <>
            {/* Mobile: card list */}
            <div className="divide-y divide-border/50 sm:hidden">
              {transactions.map((tx) => {
                const tapIn = tx.tap_in_time ? new Date(tx.tap_in_time.endsWith('Z') || tx.tap_in_time.includes('+') ? tx.tap_in_time : tx.tap_in_time + 'Z') : null
                return (
                  <div key={tx.id} className="p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-muted-foreground">{tapIn?.toLocaleDateString('id-ID')} {tapIn?.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                        <p className="text-sm font-medium text-foreground mt-0.5">{tx.gate_in_name}{tx.gate_out_name ? ` → ${tx.gate_out_name}` : ''}</p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-md border ${statusStyle(tx.status)}`}>{statusLabel(tx.status)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{tx.plate_number || '-'}</span>
                      <span className="font-medium text-foreground">Rp {(tx.fee ?? 0).toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Desktop: table */}
            <div className="overflow-x-auto hidden sm:block">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground bg-muted/70 sticky top-0">
                  <tr>
                    <th className="px-5 py-3.5 font-medium">Waktu</th>
                    <th className="px-5 py-3.5 font-medium">Gate</th>
                    <th className="px-5 py-3.5 font-medium">Plat</th>
                    <th className="px-5 py-3.5 font-medium text-right">Tarif</th>
                    <th className="px-5 py-3.5 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {transactions.map((tx) => {
                    const tapIn = tx.tap_in_time ? new Date(tx.tap_in_time.endsWith('Z') || tx.tap_in_time.includes('+') ? tx.tap_in_time : tx.tap_in_time + 'Z') : null
                    return (
                      <tr key={tx.id} className="hover:bg-accent/5 transition-colors">
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className="text-foreground font-medium">{relativeTime(tapIn)}</span>
                          <span className="text-muted-foreground ml-1.5 text-xs">{tapIn?.toLocaleString() ?? '-'}</span>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap text-xs text-muted-foreground">{tx.gate_in_name}{tx.gate_out_name ? ` → ${tx.gate_out_name}` : ''}</td>
                        <td className="px-5 py-3.5 whitespace-nowrap text-muted-foreground">{tx.plate_number || '-'}</td>
                        <td className="px-5 py-3.5 whitespace-nowrap text-right font-medium text-foreground">Rp {(tx.fee ?? 0).toLocaleString('id-ID')}</td>
                        <td className="px-5 py-3.5 whitespace-nowrap text-right">
                          <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-medium border ${statusStyle(tx.status)}`}>{statusLabel(tx.status)}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-border/50">
              <p className="text-xs text-muted-foreground">
                {txTotal > 0 ? `Menampilkan ${txPage * PAGE_SIZE + 1}-${Math.min((txPage + 1) * PAGE_SIZE, txTotal)} dari ${txTotal}` : ''}
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
      </Card>

      {/* ═══ Edit Kartu Modal ═══ */}
      {editCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out] p-4">
          <div className="bg-card border border-border shadow-2xl rounded-xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
              <h3 className="text-sm font-semibold flex items-center gap-2"><Edit3 className="w-4 h-4 text-accent" /> Edit Kartu</h3>
              <button onClick={() => setEditCard(null)} className="p-1 text-muted-foreground hover:text-foreground rounded-md"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">UID Kartu</label>
                <div className="flex gap-2">
                  <input type="text" value={editForm.uid} onChange={(e) => setEditForm({ ...editForm, uid: e.target.value.toUpperCase() })}
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30" />
                  <NfcScanButton onScan={(uid) => setEditForm(f => ({ ...f, uid }))} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Saldo (Rp)</label>
                <input type="number" value={editForm.balance} onChange={(e) => setEditForm({ ...editForm, balance: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30" min="0" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Status</label>
                <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30">
                  <option value="ACTIVE">Aktif</option>
                  <option value="BLOCKED">Diblokir</option>
                </select>
              </div>
              {editCard.vehicle_id && (
                <>
                  <hr className="border-border/50" />
                  <p className="text-xs font-medium text-muted-foreground">Kendaraan</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">Plat Nomor</label>
                      <input type="text" value={editForm.plate_number} onChange={(e) => setEditForm({ ...editForm, plate_number: e.target.value.toUpperCase() })}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 uppercase" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">Tipe</label>
                      <select value={editForm.vehicle_type} onChange={(e) => setEditForm({ ...editForm, vehicle_type: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30">
                        {VEHICLE_TYPES.map((vt) => <option key={vt.value} value={vt.value}>{vt.label}</option>)}
                      </select>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="flex justify-end gap-2 px-5 py-3.5 border-t border-border">
              <button onClick={() => setEditCard(null)}
                className="px-4 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted/50 transition-colors">Batal</button>
              <button onClick={handleEditCardSave} disabled={editLoading}
                className="px-4 py-2 rounded-lg bg-accent text-accent-foreground text-xs font-medium hover:bg-accent/90 transition-colors inline-flex items-center gap-1.5 disabled:opacity-50">
                {editLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Delete Confirmation ═══ */}
      <ConfirmModal
        isOpen={cardToDelete !== null}
        onClose={() => { setCardToDelete(null); setDeleteError('') }}
        onConfirm={handleDeleteCard}
        title="Hapus Kartu"
        description={
          <div>
            <p className="text-sm text-muted-foreground">Apakah Anda yakin ingin menghapus kartu <span className="font-mono text-foreground font-medium">{cardToDelete?.uid}</span>?</p>
            {deleteError && <p className="mt-2 text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{deleteError}</p>}
          </div>
        }
        confirmLabel="Hapus"
        cancelLabel="Batal"
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  )
}
