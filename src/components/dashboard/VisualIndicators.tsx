'use client';

import { useAnalytics } from '@/hooks/useAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ActivitySquare, CircleDot } from 'lucide-react';

export function VisualIndicators() {
  const { esp32Status } = useAnalytics();
  const activeLED = esp32Status === 'Online' ? 'green' : 'red';

  return (
    <Card className="col-span-1 border-primary/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">LED & Alarm Virtual</CardTitle>
        <ActivitySquare className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-around h-full mt-6">
          <div className="flex flex-col items-center gap-3">
            <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${activeLED === 'red' ? 'border-danger/50 bg-danger shadow-[0_0_20px_rgba(239,68,68,0.5)]' : 'border-danger/10 bg-danger/20'}`}>
              <CircleDot className={`h-6 w-6 ${activeLED === 'red' ? 'text-white' : 'text-danger/50'}`} />
            </div>
            <span className="text-xs font-medium text-muted-foreground">LED M</span>
          </div>

          <div className="flex flex-col items-center gap-3">
            <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${activeLED === 'green' ? 'border-success/50 bg-success shadow-[0_0_20px_rgba(34,197,94,0.5)]' : 'border-success/10 bg-success/20'}`}>
              <CircleDot className={`h-6 w-6 ${activeLED === 'green' ? 'text-white' : 'text-success/50'}`} />
            </div>
            <span className="text-xs font-medium text-muted-foreground">LED H</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
