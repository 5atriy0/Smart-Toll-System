'use client';

import { useAnalytics } from '@/hooks/useAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Webhook, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

export function GateStatus() {
  const { esp32Status } = useAnalytics();
  
  const getStatusConfig = () => {
    switch (esp32Status) {
      case 'Online':
        return { color: 'bg-success', textColor: 'text-success', text: 'ONLINE', icon: <CheckCircle2 className="h-10 w-10 text-success mb-2" />, shadow: 'shadow-[0_0_15px_rgba(34,197,94,0.5)]' };
      case 'Error':
        return { color: 'bg-warning', textColor: 'text-warning', text: 'EROR', icon: <AlertCircle className="h-10 w-10 text-warning mb-2 animate-pulse" />, shadow: 'shadow-[0_0_15px_rgba(245,158,11,0.5)]' };
      case 'Offline':
      default:
        return { color: 'bg-danger', textColor: 'text-danger', text: 'OFFLINE', icon: <XCircle className="h-10 w-10 text-danger mb-2" />, shadow: 'shadow-[0_0_15px_rgba(239,68,68,0.5)]' };
    }
  };

  const config = getStatusConfig();

  return (
    <Card className="col-span-1 relative overflow-hidden border-border/50 bg-card hover:bg-white/5 transition-colors">
      <div className={`absolute -top-10 -right-10 w-40 h-40 blur-3xl opacity-20 rounded-full ${config.color}`} />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className="text-sm font-medium text-muted-foreground">Status Gateway Real-time</CardTitle>
        <Webhook className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="relative z-10 flex flex-col items-center justify-center py-6">
        {config.icon}
        <div className={`text-3xl font-bold tracking-widest ${config.textColor}`}>
          {config.text}
        </div>
        <p className="text-xs text-muted-foreground mt-1">Mikrokontroler Node ESP32</p>
        
        <div className="mt-6 flex w-full gap-2">
          <div className={`h-1.5 w-full rounded-full transition-colors duration-1000 ${esp32Status === 'Online' ? `bg-success ${config.shadow}` : 'bg-muted'}`} />
          <div className={`h-1.5 w-full rounded-full transition-colors duration-1000 ${esp32Status === 'Error' ? `bg-warning ${config.shadow}` : 'bg-muted'}`} />
          <div className={`h-1.5 w-full rounded-full transition-colors duration-1000 ${esp32Status === 'Offline' ? `bg-danger ${config.shadow}` : 'bg-muted'}`} />
        </div>
        <div className="flex w-full justify-between mt-2 text-[10px] text-muted-foreground/70 uppercase font-mono">
          <span>Online</span>
          <span>Eror</span>
          <span>Offline</span>
        </div>
      </CardContent>
    </Card>
  );
}
