import { createClient } from "@/lib/supabase/client";
import type { VwTransactionDetails, UpdateTransactionParams, DeleteTransactionParams, Gate } from "@/lib/types/supabase";

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

export const updateTransaction = async (params: UpdateTransactionParams) => {
  const supabase = createClient();
  const { error } = await supabase.rpc("update_transaction", params);
  return { error };
};

export const deleteTransaction = async (params: DeleteTransactionParams) => {
  const supabase = createClient();
  const { error } = await supabase.rpc("delete_transaction", params);
  return { error };
};

export const getGates = async (): Promise<Gate[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("gates")
    .select("id, name, location, status, created_at")
    .order("name");

  if (error) {
    console.error("getGates error:", error);
    return [];
  }

  return data as Gate[];
};
