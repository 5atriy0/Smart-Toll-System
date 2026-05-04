import { supabase } from "@/services/supabaseClient";

export const getTransactions = async (limit: number = 10) => {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error(error);
    return [];
  }

  return data;
};