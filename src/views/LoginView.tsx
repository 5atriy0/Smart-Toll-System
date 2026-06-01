'use client';

import { useState, useEffect, useRef } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertTriangle, User, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useLogin } from '@/hooks/useLogin';
import { signUp, resetPassword } from '@/services/authService';
import styles from './LoginView.module.scss'

type PageMode = 'login' | 'register' | 'forgot';

export function LoginView() {
  const {
    email, setEmail, password, setPassword,
    isLoading, error: authError, rememberMe, setRememberMe,
    showPassword, setShowPassword, handleLogin,
  } = useLogin();

  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string; confirm?: string }>({});
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Anti-autofill
  const formId = useRef(Math.random().toString(36).slice(2, 8)).current;
  const [isInputReadOnly, setIsInputReadOnly] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setIsInputReadOnly(false), 600);
    return () => clearTimeout(t);
  }, []);

  // Mode toggle
  const [mode, setMode] = useState<PageMode>('login');

  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regShowPassword, setRegShowPassword] = useState(false);
  const [regShowConfirm, setRegShowConfirm] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState(false);

  // Forgot password state
  const [fpEmail, setFpEmail] = useState('');
  const [fpLoading, setFpLoading] = useState(false);
  const [fpError, setFpError] = useState<string | null>(null);
  const [fpSuccess, setFpSuccess] = useState(false);

  // ── Reset modes ──
  const resetToLogin = () => {
    setMode('login');
    setRegError(null);
    setRegSuccess(false);
    setFpError(null);
    setFpSuccess(false);
  };

  // ── Validation ──
  const validate = (field: string) => {
    if (mode !== 'login') return;
    const errs = { ...errors };
    if (field === 'email') {
      if (!email.trim()) errs.email = 'Email wajib diisi';
      else if (!email.includes('@')) errs.email = 'Format email tidak valid';
      else delete errs.email;
    }
    if (field === 'password') {
      if (!password) errs.password = 'Password wajib diisi';
      else if (password.length < 3) errs.password = 'Password minimal 3 karakter';
      else delete errs.password;
    }
    setErrors(errs);
  };

  const isFormValid = email.includes('@') && password.length >= 3 && !isLoading;

  // ── Register ──
  const [regCooldown, setRegCooldown] = useState(false);
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regCooldown) return;
    setRegError(null);

    if (!regName.trim()) { setRegError('Nama wajib diisi'); return; }
    if (!regEmail.includes('@')) { setRegError('Format email tidak valid'); return; }
    if (regPassword.length < 6) { setRegError('Password minimal 6 karakter'); return; }
    if (regPassword !== regConfirm) { setRegError('Konfirmasi password tidak cocok'); return; }

    setRegLoading(true);
    const { error } = await signUp(regEmail, regPassword);
    setRegLoading(false);

    if (error) {
      setRegError(error.message);
      return;
    }

    setRegSuccess(true);
    setRegCooldown(true);
    setTimeout(() => setRegCooldown(false), 5000);
  };

  // ── Forgot Password ──
  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setFpError(null);

    if (!fpEmail.includes('@')) { setFpError('Masukkan email yang valid'); return; }

    setFpLoading(true);
    const { error } = await resetPassword(fpEmail);
    setFpLoading(false);

    if (error) {
      setFpError(error.message);
      return;
    }

    setFpSuccess(true);
  };

  // ── Handlers for remember me ──
  const handleRememberToggle = (checked: boolean) => {
    setRememberMe(checked);
    if (!checked) {
      try {
        localStorage.removeItem('tollytics_email');
      } catch {}
      setEmail('');
    }
  };

  return (
    <div className={styles.container}>
      {/* Background orbs */}
      <div className={styles.orb1} />
      <div className={styles.orb2} />
      <div className={styles.orb3} />

      {/* Grid pattern */}
      <div className={styles.gridOverlay} />

      {/* Floating shapes */}
      {mounted && (
        <>
          <div className={styles.shape1}>
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <rect x="4" y="4" width="72" height="72" rx="16" stroke="hsl(var(--accent))" strokeWidth="1.5" opacity="0.15" />
              <rect x="16" y="16" width="48" height="48" rx="10" stroke="hsl(var(--accent))" strokeWidth="1" opacity="0.1" />
            </svg>
          </div>
          <div className={styles.shape2}>
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
              <path d="M30 4L56 19V41L30 56L4 41V19L30 4Z" stroke="hsl(var(--primary))" strokeWidth="1.5" opacity="0.12" />
            </svg>
          </div>
          <div className={styles.shape3}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="20" stroke="hsl(var(--accent))" strokeWidth="1.5" opacity="0.1" />
              <circle cx="24" cy="24" r="12" stroke="hsl(var(--primary))" strokeWidth="1" opacity="0.08" />
            </svg>
          </div>
        </>
      )}

      {/* Card */}
      <div className={styles.cardWrapper}>
        <Card className={styles.cardInner}>
          {/* Logo */}
          <div className={styles.logoSection}>
            <div className={styles.logoIcon}>
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <rect x="4" y="6" width="24" height="20" rx="3" stroke="white" strokeWidth="2.5" fill="none"/>
                <rect x="11" y="11" width="10" height="10" rx="1.5" stroke="white" strokeWidth="1.8" fill="none"/>
                <line x1="14" y1="16" x2="18" y2="16" stroke="white" strokeWidth="2"/>
                <line x1="16" y1="14" x2="16" y2="18" stroke="white" strokeWidth="2"/>
              </svg>
            </div>
            <h1 className={styles.logoText}>Tollytics</h1>
            <p className={styles.tagline}>Sistem Monitoring Tol Pintar</p>
          </div>

          {/* ────── LOGIN FORM ────── */}
          {mode === 'login' && (
            <form onSubmit={(e) => { if (isFormValid) handleLogin(e); else e.preventDefault(); }} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>Email</label>
                <div className={styles.inputWrapper}>
                  <Mail className={styles.inputIcon} />
                  <input
                    type="email"
                    placeholder="admin@tollytics.com"
                    name={`email-${formId}`}
                    autoComplete="off"
                    readOnly={isInputReadOnly}
                    onFocus={() => setIsInputReadOnly(false)}
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (errors.email) validate('email'); }}
                    onBlur={() => validate('email')}
                    className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                    required
                  />
                </div>
                {errors.email && (
                  <p className={styles.errorMsg}>
                    <AlertTriangle className={styles.errorIcon} />
                    {errors.email}
                  </p>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Password</label>
                <div className={styles.inputWrapper}>
                  <Lock className={styles.inputIcon} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    name={`pass-${formId}`}
                    autoComplete="new-password"
                    readOnly={isInputReadOnly}
                    onFocus={() => setIsInputReadOnly(false)}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); if (errors.password) validate('password'); }}
                    onBlur={() => validate('password')}
                    className={`${styles.input} ${styles.inputPw} ${errors.password ? styles.inputError : ''}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={styles.togglePassword}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className={styles.errorMsg}>
                    <AlertTriangle className={styles.errorIcon} />
                    {errors.password}
                  </p>
                )}
              </div>

              {authError && (
                <div className={styles.authError}>
                  <AlertTriangle className={styles.authErrorIcon} />
                  <span>{authError}</span>
                </div>
              )}

              <div className={styles.row}>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => handleRememberToggle(e.target.checked)}
                    className={styles.checkboxInput}
                  />
                  <span className={styles.checkboxLabel}>Ingat Saya</span>
                </label>
                <button type="button" className={styles.forgotLink} onClick={() => { setFpEmail(email); setMode('forgot'); }}>
                  Lupa Password?
                </button>
              </div>

              <button type="submit" disabled={!isFormValid} className={styles.submitBtn}>
                {isLoading ? (
                  <>
                    <div className={styles.spinner} />
                    <span>Memverifikasi...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ────── REGISTER FORM ────── */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className={styles.form}>
              {regSuccess ? (
                <div className={styles.successBox}>
                  <CheckCircle className={styles.successIcon} />
                  <p className={styles.successTitle}>Pendaftaran Berhasil</p>
                  <p className={styles.successDesc}>
                    Email konfirmasi telah dikirim ke <strong>{regEmail}</strong>.
                    Silakan cek inbox Anda untuk mengaktifkan akun.
                  </p>
                  <button type="button" onClick={resetToLogin} className={styles.submitBtn} style={{ marginTop: '1rem' }}>
                    Kembali ke Login
                  </button>
                </div>
              ) : (
                <>
                  <div className={styles.field}>
                    <label className={styles.label}>Nama</label>
                    <div className={styles.inputWrapper}>
                      <User className={styles.inputIcon} />
                      <input
                        type="text"
                        placeholder="Nama lengkap"
                        autoComplete="name"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className={styles.input}
                        required
                      />
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Email</label>
                    <div className={styles.inputWrapper}>
                      <Mail className={styles.inputIcon} />
                      <input
                        type="email"
                        placeholder="email@contoh.com"
                        autoComplete="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className={styles.input}
                        required
                      />
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Password</label>
                    <div className={styles.inputWrapper}>
                      <Lock className={styles.inputIcon} />
                      <input
                        type={regShowPassword ? 'text' : 'password'}
                        placeholder="Minimal 6 karakter"
                        autoComplete="new-password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className={`${styles.input} ${styles.inputPw}`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setRegShowPassword(!regShowPassword)}
                        className={styles.togglePassword}
                        tabIndex={-1}
                        aria-label={regShowPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                      >
                        {regShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Konfirmasi Password</label>
                    <div className={styles.inputWrapper}>
                      <Lock className={styles.inputIcon} />
                      <input
                        type={regShowConfirm ? 'text' : 'password'}
                        placeholder="Ulangi password"
                        autoComplete="new-password"
                        value={regConfirm}
                        onChange={(e) => setRegConfirm(e.target.value)}
                        className={`${styles.input} ${styles.inputPw}`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setRegShowConfirm(!regShowConfirm)}
                        className={styles.togglePassword}
                        tabIndex={-1}
                        aria-label={regShowConfirm ? 'Sembunyikan password' : 'Tampilkan password'}
                      >
                        {regShowConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {regError && (
                    <div className={styles.authError}>
                      <AlertTriangle className={styles.authErrorIcon} />
                      <span>{regError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={regLoading || regCooldown}
                    className={styles.submitBtn}
                  >
                    {regLoading ? (
                      <>
                        <Loader2 className={styles.spinnerInBtn} />
                        <span>Mendaftarkan...</span>
                      </>
                    ) : (
                      <>
                        <span>Daftar</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className={styles.registerSection}>
                    <p className={styles.registerText}>
                      Sudah punya akun?{' '}
                      <button type="button" className={styles.registerLink} onClick={resetToLogin}>
                        Masuk
                      </button>
                    </p>
                  </div>
                </>
              )}
            </form>
          )}

          {/* ────── FORGOT PASSWORD FORM ────── */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgot} className={styles.form}>
              <button type="button" onClick={resetToLogin} className={styles.backLink}>
                <ArrowLeft className="w-3.5 h-3.5" />
                Kembali
              </button>

              <p className={styles.modalTitle}>Lupa Password</p>
              <p className={styles.modalDesc}>
                Masukkan email Anda dan kami akan mengirimkan tautan untuk mereset password.
              </p>

              {fpSuccess ? (
                <div className={styles.successBox}>
                  <CheckCircle className={styles.successIcon} />
                  <p className={styles.successTitle}>Email Terkirim</p>
                  <p className={styles.successDesc}>
                    Tautan reset password telah dikirim ke <strong>{fpEmail}</strong>.
                    Cek inbox Anda.
                  </p>
                  <button type="button" onClick={resetToLogin} className={styles.submitBtn} style={{ marginTop: '1rem' }}>
                    Kembali ke Login
                  </button>
                </div>
              ) : (
                <>
                  <div className={styles.field}>
                    <label className={styles.label}>Email</label>
                    <div className={styles.inputWrapper}>
                      <Mail className={styles.inputIcon} />
                      <input
                        type="email"
                        placeholder="email@contoh.com"
                        autoComplete="email"
                        value={fpEmail}
                        onChange={(e) => setFpEmail(e.target.value)}
                        className={styles.input}
                        required
                      />
                    </div>
                  </div>

                  {fpError && (
                    <div className={styles.authError}>
                      <AlertTriangle className={styles.authErrorIcon} />
                      <span>{fpError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={fpLoading || !fpEmail.includes('@')}
                    className={styles.submitBtn}
                  >
                    {fpLoading ? (
                      <>
                        <Loader2 className={styles.spinnerInBtn} />
                        <span>Mengirim...</span>
                      </>
                    ) : (
                      'Kirim Tautan Reset'
                    )}
                  </button>
                </>
              )}
            </form>
          )}

          {/* Footer — only shown on login mode */}
          {mode === 'login' && (
            <div className={styles.registerSection}>
              <p className={styles.registerText}>
                Belum punya akun?{' '}
                <button type="button" className={styles.registerLink} onClick={() => { setRegEmail(''); setMode('register'); }}>
                  Daftar
                </button>
              </p>
            </div>
          )}

          <p className={styles.version}>v1.0.0 — Tollytics</p>
        </Card>
      </div>
    </div>
  );
}
