'use client';

import { MOCK_ANALYTICS_HOURLY, MOCK_ANALYTICS_RATIO, MOCK_REVENUE } from '@/lib/constants'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'

export function AnalyticsOverview() {
  return (
    <Card className="col-span-1 border-primary/20">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-foreground">Big Data Analytics</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-4">
        
        {/* Hourly Volume - Bar Chart */}
        <div className="h-64 flex flex-col">
          <h4 className="text-sm text-muted-foreground mb-4 font-medium text-center">Hourly Traffic Volume</h4>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MOCK_ANALYTICS_HOURLY}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a303c" vertical={false} />
              <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
              <RechartsTooltip cursor={{fill: '#1f2937'}} contentStyle={{backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '0.5rem'}} />
              <Bar dataKey="volume" fill="hsl(212, 100%, 48%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Valid vs Invalid - Pie Chart */}
        <div className="h-64 flex flex-col">
          <h4 className="text-sm text-muted-foreground mb-4 font-medium text-center">RFID Scan Ratio</h4>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={MOCK_ANALYTICS_RATIO}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {MOCK_ANALYTICS_RATIO.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <RechartsTooltip contentStyle={{backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '0.5rem'}} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-success"></div><span className="text-xs text-muted-foreground">Valid</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-danger"></div><span className="text-xs text-muted-foreground">Invalid</span></div>
          </div>
        </div>

        {/* Revenue Simulation - Line Chart */}
        <div className="h-64 flex flex-col">
          <h4 className="text-sm text-muted-foreground mb-4 font-medium text-center">Revenue Target</h4>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={MOCK_REVENUE}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a303c" vertical={false} />
              <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `Rp${value / 1000}k`} />
              <RechartsTooltip contentStyle={{backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '0.5rem'}} />
              <Line type="monotone" dataKey="revenue" stroke="hsl(154, 61%, 43%)" strokeWidth={3} dot={{r: 4, fill: '#111827', strokeWidth: 2}} activeDot={{r: 6}} />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </CardContent>
    </Card>
  )
}
