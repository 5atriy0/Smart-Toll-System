'use client';

import { ProfileView } from '@/views/ProfileView'

export default function UserProfilePage() {
  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Profil Pengguna</h1>
        <p className="text-sm text-muted-foreground mt-1">Kelola informasi akun Anda</p>
      </div>
      <ProfileView />
    </div>
  );
}
