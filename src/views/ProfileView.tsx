'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Phone, MapPin, Wallet, BarChart3, FileText, Settings, LogOut, Car, CreditCard, TrendingUp } from 'lucide-react'
import { useAnalytics } from '@/hooks/useAnalytics'
import { useUsers } from '@/hooks/useUsers'
import { MOCK_TRANSACTIONS } from '@/lib/constants'
import styles from './ProfileView.module.scss'

export function ProfileView() {
  const { todayMetrics } = useAnalytics();
  const { users } = useUsers();
  
  // Get the first user as current logged-in user (mock)
  const currentUser = users[0] || {
    name: 'John Doe',
    plateNumber: 'B 1234 XYZ',
    rfid: '04-89-AB-CD',
    balance: 'Rp 150.000',
    status: 'Active',
    role: 'Admin'
  };

  // Get recent transactions for this user
  const userTransactions = MOCK_TRANSACTIONS.slice(0, 3);

  return (
    <div className={`space-y-6 animate-in fade-in duration-500 ${styles.container}`}>
      {/* Header Section */}
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Profil Pengguna</h1>
        <p className="text-muted-foreground text-sm">Kelola informasi akun dan pengaturan Smart Toll Anda.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1">
          <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-primary/10 overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex flex-col items-center gap-4">
                <div className={`w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center border-4 border-primary/20 ${styles.profileAvatar}`}>
                  <span className="text-3xl font-bold text-primary-foreground">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-center">
                  <h2 className="text-xl font-bold text-foreground">{currentUser.name}</h2>
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
                    <span className={`w-2 h-2 rounded-full ${currentUser.status === 'Active' ? 'bg-success' : 'bg-destructive'}`} />
                    {currentUser.role}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Wallet Balance */}
              <div className={`p-4 rounded-lg bg-background/50 border border-success/20 ${styles.balanceCard}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-success" />
                    Saldo Dompet
                  </span>
                  <span className="text-lg font-bold text-success">{currentUser.balance}</span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-background/50 border border-border/50 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Total Transaksi</p>
                  <p className="text-lg font-bold text-foreground">24</p>
                </div>
                <div className="p-3 rounded-lg bg-background/50 border border-border/50 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Akses Berhasil</p>
                  <p className="text-lg font-bold text-success">23</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 gap-2 pt-4">
                <button className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium ${styles.actionBtn}`}>
                  <Settings className="w-4 h-4" />
                  Pengaturan
                </button>
                <button className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-border bg-background hover:bg-muted transition-colors text-sm font-medium text-foreground ${styles.actionBtn}`}>
                  <LogOut className="w-4 h-4" />
                  Keluar
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Detailed Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Information */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Informasi Akun
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={styles.infoField}>
                  <label className="text-sm text-muted-foreground mb-2 block">Nama Lengkap</label>
                  <p className="text-foreground font-medium">{currentUser.name}</p>
                </div>
                <div className={styles.infoField}>
                  <label className="text-sm text-muted-foreground mb-2 block">Email</label>
                  <p className="text-foreground font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />
                    admin@smarttoll.com
                  </p>
                </div>
                <div className={styles.infoField}>
                  <label className="text-sm text-muted-foreground mb-2 block">Nomor Telepon</label>
                  <p className="text-foreground font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary" />
                    +62 812 3456 7890
                  </p>
                </div>
                <div className={styles.infoField}>
                  <label className="text-sm text-muted-foreground mb-2 block">Lokasi</label>
                  <p className="text-foreground font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    Jakarta Timur
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vehicle & RFID Information */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="w-5 h-5 text-primary" />
                Kendaraan & RFID
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-4 rounded-lg border border-primary/20 bg-primary/5 ${styles.rfidCard}`}>
                  <label className="text-sm text-muted-foreground mb-2 block">Tag RFID</label>
                  <p className="text-lg font-mono font-bold text-primary">{currentUser.rfid}</p>
                  <p className="text-xs text-muted-foreground mt-1">ID kartu terdaftar</p>
                </div>
                <div className={`p-4 rounded-lg border border-success/20 bg-success/5 ${styles.vehicleCard}`}>
                  <label className="text-sm text-muted-foreground mb-2 block">Plat Kendaraan</label>
                  <p className="text-lg font-mono font-bold text-success">{currentUser.plateNumber}</p>
                  <p className="text-xs text-muted-foreground mt-1">Kendaraan terdaftar</p>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-background border border-border/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20">
                    {currentUser.status}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Transactions */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Transaksi Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={styles.transactionsTable}>
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">ID Transaksi</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Waktu</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Lokasi</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {userTransactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 text-sm text-foreground font-mono">{tx.id}</td>
                    <td className="py-3 px-4 text-sm text-foreground">{tx.time}</td>
                    <td className="py-3 px-4 text-sm text-foreground">{tx.loc}</td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        tx.status === 'Granted' 
                          ? 'bg-success/10 text-success border border-success/20' 
                          : 'bg-destructive/10 text-destructive border border-destructive/20'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
