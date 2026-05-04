'use client';

import { User } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const pathname = usePathname();
  
  // Format the pathname to a readable title
  const getPageTitle = () => {
    if (pathname === '/') return 'Ringkasan Dasbor';
    const path = pathname.split('/')[1];
    
    // Manual mapping for some paths
    if (path === 'users') return 'Manajemen Pengguna';
    if (path === 'transactions') return 'Log Transaksi';
    if (path === 'analytics') return 'Analitik Big Data';
    if (path === 'settings') return 'Pengaturan Sistem';
    
    return path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' ');
  };

  return (
    <header className="h-16 border-b bg-card/40 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-8">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-foreground tracking-tight">
          {getPageTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 pl-6 border-l border-border/50">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-sm font-medium text-foreground">Admin</span>
            <span className="text-xs text-muted-foreground">Pengguna Super</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
            <User className="w-5 h-5" />
          </div>
        </div>
      </div>
    </header>
  );
}
