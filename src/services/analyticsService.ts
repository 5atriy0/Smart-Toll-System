import { supabase } from "@/services/supabaseClient";
import type { DashboardStats } from "@/types/supabase";

export interface HourlyVolume {
  name: string;
  volume: number;
}

export interface RevenueData {
  name: string;
  revenue: number;
}

export interface VehiclesInOut {
  name: string;
  in: number;
  out: number;
}

export interface AvgSpeedData {
  name: string;
  speed: number;
}

export interface TravelTimeData {
  name: string;
  time: number;
}

export async function getDashboardStats(): Promise<DashboardStats | null> {
  const { data, error } = await supabase.rpc("get_dashboard_stats");
  if (error) {
    console.error("getDashboardStats error:", error);
    return null;
  }
  return data as unknown as DashboardStats;
}

export async function getHourlyAnalytics(): Promise<HourlyVolume[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("transactions")
    .select("tap_in_time")
    .gte("tap_in_time", today.toISOString());

  if (error || !data) return [];

  const hourly: Record<string, number> = {};
  for (let i = 0; i < 24; i++) {
    const h = i.toString().padStart(2, "0");
    hourly[`${h}:00`] = 0;
  }

  data.forEach((tx: any) => {
    const d = new Date(tx.tap_in_time);
    const h = d.getHours().toString().padStart(2, "0");
    const key = `${h}:00`;
    if (hourly[key] !== undefined) hourly[key]++;
  });

  return Object.entries(hourly).map(([name, volume]) => ({
    name,
    volume,
  }));
}

export async function getRevenue(): Promise<RevenueData[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("tap_in_time, fee")
    .neq("status", "CANCELLED");

  if (error || !data) return [];

  const grouped: Record<string, number> = {};
  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  data.forEach((tx: any) => {
    const d = new Date(tx.tap_in_time);
    const dayKey = d.toISOString().slice(0, 10);
    if (!grouped[dayKey]) grouped[dayKey] = 0;
    grouped[dayKey] += tx.fee || 0;
  });

  return Object.entries(grouped).map(([dateStr, revenue]) => {
    const d = new Date(dateStr);
    return { name: dayNames[d.getDay()], revenue };
  });
}

export async function getVehiclesInOut(): Promise<VehiclesInOut[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("tap_in_time, tap_out_time")
    .neq("status", "CANCELLED");

  if (error || !data) return [];

  const grouped: Record<string, { in: number; out: number }> = {};
  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  data.forEach((tx: any) => {
    const d = new Date(tx.tap_in_time);
    const dayKey = d.toISOString().slice(0, 10);
    if (!grouped[dayKey]) grouped[dayKey] = { in: 0, out: 0 };
    grouped[dayKey].in++;
    if (tx.tap_out_time) grouped[dayKey].out++;
  });

  return Object.entries(grouped).map(([dateStr, counts]) => {
    const d = new Date(dateStr);
    return { name: dayNames[d.getDay()], ...counts };
  });
}

export async function getAvgSpeed(): Promise<AvgSpeedData[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("tap_in_time, average_speed")
    .not("average_speed", "is", null);

  if (error || !data) return [];

  const grouped: Record<string, { total: number; count: number }> = {};
  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  data.forEach((tx: any) => {
    const d = new Date(tx.tap_in_time);
    const dayKey = d.toISOString().slice(0, 10);
    if (!grouped[dayKey]) grouped[dayKey] = { total: 0, count: 0 };
    grouped[dayKey].total += tx.average_speed || 0;
    grouped[dayKey].count++;
  });

  return Object.entries(grouped).map(([dateStr, g]) => {
    const d = new Date(dateStr);
    return { name: dayNames[d.getDay()], speed: Math.round(g.total / g.count) };
  });
}

export async function getTravelTime(): Promise<TravelTimeData[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("tap_in_time, duration_minutes")
    .not("duration_minutes", "is", null);

  if (error || !data) return [];

  const grouped: Record<string, { total: number; count: number }> = {};
  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  data.forEach((tx: any) => {
    const d = new Date(tx.tap_in_time);
    const dayKey = d.toISOString().slice(0, 10);
    if (!grouped[dayKey]) grouped[dayKey] = { total: 0, count: 0 };
    grouped[dayKey].total += tx.duration_minutes || 0;
    grouped[dayKey].count++;
  });

  return Object.entries(grouped).map(([dateStr, g]) => {
    const d = new Date(dateStr);
    return { name: dayNames[d.getDay()], time: Math.round(g.total / g.count) };
  });
}
