'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Phone, MapPin, FileText, LogOut, Activity } from 'lucide-react'
import { useRouter } from 'next/navigation'
import styles from './ProfileView.module.scss'

export function ProfileView() {
  const router = useRouter();
  
  // Admin profile data
  const adminUser = {
    name: 'Admin',
    email: 'admin@smarttoll.com',
    phone: '+62 812 3456 7890',
    location: 'Jakarta Timur',
    role: 'Pengguna Super',
    status: 'Active',
    joinDate: '01 Januari 2024'
  };

  const handleLogout = () => {
    router.push('/login');
  };

  return (
    <div className={`space-y-6 animate-in fade-in duration-500 ${styles.container}`}>
      {/* Header Section */}
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Profil Admin</h1>
        <p className="text-muted-foreground text-sm">Kelola informasi akun admin dan pengaturan sistem.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1">
          <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-primary/10 overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex flex-col items-center gap-4">
                <div className={`w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center border-4 border-primary/20 ${styles.profileAvatar}`}>
                  <span className="text-3xl font-bold text-primary-foreground">
                    A
                  </span>
                </div>
                <div className="text-center">
                  <h2 className="text-xl font-bold text-foreground">{adminUser.name}</h2>
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
                    <span className={`w-2 h-2 rounded-full ${adminUser.status === 'Active' ? 'bg-success' : 'bg-destructive'}`} />
                    {adminUser.role}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Status Info */}
              <div className={`p-4 rounded-lg bg-background/50 border border-success/20 ${styles.statusCard}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Activity className="w-4 h-4 text-success" />
                    Status Sistem
                  </span>
                  <span className="text-sm font-bold text-success">{adminUser.status}</span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-background/50 border border-border/50 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Bergabung</p>
                  <p className="text-sm font-bold text-foreground">{adminUser.joinDate}</p>
                </div>
                <div className="p-3 rounded-lg bg-background/50 border border-border/50 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Role</p>
                  <p className="text-sm font-bold text-primary">Admin</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 gap-2 pt-4">
                <button onClick={handleLogout} className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-border bg-background hover:bg-muted transition-colors text-sm font-medium text-foreground ${styles.actionBtn}`}>
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
                Informasi Akun Admin
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={styles.infoField}>
                  <label className="text-sm text-muted-foreground mb-2 block">Nama</label>
                  <p className="text-foreground font-medium">{adminUser.name}</p>
                </div>
                <div className={styles.infoField}>
                  <label className="text-sm text-muted-foreground mb-2 block">Email</label>
                  <p className="text-foreground font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />
                    {adminUser.email}
                  </p>
                </div>
                <div className={styles.infoField}>
                  <label className="text-sm text-muted-foreground mb-2 block">Nomor Telepon</label>
                  <p className="text-foreground font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary" />
                    {adminUser.phone}
                  </p>
                </div>
                <div className={styles.infoField}>
                  <label className="text-sm text-muted-foreground mb-2 block">Lokasi</label>
                  <p className="text-foreground font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    {adminUser.location}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>


        </div>
      </div>
    </div>
  )
}
