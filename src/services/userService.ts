import { createClient } from "@/lib/supabase/client";
import type {
  VwUserDetails,
  CreateUserWithCardParams,
  CardStatus,
} from "@/types/supabase";

export const getUsers = async (): Promise<VwUserDetails[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("vw_user_details")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getUsers error:", error);
    return [];
  }

  return data as VwUserDetails[];
};

export interface SearchUsersParams {
  search?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export interface SearchUsersResult {
  data: VwUserDetails[];
  total: number;
}

export const searchUsers = async (
  params?: SearchUsersParams
): Promise<SearchUsersResult> => {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("search_users", {
    p_search: params?.search ?? null,
    p_status: params?.status ?? null,
    p_limit: params?.limit ?? 50,
    p_offset: params?.offset ?? 0,
  });

  if (error) {
    console.error("searchUsers error:", error);
    return { data: [], total: 0 };
  }

  return data as unknown as SearchUsersResult;
};

export const topUp = async (
  cardUid: string,
  amount: number,
  adminId: string
) => {
  const supabase = createClient();
  const { error } = await supabase.rpc("top_up", {
    p_card_uid: cardUid,
    p_amount: amount,
    p_method: "ADMIN",
    p_created_by: adminId,
  });
  return { error };
};

export const createUser = async (params: CreateUserWithCardParams) => {
  const supabase = createClient();
  const { data, error } = await supabase.rpc(
    "create_user_with_card",
    params
  );
  return { data, error };
};

export const updateCardStatus = async (
  cardUid: string,
  status: CardStatus
) => {
  const supabase = createClient();
  const { error } = await supabase.rpc("update_card_status", {
    p_card_uid: cardUid,
    p_status: status,
  });
  return { error };
};
