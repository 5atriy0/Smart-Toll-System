'use client';

import { AnalyticsOverview } from '@/components/dashboard/AnalyticsOverview'
import { GateStatus } from '@/components/dashboard/GateStatus'
import { LiveSensorFeed } from '@/components/dashboard/LiveSensorFeed'
import { VisualIndicators } from '@/components/dashboard/VisualIndicators'
import { useAnalytics } from '@/hooks/useAnalytics'
import styles from './AnalyticsView.module.scss'

export function AnalyticsView() {
  const { trendData, hourlyData, vehiclesInOut, avgSpeed, travelTime } = useAnalytics();

  return (
    <div className={`space-y-6 ${styles.container}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <GateStatus />
        <LiveSensorFeed />
        <VisualIndicators />
      </div>

      <AnalyticsOverview
        trendData={trendData}
        hourlyData={hourlyData}
        vehiclesInOut={vehiclesInOut}
        avgSpeed={avgSpeed}
        travelTime={travelTime}
      />
    </div>
  )
}
