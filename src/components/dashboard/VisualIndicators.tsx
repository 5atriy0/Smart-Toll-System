'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ActivitySquare, CircleDot } from 'lucide-react';

export function VisualIndicators({ esp32Status }: { esp32Status: string }) {
  const isOnline = esp32Status === 'Online';

  return (
    <Card className="col-span-1 border-border shadow-sm" style={{ borderLeft: '3px solid hsl(var(--accent))' }}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">LED Indikator Virtual</CardTitle>
        <ActivitySquare className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-around mt-6">
          <div className="flex flex-col items-center gap-3">
            <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all ${isOnline ? 'border-success/50 bg-success' : 'border-danger/50 bg-danger'}`}>
              <CircleDot className={`h-6 w-6 ${isOnline ? 'text-white' : 'text-white'}`} />
            </div>
            <span className="text-xs font-medium text-muted-foreground">Status</span>
          </div>

          <div className="flex flex-col items-center gap-3">
            <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all ${isOnline ? 'border-accent/50 bg-accent' : 'border-muted bg-muted'}`}>
              <CircleDot className={`h-6 w-6 ${isOnline ? 'text-white' : 'text-muted-foreground'}`} />
            </div>
            <span className="text-xs font-medium text-muted-foreground">Aktif</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
