import { createClient } from "@/lib/supabase/client";
import type { FullDashboardResult, AnalyticsWeekly, AnalyticsMonthly, ActiveGatesResult } from "@/lib/types/supabase";

export async function getFullDashboard(): Promise<FullDashboardResult | null> {
  const client = createClient();
  const { data, error } = await client.rpc("get_full_dashboard");
  if (error) {
    console.error("getFullDashboard error:", error);
    return null;
  }
  return data as unknown as FullDashboardResult;
}

export async function getWeeklyAnalytics(): Promise<AnalyticsWeekly[]> {
  const client = createClient();
  const { data, error } = await client
    .from("analytics_weekly")
    .select("*")
    .order("week_start", { ascending: false });

  if (error) {
    console.error("getWeeklyAnalytics error:", error);
    return [];
  }
  return data as AnalyticsWeekly[];
}

export async function getMonthlyAnalytics(): Promise<AnalyticsMonthly[]> {
  const client = createClient();
  const { data, error } = await client
    .from("analytics_monthly")
    .select("*")
    .order("month", { ascending: false });

  if (error) {
    console.error("getMonthlyAnalytics error:", error);
    return [];
  }
  return data as AnalyticsMonthly[];
}

export async function getActiveGates(dateFrom?: string): Promise<number> {
  const client = createClient();
  const params: Record<string, string> = {};
  if (dateFrom) params.date_from = dateFrom;
  const { data, error } = await client.rpc("get_active_gates", params);
  if (error) {
    console.error("getActiveGates error:", error);
    return 0;
  }
  return (data as ActiveGatesResult) ?? 0;
}
