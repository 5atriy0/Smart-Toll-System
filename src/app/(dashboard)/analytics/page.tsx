import { AnalyticsOverview } from '@/components/dashboard/AnalyticsOverview'
import { GateStatus } from '@/components/dashboard/GateStatus'
import { LiveSensorFeed } from '@/components/dashboard/LiveSensorFeed'
import { VisualIndicators } from '@/components/dashboard/VisualIndicators'

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Big Data Analytics</h1>
        <p className="text-muted-foreground text-sm">Deep insights and sensor status from across the entire toll network.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <GateStatus />
        <LiveSensorFeed />
        <VisualIndicators />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <AnalyticsOverview />
      </div>
    </div>
  )
}
