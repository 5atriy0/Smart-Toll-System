import { createClient } from "@/lib/supabase/client";
import type { VwTransactionDetails } from "@/types/supabase";

export interface GetTransactionsParams {
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface GetTransactionsResult {
  data: VwTransactionDetails[];
  total: number;
}

export const getTransactions = async (
  params?: GetTransactionsParams
): Promise<GetTransactionsResult> => {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_transactions", {
    p_date_from: params?.dateFrom ?? null,
    p_date_to: params?.dateTo ?? null,
    p_search: params?.search ?? null,
    p_limit: params?.limit ?? 10,
    p_offset: params?.offset ?? 0,
  });

  if (error) {
    console.error("getTransactions error:", error);
    return { data: [], total: 0 };
  }

  return data as unknown as GetTransactionsResult;
};
