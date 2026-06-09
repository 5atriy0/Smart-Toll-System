'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, FileText, Shield, Calendar, Edit3, Save, X, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { updateProfile } from '@/services/profileService'
import { useToast } from '@/contexts/ToastContext'

export function ProfileView() {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile?.name || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const joined = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '-';

  const handleSave = async () => {
    if (!user) return;
    if (!name.trim()) { setError('Nama tidak boleh kosong'); return; }

    setSaving(true);
    setError(null);

    const { error: err } = await updateProfile(user.id, { name: name.trim() });

    if (err) {
      setError(err.message);
      setSaving(false);
      return;
    }

    await refreshProfile();
    setSaving(false);
    setEditing(false);
    toast('Profil berhasil diperbarui', 'success');
  };

  const handleCancel = () => {
    setName(profile?.name || '');
    setError(null);
    setEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card className="border-border shadow-sm overflow-hidden" style={{ borderLeft: '3px solid hsl(var(--accent))' }}>
            <CardHeader className="pb-4">
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-full flex items-center justify-center border-4 border-accent/20"
                  style={{ backgroundColor: 'hsl(var(--primary))' }}>
                  <span className="text-3xl font-bold text-white">
                    {(profile?.name || user?.email || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-center">
                  <h2 className="text-lg font-bold text-foreground">{profile?.name || user?.email?.split('@')[0] || 'User'}</h2>
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
                    <span className="w-2 h-2 rounded-full bg-success" />
                    {profile?.role === 'ADMIN' ? 'Administrator' : 'Pengguna'}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Shield className="w-4 h-4 text-success" />
                    Status
                  </span>
                  <span className="text-sm font-bold text-success">Aktif</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/30 border border-border text-center">
                  <p className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Bergabung
                  </p>
                  <p className="text-sm font-bold text-foreground">{joined}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-border text-center">
                  <p className="text-xs text-muted-foreground mb-1">Role</p>
                  <p className="text-sm font-bold text-primary">{profile?.role === 'ADMIN' ? 'Admin' : 'User'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-accent" />
                  Informasi Akun
                </CardTitle>
                {!editing && (
                  <button
                    onClick={() => { setName(profile?.name || ''); setEditing(true); setError(null); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-colors"
                    style={{ backgroundColor: 'hsl(var(--sidebar-active))' }}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">Nama</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 transition-colors"
                      style={{ focusRingColor: 'hsl(var(--accent))' }}
                      placeholder="Masukkan nama"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">Email</label>
                    <input
                      type="email"
                      value={profile?.email || user?.email || ''}
                      disabled
                      className="w-full px-3 py-2 rounded-lg border border-border bg-muted/50 text-muted-foreground text-sm cursor-not-allowed"
                    />
                    <p className="text-[11px] text-muted-foreground/60 mt-1">Email tidak dapat diubah</p>
                  </div>

                  {error && (
                    <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</p>
                  )}

                  <div className="flex items-center gap-3 pt-1">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
                      style={{ backgroundColor: 'hsl(var(--sidebar-active))' }}
                    >
                      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      Simpan
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={saving}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground border border-border hover:bg-muted transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Nama</label>
                    <p className="text-foreground font-medium">{profile?.name || user?.email?.split('@')[0] || 'User'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Email</label>
                    <p className="text-foreground font-medium flex items-center gap-2">
                      <Mail className="w-4 h-4 text-primary" />
                      {profile?.email || user?.email || '-'}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
