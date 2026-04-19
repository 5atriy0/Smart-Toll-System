'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Webhook } from 'lucide-react'

export function GateStatus() {
  // In a real app, this state would come from an IoT endpoint
  const isOpen = false

  return (
    <Card className="col-span-1 relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-20 rounded-full ${isOpen ? 'bg-success' : 'bg-danger'}`} />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Gate Status</CardTitle>
        <Webhook className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <div className="text-3xl font-bold tracking-widest text-white mt-2">
            {isOpen ? 'OPEN' : 'CLOSED'}
          </div>
          <p className="text-xs text-muted-foreground">Servo Motor #1</p>
          
          <div className="mt-4 flex gap-4">
            <div className={`h-2 w-full rounded-full ${isOpen ? 'bg-success' : 'bg-success/20'} transition-colors duration-1000`} />
            <div className={`h-2 w-full rounded-full ${!isOpen ? 'bg-danger' : 'bg-danger/20'} transition-colors duration-1000`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
