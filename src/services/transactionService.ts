import { supabase } from "@/services/supabaseClient";

export const getTransactions = async (limit: number = 10) => {
  const { data, error } = await supabase
    .from("transaction_logs")
    .select("*")
    .order("tap_in_time", { ascending: false })
    .limit(limit);

  if (error) {
    console.error(error);
    return [];
  }

  return data;
};