'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioTower, ScanLine } from 'lucide-react'

export function LiveSensorFeed() {
  return (
    <Card className="col-span-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Live Sensors</CardTitle>
        <ScanLine className="h-4 w-4 text-primary animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between bg-black/20 p-3 rounded-lg border border-white/5">
            <div className="flex items-center gap-3">
              <RadioTower className="h-5 w-5 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Ultrasonic Dist</p>
                <p className="text-xs text-muted-foreground">HC-SR04</p>
              </div>
            </div>
            <div className="text-lg font-bold text-primary">2.4m</div>
          </div>
          
          <div className="flex items-center justify-between bg-black/20 p-3 rounded-lg border border-white/5">
            <div className="flex items-center gap-3">
              <ScanLine className="h-5 w-5 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Last RFID Tag</p>
                <p className="text-xs text-muted-foreground">MFRC522</p>
              </div>
            </div>
            <div className="text-sm font-mono text-white">04-89-AB-CD</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
