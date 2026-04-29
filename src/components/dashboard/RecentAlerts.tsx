'use client';

import { useAnalytics } from '@/hooks/useAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, AlertTriangle, Info, AlertCircle } from 'lucide-react';

export function RecentAlerts() {
  const { recentAlerts } = useAnalytics();

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-danger" />;
      case 'info':
      default:
        return <Info className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <Card className="col-span-1 border-border/50 bg-card hover:bg-white/5 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Peringatan & Notifikasi Terbaru</CardTitle>
        <Bell className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mt-2">
          {recentAlerts.map((alert) => (
            <div key={alert.id} className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
              <div className={`mt-0.5 p-1 rounded-full ${
                alert.type === 'warning' ? 'bg-warning/10' : 
                alert.type === 'error' ? 'bg-danger/10' : 'bg-primary/10'
              }`}>
                {getAlertIcon(alert.type)}
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none text-foreground">{alert.message}</p>
                <p className="text-xs text-muted-foreground">{alert.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
