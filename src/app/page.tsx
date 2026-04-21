import { UserManagement } from '@/components/dashboard/UserManagement'
import { TransactionLogs } from '@/components/dashboard/TransactionLogs'
import { AnalyticsOverview } from '@/components/dashboard/AnalyticsOverview'

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard Overview</h1>
        <p className="text-muted-foreground text-sm">Real-time monitoring and analytics for the Smart Toll System.</p>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <AnalyticsOverview />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <UserManagement />
        <TransactionLogs />
      </div>
    </div>
  )
}
