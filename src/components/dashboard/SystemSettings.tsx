'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Server, Settings2, Wifi } from 'lucide-react'

export function SystemSettings() {
  return (
    <Card className="col-span-1 border-primary/20">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium text-foreground">System Settings & Status</CardTitle>
        <Settings2 className="w-5 h-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          
          {/* Admin Controls */}
          <div className="space-y-6">
            <h4 className="text-sm font-medium text-muted-foreground border-b border-border pb-2">Admin Overrides</h4>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-sm font-medium text-foreground">Manual Gate Override</span>
                <p className="text-xs text-muted-foreground">Force open the gate remotely.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-danger"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-sm font-medium text-foreground">Maintenance Mode</span>
                <p className="text-xs text-muted-foreground">Disable automated scans.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>

          {/* Device Status */}
          <div className="space-y-6">
            <h4 className="text-sm font-medium text-muted-foreground border-b border-border pb-2">Hardware Status</h4>
            
            <div className="flex items-center gap-4 bg-black/20 p-3 rounded-lg border border-white/5">
              <div className="p-2 bg-primary/20 rounded-md">
                <Wifi className="w-5 h-5 text-primary" />
              </div>
              <div>
                <span className="text-sm font-medium text-foreground block">ESP32 Signal Strength</span>
                <span className="text-xs text-muted-foreground">Excellent (-55 dBm)</span>
              </div>
              <div className="ml-auto text-success text-xs font-bold px-2 py-1 bg-success/20 rounded-full">
                ONLINE
              </div>
            </div>

            <div className="flex items-center gap-4 bg-black/20 p-3 rounded-lg border border-white/5">
              <div className="p-2 bg-success/20 rounded-md">
                <Server className="w-5 h-5 text-success" />
              </div>
              <div>
                <span className="text-sm font-medium text-foreground block">Database Connection</span>
                <span className="text-xs text-muted-foreground">Latency: 12ms</span>
              </div>
              <div className="ml-auto text-success text-xs font-bold px-2 py-1 bg-success/20 rounded-full">
                STABLE
              </div>
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  )
}
