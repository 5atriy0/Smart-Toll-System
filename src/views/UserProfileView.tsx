'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Mail, FileText, Shield, Calendar, Edit3, Save, X, Loader2,
  Lock, Eye, EyeOff, User,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { updateProfile } from '@/services/profileService'
import { useToast } from '@/contexts/ToastContext'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types/supabase'

export function UserProfileView() {
  const { user, profile, refreshProfile } = useAuth()
  const { toast } = useToast()
  const supabase = createClient()

  const [dbProfile, setDbProfile] = useState<Profile | null>(null)

  // Edit state
  const [showEditModal, setShowEditModal] = useState(false)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  // Password state
  const [showPassword, setShowPassword] = useState(false)
  const [pwNew, setPwNew] = useState('')
  const [pwConfirm, setPwConfirm] = useState('')
  const [pwSaving, setPwSaving] = useState(false)
  const [pwError, setPwError] = useState<string | null>(null)
  const [pwVisible, setPwVisible] = useState(false)

  const joined = dbProfile?.created_at
    ? new Date(dbProfile.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
    : '-'

  useEffect(() => {
    if (!profile?.id) return
    supabase.from('profiles').select('*').eq('id', profile.id).single().then(({ data }) => {
      if (data) setDbProfile(data as Profile)
    })
  }, [profile?.id])

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
    const { data } = await supabase.from('profiles').select('*').eq('id', profile?.id).single()
    if (data) setDbProfile(data as Profile)
    setSaving(false)
    setShowEditModal(false)
    toast('Profil berhasil diperbarui', 'success')
  }

  const handlePasswordSave = async () => {
    if (!pwNew.trim()) { setPwError('Password baru tidak boleh kosong'); return }
    if (pwNew.length < 6) { setPwError('Password minimal 6 karakter'); return }
    if (pwNew !== pwConfirm) { setPwError('Konfirmasi password tidak cocok'); return }
    setPwSaving(true); setPwError(null)
    const { error } = await supabase.auth.updateUser({ password: pwNew })
    if (error) { setPwError(error.message); setPwSaving(false); return }
    setPwNew(''); setPwConfirm(''); setShowPassword(false)
    setPwSaving(false)
    toast('Password berhasil diubah', 'success')
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Profile Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Avatar */}
        <div className="md:col-span-1">
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
                    Pengguna
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
                  <p className="text-sm font-bold text-primary">User</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info + Password */}
        <div className="md:col-span-2 space-y-4">
          {/* Informasi Akun */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4 text-accent" />
                  Informasi Akun
                </CardTitle>
                <button onClick={openEdit}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors"
                  style={{ backgroundColor: 'hsl(var(--sidebar-active))' }}>
                  <Edit3 className="w-3 h-3" /> Edit
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Nama</label>
                  <p className="text-sm text-foreground font-medium">{dbProfile?.name || user?.email?.split('@')[0] || 'User'}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Email</label>
                  <p className="text-sm text-foreground font-medium flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-primary" />
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
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Lock className="w-4 h-4 text-accent" />
                  Ubah Password
                </CardTitle>
                <button onClick={() => { setShowPassword(!showPassword); setPwError(null); setPwNew(''); setPwConfirm(''); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground border border-border hover:bg-muted transition-colors">
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
                        {pwVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
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
    </div>
  )
}
