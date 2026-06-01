import { supabase } from "@/services/supabaseClient";
import type { VwTransactionDetails } from "@/types/supabase";

export const getTransactions = async (limit: number = 10) => {
  const { data, error } = await supabase
    .from("vw_transaction_details")
    .select("*")
    .order("tap_in_time", { ascending: false })
    .limit(limit);

  if (error) {
    console.error(error);
    return [];
  }

  return data as VwTransactionDetails[];
};