'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, Legend, PieChart, Pie, Cell } from 'recharts';

type Props = {
  trendData: any[];
  hourlyData: any[];
  vehiclesInOut: any[];
  avgSpeed: any[];
  travelTime: any[];
}

function ChartEmpty({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
      {message}
    </div>
  );
}

export function AnalyticsOverview({ trendData, hourlyData, vehiclesInOut, avgSpeed, travelTime }: Props) {

  return (
    <Card className="col-span-1 border-primary/20">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-foreground">Analisis Lalu Lintas & Pendapatan Tol</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-4">

        {/* Traffic Density Chart - Line Chart */}
        <div className="lg:col-span-2 h-80 flex flex-col mb-4 bg-background/50 p-4 rounded-xl border border-border/50">
          <h4 className="text-sm text-foreground mb-4 font-semibold">Kepadatan Lalu Lintas (Kendaraan per Jam)</h4>
          {!hourlyData || hourlyData.length === 0 ? (
            <ChartEmpty message="Belum ada data hari ini" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a303c" vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip contentStyle={{backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '0.5rem'}} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="volume" name="Kendaraan" stroke="hsl(35, 100%, 50%)" strokeWidth={3} dot={{r: 4, fill: '#111827', strokeWidth: 2}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* System Overview - Pie Chart */}
        <div className="h-80 flex flex-col mb-4 bg-background/50 p-4 rounded-xl border border-border/50">
          <h4 className="text-sm text-foreground mb-4 font-semibold">Ringkasan Data</h4>
          {!trendData || trendData.length === 0 ? (
            <ChartEmpty message="Belum ada data" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Terselesaikan', value: trendData.reduce((a: number, d: any) => a + d.revenue, 0) || 1 },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="hsl(154, 61%, 43%)" />
                </Pie>
                <RechartsTooltip contentStyle={{backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '0.5rem'}} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Revenue Trend - Bar Chart */}
        <div className="lg:col-span-3 h-80 flex flex-col mb-4 bg-background/50 p-4 rounded-xl border border-border/50">
          <h4 className="text-sm text-foreground mb-4 font-semibold">Tren Pendapatan</h4>
          {!trendData || trendData.length === 0 ? (
            <ChartEmpty message="Belum ada data pendapatan" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a303c" vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `Rp${value/1000}k`} />
                <RechartsTooltip cursor={{fill: '#1f2937'}} contentStyle={{backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '0.5rem'}} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="revenue" name="Pendapatan (Rp)" fill="hsl(212, 100%, 48%)" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Vehicles In/Out - Bar Chart */}
        <div className="h-64 flex flex-col bg-background/50 p-4 rounded-xl border border-border/50">
          <h4 className="text-sm text-foreground mb-4 font-semibold text-center">Lalu Lintas Masuk/Keluar (Harian)</h4>
          {!vehiclesInOut || vehiclesInOut.length === 0 ? (
            <ChartEmpty message="Belum ada data" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vehiclesInOut}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a303c" vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip cursor={{fill: '#1f2937'}} contentStyle={{backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '0.5rem'}} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="in" name="Masuk" fill="hsl(212, 100%, 48%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="out" name="Keluar" fill="hsl(154, 61%, 43%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Average Speed - Line Chart */}
        <div className="h-64 flex flex-col bg-background/50 p-4 rounded-xl border border-border/50">
          <h4 className="text-sm text-foreground mb-4 font-semibold text-center">Kecepatan Rata-rata (km/jam)</h4>
          {!avgSpeed || avgSpeed.length === 0 ? (
            <ChartEmpty message="Belum ada data" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={avgSpeed}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a303c" vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis domain={['dataMin - 10', 'dataMax + 10']} stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip contentStyle={{backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '0.5rem'}} />
                <Line type="monotone" dataKey="speed" name="Kecepatan (km/jam)" stroke="hsl(35, 100%, 50%)" strokeWidth={3} dot={{r: 4, fill: '#111827', strokeWidth: 2}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Travel Time - Line Chart */}
        <div className="h-64 flex flex-col bg-background/50 p-4 rounded-xl border border-border/50">
          <h4 className="text-sm text-foreground mb-4 font-semibold text-center">Waktu Tempuh (menit)</h4>
          {!travelTime || travelTime.length === 0 ? (
            <ChartEmpty message="Belum ada data" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={travelTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a303c" vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis domain={['dataMin - 10', 'dataMax + 10']} stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip contentStyle={{backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '0.5rem'}} />
                <Line type="monotone" dataKey="time" name="Waktu (mnt)" stroke="hsl(0, 84%, 60%)" strokeWidth={3} dot={{r: 4, fill: '#111827', strokeWidth: 2}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

      </CardContent>
    </Card>
  );
}
