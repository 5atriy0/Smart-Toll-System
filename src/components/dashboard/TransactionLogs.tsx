'use client';

import { MOCK_TRANSACTIONS } from '@/lib/constants'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Filter } from 'lucide-react'

export function TransactionLogs() {
  return (
    <Card className="col-span-1 border-primary/20">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium text-foreground">Transaction Logs</CardTitle>
        <button className="flex items-center gap-2 border border-border hover:bg-white/5 text-foreground px-3 py-1.5 rounded-md text-sm transition-colors">
          <Filter className="w-4 h-4" />
          <span>Filter</span>
        </button>
      </CardHeader>
      <CardContent>
        <div className="relative overflow-x-auto mt-2">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Timestamp</th>
                <th className="px-4 py-3">RFID ID</th>
                <th className="px-4 py-3">Plate No</th>
                <th className="px-4 py-3">Gate</th>
                <th className="px-4 py-3 rounded-tr-lg">Status</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_TRANSACTIONS.map((tx, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{tx.time}</td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">{tx.rfid}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{tx.plate}</td>
                  <td className="px-4 py-3 text-muted-foreground">{tx.loc}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${tx.status === 'Granted' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
