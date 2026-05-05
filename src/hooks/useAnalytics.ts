import { useTransactions } from './useTransactions';

export const useAnalytics = () => {
  const { logs } = useTransactions();

  const grouped: Record<string, { vehicles: number; revenue: number }> = {};

  logs.forEach((log) => {
    const date = new Date(log.rawTime).toLocaleDateString();

    if (!grouped[date]) {
      grouped[date] = { vehicles: 0, revenue: 0 };
    }

    grouped[date].vehicles += 1;
    grouped[date].revenue += log.tarif || 0;
  });

  const trendData = Object.keys(grouped).map((date) => ({
    date,
    vehicles: grouped[date].vehicles,
    revenue: grouped[date].revenue,
  }));


  const completedLogs = logs.filter(
    (l) => l.duration && l.speed
  );

  const avgSpeed =
    completedLogs.length > 0
      ? completedLogs.reduce((acc, l) => acc + (l.speed || 0), 0) /
        completedLogs.length
      : 0;

  const avgDuration =
    completedLogs.length > 0
      ? completedLogs.reduce((acc, l) => acc + (l.duration || 0), 0) /
        completedLogs.length
      : 0;
      
  const recentAlerts = [
    { id: 1, type: 'warning', message: 'Sensor delay di Gate A', time: '5 mnt lalu' },
    { id: 2, type: 'error', message: 'RFID gagal terbaca', time: '10 mnt lalu' },
    { id: 3, type: 'info', message: 'Sistem berjalan normal', time: '1 jam lalu' },
  ];


  return {
    trendData,
    todayMetrics: {
      totalVehicles: logs.length,
      vehiclesTrend: '+8%',
      revenue: logs.reduce((acc, l) => acc + (l.tarif || 0), 0),
      revenueTrend: '+12%',
      activeUsers: new Set(logs.map((l) => l.rfid)).size,
      usersTrend: '+5',

      avgSpeed,
      avgDuration,
    },
    recentAlerts, // 🔥 penting biar nggak error
  };
};