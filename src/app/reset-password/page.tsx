'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Lock, Eye, EyeOff, AlertTriangle, Loader2, CheckCircle } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace('#', '?'));
    const type = params.get('type');
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (type === 'recovery' && accessToken) {
      supabase.auth
        .setSession({ access_token: accessToken, refresh_token: refreshToken || '' })
        .then(({ error }) => {
          if (error) {
            setError('Link reset password tidak valid atau sudah kadaluarsa.');
            return;
          }
          setReady(true);
          window.history.replaceState(null, '', '/reset-password');
        });
    } else {
      setError('Link reset password tidak valid.');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }
    if (password !== confirm) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push('/login'), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      <div className="absolute w-[32rem] h-[32rem] rounded-full bg-primary/25 blur-[120px] pointer-events-none top-[15%] left-[10%] -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute w-[26rem] h-[26rem] rounded-full bg-accent/18 blur-[120px] pointer-events-none bottom-[10%] right-[5%]" />

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-card border border-border rounded-xl p-8 shadow-lg animate-[cardIn_450ms_ease-out]"
          style={{ borderLeft: '3px solid hsl(var(--accent))' }}>
          <div className="flex flex-col items-center mb-8">
            <div className="w-13 h-13 rounded-xl flex items-center justify-center mb-3 bg-primary shadow-sm">
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                <rect x="4" y="6" width="24" height="20" rx="3" stroke="white" strokeWidth="2.5" fill="none" />
                <rect x="11" y="11" width="10" height="10" rx="1.5" stroke="white" strokeWidth="1.8" fill="none" />
                <line x1="14" y1="16" x2="18" y2="16" stroke="white" strokeWidth="2" />
                <line x1="16" y1="14" x2="16" y2="18" stroke="white" strokeWidth="2" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">Tollytics</h1>
            <p className="text-sm text-muted-foreground mt-1">Reset Password</p>
          </div>

          {success ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <CheckCircle className="w-12 h-12 text-success" />
              <p className="text-lg font-semibold text-foreground">Password Berhasil Diubah</p>
              <p className="text-sm text-muted-foreground text-center">Mengarahkan ke halaman login...</p>
            </div>
          ) : !ready && !error ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-accent" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Password Baru</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimal 6 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-10 pl-10 pr-10 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Konfirmasi Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Ulangi password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="w-full h-10 pl-10 pr-10 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-danger/5 border border-danger/20 text-sm text-danger">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !password || !confirm}
                className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  'Ubah Password'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
