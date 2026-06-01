'use client';

import { useTransactions } from '@/hooks/useTransactions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ActivitySquare, Wifi, ArrowLeftFromLine, ArrowRightFromLine } from 'lucide-react';

export function LiveSensorFeed() {
  const { logs } = useTransactions();
  const recentLogs = logs.slice(0, 5);

  return (
    <Card className="col-span-1 border-primary/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Log Sensor ESP32</CardTitle>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
          <span className="text-xs text-muted-foreground">Online</span>
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
            {recentLogs.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-4">
                Belum ada data sensor
              </div>
            ) : (
              recentLogs.map((log) => {
                const parts = log.loc.split(' → ');
                const isEntry = log.status === 'DI PERJALANAN';
                const waktu = new Date(log.rawTime).toLocaleTimeString('id-ID');

                return (
                  <div key={log.id} className="flex gap-3 text-sm">
                    <span className="text-muted-foreground font-mono whitespace-nowrap">{waktu}</span>
                    <div className="flex items-start gap-2">
                      {isEntry ? (
                        <ArrowLeftFromLine className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                      ) : (
                        <ArrowRightFromLine className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                      )}
                      <span className="text-foreground">
                        RFID {log.rfid} — {isEntry ? `Masuk ${parts[0]}` : `Keluar ${parts[1] === '-' ? parts[0] : parts[1]}`}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
