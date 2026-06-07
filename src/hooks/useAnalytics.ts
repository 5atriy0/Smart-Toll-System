"use client";

import { useState, useEffect } from "react";
import { getFullDashboard } from "@/services/analyticsService";
import type { DashboardStats } from "@/types/supabase";

export const useAnalytics = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [hourlyData, setHourlyData] = useState<any[]>([]);
  const [vehiclesInOut, setVehiclesInOut] = useState<any[]>([]);
  const [avgSpeed, setAvgSpeed] = useState<any[]>([]);
  const [travelTime, setTravelTime] = useState<any[]>([]);
  const [todayAvgSpeed, setTodayAvgSpeed] = useState(0);
  const [todayAvgDuration, setTodayAvgDuration] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    const data = await getFullDashboard();
    if (data) {
      setStats(data.stats);
      setTrendData(Array.isArray(data.revenue_trend) ? data.revenue_trend : []);
      setHourlyData(Array.isArray(data.hourly_volume) ? data.hourly_volume : []);
      setVehiclesInOut(Array.isArray(data.vehicles_in_out) ? data.vehicles_in_out : []);
      setAvgSpeed(Array.isArray(data.avg_speed) ? data.avg_speed : []);
      setTravelTime(Array.isArray(data.travel_time) ? data.travel_time : []);
      setTodayAvgSpeed(data.stats.today_avg_speed);
      setTodayAvgDuration(data.stats.today_avg_duration);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const todayMetrics = {
    totalVehicles: stats?.total_transactions ?? 0,
    vehiclesTrend: "+0%",
    revenue: stats?.today_revenue ?? 0,
    revenueTrend: "+0%",
    activeUsers: stats?.total_users ?? 0,
    usersTrend: "+0",
    avgSpeed: todayAvgSpeed,
    avgDuration: todayAvgDuration,
  };

  const recentAlerts = [
    { id: 1, type: "info" as const, message: "Sistem berjalan normal", time: "1 jam lalu" },
  ];

  const systemLogs = [
    { time: new Date().toLocaleTimeString(), message: "Sistem aktif" },
  ];

  return {
    trendData,
    hourlyData,
    vehiclesInOut,
    avgSpeed,
    travelTime,
    todayMetrics,
    recentAlerts,
    systemLogs,
    esp32Status: "Online" as const,
    loading,
  };
};
