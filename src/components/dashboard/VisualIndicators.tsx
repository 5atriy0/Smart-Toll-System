'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ActivitySquare, BellRing, CircleDot } from 'lucide-react'

export function VisualIndicators() {
  const isBuzzerActive = false
  const activeLED = 'red' // 'red', 'green', 'off'

  return (
    <Card className="col-span-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Virtual LEDs & Alarms</CardTitle>
        <ActivitySquare className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-around h-full mt-6">
          <div className="flex flex-col items-center gap-3">
            <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${activeLED === 'red' ? 'border-danger/50 bg-danger shadow-[0_0_20px_rgba(255,50,50,0.5)]' : 'border-danger/10 bg-danger/20'}`}>
              <CircleDot className={`h-6 w-6 ${activeLED === 'red' ? 'text-white' : 'text-danger/50'}`} />
            </div>
            <span className="text-xs font-medium text-muted-foreground">LED R</span>
          </div>

          <div className="flex flex-col items-center gap-3">
            <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${activeLED === 'green' ? 'border-success/50 bg-success shadow-[0_0_20px_rgba(50,255,50,0.5)]' : 'border-success/10 bg-success/20'}`}>
              <CircleDot className={`h-6 w-6 ${activeLED === 'green' ? 'text-white' : 'text-success/50'}`} />
            </div>
            <span className="text-xs font-medium text-muted-foreground">LED G</span>
          </div>

          <div className="flex flex-col items-center gap-3">
            <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${isBuzzerActive ? 'border-orange-500/50 bg-orange-500 animate-pulse' : 'border-muted bg-card'}`}>
              <BellRing className={`h-6 w-6 ${isBuzzerActive ? 'text-white animate-bounce' : 'text-muted-foreground'}`} />
            </div>
            <span className="text-xs font-medium text-muted-foreground">Buzzer</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
