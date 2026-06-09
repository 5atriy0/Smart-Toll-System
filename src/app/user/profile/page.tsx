'use client';

import { ProfileView } from '@/views/ProfileView'
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function UserProfilePage() {
  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <Link href="/user" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 bg-secondary/50 hover:bg-secondary px-3 py-1.5 rounded-md">
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Profil Pengguna</h1>
        <p className="text-sm text-muted-foreground mt-1">Kelola informasi akun Anda</p>
      </div>
      <ProfileView />
    </div>
  );
}
