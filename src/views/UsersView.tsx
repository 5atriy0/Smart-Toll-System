'use client';

import { UserManagement } from '@/components/dashboard/UserManagement'
import styles from './UsersView.module.scss'

export function UsersView() {
  return (
    <div className={`space-y-6 ${styles.container}`}>
      <UserManagement />
    </div>
  )
}
