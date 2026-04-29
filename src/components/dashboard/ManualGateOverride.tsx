'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings2, Unlock, Lock, AlertOctagon } from 'lucide-react';

export function ManualGateOverride() {
  const [gateStatus, setGateStatus] = useState<'Terkunci' | 'Terbuka'>('Terkunci');
  const [isProcessing, setIsProcessing] = useState(false);

  const toggleGate = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setGateStatus(prev => prev === 'Terkunci' ? 'Terbuka' : 'Terkunci');
      setIsProcessing(false);
    }, 1000); // Simulate network delay
  };

  return (
    <Card className="col-span-1 border-border/50 bg-card hover:bg-white/5 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Kontrol Gerbang Manual</CardTitle>
        <Settings2 className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-4 space-y-4">
          <div className={`p-4 rounded-full ${gateStatus === 'Terbuka' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'} transition-colors duration-500`}>
            {gateStatus === 'Terbuka' ? <Unlock className="w-8 h-8" /> : <Lock className="w-8 h-8" />}
          </div>
          <div className="text-center">
            <h4 className="text-lg font-bold text-foreground capitalize">{gateStatus}</h4>
            <p className="text-xs text-muted-foreground">Kontrol Motor Servo</p>
          </div>
          
          <button
            onClick={toggleGate}
            disabled={isProcessing}
            className={`w-full py-2.5 rounded-md font-medium text-sm flex items-center justify-center gap-2 transition-all ${
              gateStatus === 'Terkunci' 
                ? 'bg-success hover:bg-success/90 text-white' 
                : 'bg-warning hover:bg-warning/90 text-white'
            } disabled:opacity-50`}
          >
            {isProcessing ? (
               <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : gateStatus === 'Terkunci' ? (
              <>
                <Unlock className="w-4 h-4" />
                Buka Gerbang
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Tutup Gerbang
              </>
            )}
          </button>
          
          <button className="w-full py-2 rounded-md font-medium text-xs text-danger hover:bg-danger/10 border border-danger/20 flex items-center justify-center gap-2 transition-colors">
            <AlertOctagon className="w-3.5 h-3.5" />
            Berhenti Darurat
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
