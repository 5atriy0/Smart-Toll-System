'use client';

import { UserManagement } from '@/components/dashboard/UserManagement'
import styles from './UsersView.module.scss'

export function UsersView() {
  return (
    <div className={`space-y-6 animate-in fade-in duration-500 ${styles.container}`}>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">User Management</h1>
        <p className="text-muted-foreground text-sm">Manage user accounts, RFID tags, and wallet balances.</p>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <UserManagement />
      </div>
    </div>
  )
}
