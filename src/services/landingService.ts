import { supabase } from './supabaseClient'

export interface LandingStats {
  total_vehicles: number
  today_revenue: number
  total_users: number
  total_transactions: number
}

export async function getLandingStats(): Promise<LandingStats> {
  const { data, error } = await supabase.rpc('get_dashboard_stats')
  if (error || !data) {
    console.error('Gagal ambil stats landing:', error?.message)
    return { total_vehicles: 0, today_revenue: 0, total_users: 0, total_transactions: 0 }
  }
  return {
    total_vehicles: data.total_vehicles ?? 0,
    today_revenue: data.today_revenue ?? 0,
    total_users: data.total_users ?? 0,
    total_transactions: data.total_transactions ?? 0,
  }
}
