'use client';

import { TransactionLogs } from '@/components/dashboard/TransactionLogs'
import styles from './TransactionsView.module.scss'

export function TransactionsView() {
  return (
    <div className={`space-y-6 animate-in fade-in duration-500 ${styles.container}`}>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Transaction Logs</h1>
        <p className="text-muted-foreground text-sm">Review real-time and historical toll gate transactions.</p>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <TransactionLogs />
      </div>
    </div>
  )
}
