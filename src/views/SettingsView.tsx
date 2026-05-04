'use client';

import { SystemSettings } from '@/components/dashboard/SystemSettings'
import styles from './SettingsView.module.scss'

export function SettingsView() {
  return (
    <div className={`space-y-6 animate-in fade-in duration-500 ${styles.container}`}>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">System Settings</h1>
        <p className="text-muted-foreground text-sm">Configure IoT hardware connections and global parameters.</p>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <SystemSettings />
      </div>
    </div>
  )
}
