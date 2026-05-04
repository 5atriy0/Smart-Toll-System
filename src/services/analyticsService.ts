/**
 * Analytics Service
 * Abstraksi data layer untuk analytics & sensor data.
 * Saat ini menggunakan mock data dari lib/constants.
 * Siap diganti dengan real API (Supabase, REST, dll) di masa depan.
 */

import {
  MOCK_ANALYTICS_HOURLY,
  MOCK_ANALYTICS_RATIO,
  MOCK_SYSTEM_ERRORS,
  MOCK_REVENUE,
  MOCK_VEHICLES_IN_OUT,
  MOCK_VEHICLES_INSIDE,
  MOCK_AVG_SPEED,
  MOCK_TRAVEL_TIME,
} from '@/lib/constants';

// -- Tipe Data --
export interface WeeklyTrend {
  day: string;
  revenue: number;
  volume: number;
}

export interface TodayMetrics {
  totalVehicles: number;
  vehiclesTrend: string;
  revenue: number;
  revenueTrend: string;
  activeUsers: number;
  usersTrend: string;
}

export interface Alert {
  id: number;
  type: string;
  message: string;
  time: string;
}

export interface SystemLog {
  time: string;
  message: string;
}

// -- Service Functions --

export function getHourlyAnalytics() {
  return MOCK_ANALYTICS_HOURLY;
}

export function getAnalyticsRatio() {
  return MOCK_ANALYTICS_RATIO;
}

export function getSystemErrors() {
  return MOCK_SYSTEM_ERRORS;
}

export function getRevenue() {
  return MOCK_REVENUE;
}

export function getVehiclesInOut() {
  return MOCK_VEHICLES_IN_OUT;
}

export function getVehiclesInside() {
  return MOCK_VEHICLES_INSIDE;
}

export function getAvgSpeed() {
  return MOCK_AVG_SPEED;
}

export function getTravelTime() {
  return MOCK_TRAVEL_TIME;
}

/**
 * Di masa depan, ganti implementasi di atas dengan:
 *
 * export async function getHourlyAnalytics() {
 *   const { data } = await supabase.from('analytics_hourly').select('*');
 *   return data;
 * }
 */
