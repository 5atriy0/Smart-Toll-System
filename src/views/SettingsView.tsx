'use client';

import { SystemSettings } from '@/components/dashboard/SystemSettings'
import styles from './SettingsView.module.scss'

export function SettingsView() {
  return (
    <div className={`space-y-6 ${styles.container}`}>
      <SystemSettings />
    </div>
  )
}
