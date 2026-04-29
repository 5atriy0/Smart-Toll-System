import { useState, useEffect } from 'react';

// Mock weekly data
const weeklyTrends = [
  { day: 'Sen', revenue: 4000, volume: 240 },
  { day: 'Sel', revenue: 3000, volume: 139 },
  { day: 'Rab', revenue: 2000, volume: 980 },
  { day: 'Kam', revenue: 2780, volume: 390 },
  { day: 'Jum', revenue: 1890, volume: 480 },
  { day: 'Sab', revenue: 2390, volume: 380 },
  { day: 'Min', revenue: 3490, volume: 430 },
];

export function useAnalytics() {
  const [trendData, setTrendData] = useState(weeklyTrends);
  const [esp32Status, setEsp32Status] = useState<'Online' | 'Offline' | 'Error'>('Online');
  const [systemLogs, setSystemLogs] = useState([
    { time: '10:45:02', message: 'Gateway ESP32 berhasil terhubung.' },
    { time: '10:48:15', message: 'Pembaca RFID disinkronkan.' }
  ]);
  
  const [recentAlerts, setRecentAlerts] = useState([
    { id: 1, type: 'warning', message: 'Halangan sensor terdeteksi > 10d di Gerbang A', time: '5 mnt lalu' },
    { id: 2, type: 'error', message: 'Pemindaian RFID tidak valid 3 kali di Gerbang B', time: '15 mnt lalu' },
    { id: 3, type: 'info', message: 'Pencadangan database harian berhasil diselesaikan', time: '1 jam lalu' },
  ]);

  const [todayMetrics, setTodayMetrics] = useState({
    totalVehicles: 420,
    vehiclesTrend: '+15%',
    revenue: 8400000,
    revenueTrend: '+8%',
    activeUsers: 1248,
    usersTrend: '+12'
  });

  useEffect(() => {
    // Simulate real-time logs coming in
    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      setSystemLogs(prev => [
        { time: timeStr, message: `Ping diterima dari Node Sensor ${Math.floor(Math.random() * 3) + 1}.` },
        ...prev
      ].slice(0, 10)); // Keep last 10 logs
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return {
    trendData,
    esp32Status,
    setEsp32Status, // To allow manual testing/toggling
    systemLogs,
    recentAlerts,
    todayMetrics
  };
}
