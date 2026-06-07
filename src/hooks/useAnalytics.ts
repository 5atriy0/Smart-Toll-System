"use client";

import { useState, useEffect } from "react";
import {
  getDashboardStats,
  getHourlyAnalytics,
  getRevenue,
  getVehiclesInOut,
  getAvgSpeed,
  getTravelTime,
} from "@/services/analyticsService";
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
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();

    const [s, rev, hourly, vInOut, speed, travel, tSpeed, tDuration] = await Promise.all([
      getDashboardStats(),
      getRevenue(),
      getHourlyAnalytics(),
      getVehiclesInOut(),
      getAvgSpeed(),
      getTravelTime(),
      getAvgSpeed(todayStr),
      getTravelTime(todayStr),
    ]);

    setStats(s);
    setTrendData(Array.isArray(rev) ? rev : []);
    setHourlyData(Array.isArray(hourly) ? hourly : []);
    setVehiclesInOut(Array.isArray(vInOut) ? vInOut : []);
    setAvgSpeed(Array.isArray(speed) ? speed : []);
    setTravelTime(Array.isArray(travel) ? travel : []);
    setTodayAvgSpeed(tSpeed?.[0]?.speed ?? 0);
    setTodayAvgDuration(tDuration?.[0]?.time ?? 0);
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
