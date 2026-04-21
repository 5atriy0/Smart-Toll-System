'use client';

import { MOCK_VEHICLES_IN_OUT, MOCK_VEHICLES_INSIDE, MOCK_AVG_SPEED, MOCK_TRAVEL_TIME } from '@/lib/constants'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, Legend } from 'recharts'

export function AnalyticsOverview() {
  return (
    <Card className="col-span-1 border-primary/20">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-foreground">Toll Traffic Analytics</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-4">
        
        {/* Vehicles In/Out - Bar Chart */}
        <div className="h-64 flex flex-col">
          <h4 className="text-sm text-muted-foreground mb-4 font-medium text-center">Kendaraan Masuk & Keluar Tol (Per Hari)</h4>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MOCK_VEHICLES_IN_OUT}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a303c" vertical={false} />
              <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
              <RechartsTooltip cursor={{fill: '#1f2937'}} contentStyle={{backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '0.5rem'}} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="in" name="Masuk" fill="hsl(212, 100%, 48%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="out" name="Keluar" fill="hsl(154, 61%, 43%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Vehicles Inside - Area Chart */}
        <div className="h-64 flex flex-col">
          <h4 className="text-sm text-muted-foreground mb-4 font-medium text-center">Kendaraan di Dalam Tol</h4>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MOCK_VEHICLES_INSIDE}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a303c" vertical={false} />
              <XAxis dataKey="time" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
              <RechartsTooltip contentStyle={{backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '0.5rem'}} />
              <Area type="monotone" dataKey="count" name="Jumlah" stroke="hsl(280, 100%, 60%)" fill="hsl(280, 100%, 60%)" fillOpacity={0.2} strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Average Speed - Line Chart */}
        <div className="h-64 flex flex-col">
          <h4 className="text-sm text-muted-foreground mb-4 font-medium text-center">Rata-rata Kecepatan (km/jam)</h4>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={MOCK_AVG_SPEED}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a303c" vertical={false} />
              <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis domain={['dataMin - 10', 'dataMax + 10']} stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
              <RechartsTooltip contentStyle={{backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '0.5rem'}} />
              <Line type="monotone" dataKey="speed" name="Kecepatan (km/jam)" stroke="hsl(35, 100%, 50%)" strokeWidth={3} dot={{r: 4, fill: '#111827', strokeWidth: 2}} activeDot={{r: 6}} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Travel Time - Line Chart */}
        <div className="h-64 flex flex-col">
          <h4 className="text-sm text-muted-foreground mb-4 font-medium text-center">Waktu Tempuh (menit)</h4>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={MOCK_TRAVEL_TIME}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a303c" vertical={false} />
              <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis domain={['dataMin - 10', 'dataMax + 10']} stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
              <RechartsTooltip contentStyle={{backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '0.5rem'}} />
              <Line type="monotone" dataKey="time" name="Waktu Tempuh (mnt)" stroke="hsl(0, 84%, 60%)" strokeWidth={3} dot={{r: 4, fill: '#111827', strokeWidth: 2}} activeDot={{r: 6}} />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </CardContent>
    </Card>
  )
}
