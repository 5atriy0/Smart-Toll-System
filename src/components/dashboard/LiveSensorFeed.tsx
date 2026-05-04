'use client';

import { useAnalytics } from '@/hooks/useAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ActivitySquare, Wifi } from 'lucide-react';

export function LiveSensorFeed() {
  const { systemLogs, esp32Status } = useAnalytics();

  return (
    <Card className="col-span-1 border-primary/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Log Sensor ESP32</CardTitle>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${esp32Status === 'Online' ? 'bg-success animate-pulse' : 'bg-danger'}`}></span>
          <span className="text-xs text-muted-foreground">{esp32Status}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
            <Wifi className="w-5 h-5 text-primary" />
            <div className="flex flex-col">
              <span className="text-sm font-medium">Node Gateway A</span>
              <span className="text-xs text-muted-foreground">Kekuatan Sinyal: Sangat Baik</span>
            </div>
          </div>
          
          <div className="space-y-3 mt-4 max-h-[200px] overflow-y-auto pr-2">
            {systemLogs.map((log, index) => (
              <div key={index} className="flex gap-3 text-sm">
                <span className="text-muted-foreground font-mono whitespace-nowrap">{log.time}</span>
                <span className="text-foreground">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
