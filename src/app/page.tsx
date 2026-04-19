import { GateStatus } from '@/components/dashboard/GateStatus'
import { LiveSensorFeed } from '@/components/dashboard/LiveSensorFeed'
import { VisualIndicators } from '@/components/dashboard/VisualIndicators'
import { UserManagement } from '@/components/dashboard/UserManagement'
import { TransactionLogs } from '@/components/dashboard/TransactionLogs'
import { AnalyticsOverview } from '@/components/dashboard/AnalyticsOverview'
import { SystemSettings } from '@/components/dashboard/SystemSettings'

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard Overview</h1>
        <p className="text-muted-foreground text-sm">Real-time monitoring and analytics for the Smart Toll System.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GateStatus />
        <LiveSensorFeed />
        <VisualIndicators />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <UserManagement />
        <TransactionLogs />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <AnalyticsOverview />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <SystemSettings />
      </div>
    </div>
  )
}
