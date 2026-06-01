"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/services/supabaseClient";
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

  const fetchAll = async () => {
    const [s, rev, hourly, vInOut, speed, travel] = await Promise.all([
      getDashboardStats(),
      getRevenue(),
      getHourlyAnalytics(),
      getVehiclesInOut(),
      getAvgSpeed(),
      getTravelTime(),
    ]);

    setStats(s);
    setTrendData(Array.isArray(rev) ? rev : []);
    setHourlyData(Array.isArray(hourly) ? hourly : []);
    setVehiclesInOut(Array.isArray(vInOut) ? vInOut : []);
    setAvgSpeed(Array.isArray(speed) ? speed : []);
    setTravelTime(Array.isArray(travel) ? travel : []);
  };

  useEffect(() => {
    fetchAll();

    let timeout: any;
    const channelName = `analytics-rt-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transactions" },
        () => {
          clearTimeout(timeout);
          timeout = setTimeout(fetchAll, 300);
        }
      )
      .subscribe();

    return () => {
      clearTimeout(timeout);
      supabase.removeChannel(channel);
    };
  }, []);

  const todayMetrics = {
    totalVehicles: stats?.total_transactions ?? 0,
    vehiclesTrend: "+0%",
    revenue: stats?.today_revenue ?? 0,
    revenueTrend: "+0%",
    activeUsers: stats?.total_users ?? 0,
    usersTrend: "+0",
    avgSpeed:
      avgSpeed.length > 0
        ? avgSpeed.reduce((acc: number, d: any) => acc + d.speed, 0) /
          avgSpeed.length
        : 0,
    avgDuration:
      travelTime.length > 0
        ? travelTime.reduce((acc: number, d: any) => acc + d.time, 0) /
          travelTime.length
        : 0,
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
  };
};
