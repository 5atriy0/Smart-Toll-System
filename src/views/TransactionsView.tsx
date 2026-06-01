'use client';

import { TransactionLogs } from '@/components/dashboard/TransactionLogs'
import styles from './TransactionsView.module.scss'

export function TransactionsView() {
  return (
    <div className={`space-y-6 ${styles.container}`}>
      <TransactionLogs />
    </div>
  )
}
