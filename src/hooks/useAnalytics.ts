"use client";

import { useState, useEffect } from "react";
import { getFullDashboard } from "@/services/analyticsService";
import { getTransactions } from "@/services/transactionService";

function computeDateFrom(range: string): string | undefined {
  const now = new Date();
  if (range === "Hari Ini") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  }
  if (range === "7 Hari Terakhir") {
    const d = new Date(); d.setDate(now.getDate() - 7); return d.toISOString();
  }
  if (range === "Bulan Ini") {
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  }
  return undefined;
}

const DATE_LABELS: Record<string, string> = {
  "Hari Ini": "Hari Ini",
  "7 Hari Terakhir": "7 Hari",
  "Bulan Ini": "Bulan Ini",
  "Semua Waktu": "Semua Waktu",
};

export const useAnalytics = (dateRange: string = "Hari Ini") => {
  const [stats, setStats] = useState<{
    totalUsers: number;
    totalVehicles: number;
    revenue: number;
    avgSpeed: number;
    avgDuration: number;
  }>({ totalUsers: 0, totalVehicles: 0, revenue: 0, avgSpeed: 0, avgDuration: 0 });
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    const [dashboardData, txResult] = await Promise.all([
      getFullDashboard(),
      getTransactions({ dateFrom: computeDateFrom(dateRange), limit: 5000 }),
    ]);

    const txList = txResult?.data || [];
    const filteredRevenue = txList.reduce((sum, tx) => sum + (tx.fee || 0), 0);

    const txWithSpeed = txList.filter((tx) => tx.average_speed != null);
    const filteredAvgSpeed = txWithSpeed.length > 0
      ? txWithSpeed.reduce((sum, tx) => sum + tx.average_speed, 0) / txWithSpeed.length
      : dateRange === "Hari Ini" ? dashboardData?.stats.today_avg_speed || 0 : 0;

    const txWithDuration = txList.filter((tx) => tx.duration_minutes != null);
    const filteredAvgDuration = txWithDuration.length > 0
      ? txWithDuration.reduce((sum, tx) => sum + tx.duration_minutes, 0) / txWithDuration.length
      : dateRange === "Hari Ini" ? dashboardData?.stats.today_avg_duration || 0 : 0;

    setStats({
      totalUsers: dashboardData?.stats.total_users ?? 0,
      totalVehicles: dashboardData?.stats.total_vehicles ?? 0,
      revenue: filteredRevenue,
      avgSpeed: filteredAvgSpeed,
      avgDuration: filteredAvgDuration,
    });
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, [dateRange]);

  const tf = DATE_LABELS[dateRange] || dateRange;

  const todayMetrics = {
    totalUsers: stats.totalUsers,
    totalVehicles: stats.totalVehicles,
    revenue: stats.revenue,
    avgSpeed: stats.avgSpeed,
    avgDuration: stats.avgDuration,
    userLabel: "Total Pengguna",
    revenueLabel: `Pendapatan (${tf})`,
    vehicleLabel: "Kendaraan Terdaftar",
    speedLabel: `Kecepatan Rata-rata (${tf})`,
    durationLabel: `Waktu Tempuh (${tf})`,
  };

  const recentAlerts = [
    { id: 1, type: "info" as const, message: "Sistem berjalan normal", time: "1 jam lalu" },
  ];

  const systemLogs = [
    { time: new Date().toLocaleTimeString(), message: "Sistem aktif" },
  ];

  return {
    todayMetrics,
    recentAlerts,
    systemLogs,
    esp32Status: "Online" as const,
    loading,
  };
};
