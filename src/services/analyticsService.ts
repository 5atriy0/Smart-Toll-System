import { createClient } from "@/lib/supabase/client";
import type { FullDashboardResult } from "@/types/supabase";

export async function getFullDashboard(): Promise<FullDashboardResult | null> {
  const client = createClient();
  const { data, error } = await client.rpc("get_full_dashboard");
  if (error) {
    console.error("getFullDashboard error:", error);
    return null;
  }
  return data as unknown as FullDashboardResult;
}
