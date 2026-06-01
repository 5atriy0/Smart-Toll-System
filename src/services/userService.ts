import { supabase } from "@/services/supabaseClient";
import type {
  VwUserDetails,
  CreateUserWithCardParams,
  CardStatus,
} from "@/types/supabase";

export const getUsers = async (): Promise<VwUserDetails[]> => {
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

export const topUp = async (
  cardUid: string,
  amount: number,
  adminId: string
) => {
  const { error } = await supabase.rpc("top_up", {
    p_card_uid: cardUid,
    p_amount: amount,
    p_method: "ADMIN",
    p_created_by: adminId,
  });
  return { error };
};

export const createUser = async (params: CreateUserWithCardParams) => {
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
  const { error } = await supabase.rpc("update_card_status", {
    p_card_uid: cardUid,
    p_status: status,
  });
  return { error };
};
