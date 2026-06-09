import { createClient } from "@/lib/supabase/client";
import type {
  VwUserDetails,
  CreateUserWithCardParams,
  CardStatus,
  UserRole,
  VehicleType,
} from "@/lib/types/supabase";

export interface UserWithIsActive {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  uid: string | null;
  balance: number | null;
  card_status: CardStatus | null;
  plate_number: string | null;
  vehicle_type: VehicleType | null;
  brand: string | null;
  color: string | null;
  created_at: string;
}

export const getUsers = async (): Promise<UserWithIsActive[]> => {
  const supabase = createClient();

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, name, email, role, is_active, created_at")
    .order("created_at", { ascending: false });

  if (profilesError) {
    console.error("getUsers profiles error:", profilesError?.message || profilesError);
    return [];
  }

  const { data: cards, error: cardsError } = await supabase
    .from("cards")
    .select("id, profile_id, uid, balance, status");

  if (cardsError) {
    console.error("getUsers cards error:", cardsError?.message || cardsError);
  }

  const { data: vehicles, error: vehiclesError } = await supabase
    .from("vehicles")
    .select("profile_id, plate_number, vehicle_type, brand, color");

  if (vehiclesError) {
    console.error("getUsers vehicles error:", vehiclesError?.message || vehiclesError);
  }

  const cardsByProfile = new Map<string, { uid: string; balance: number; card_status: CardStatus }>();
  (cards || []).forEach((c) => {
    const existing = cardsByProfile.get(c.profile_id);
    if (existing) {
      existing.balance += c.balance ?? 0;
    } else {
      cardsByProfile.set(c.profile_id, { uid: c.uid, balance: c.balance ?? 0, card_status: c.status as CardStatus });
    }
  });

  const vehiclesByProfile = new Map<string, { plate_number: string; vehicle_type: VehicleType; brand: string | null; color: string | null }>();
  (vehicles || []).forEach((v) => {
    if (!vehiclesByProfile.has(v.profile_id)) {
      vehiclesByProfile.set(v.profile_id, { plate_number: v.plate_number, vehicle_type: v.vehicle_type as VehicleType, brand: v.brand, color: v.color });
    }
  });

  return (profiles || []).map((p) => {
    const cardInfo = cardsByProfile.get(p.id);
    const vehicleInfo = vehiclesByProfile.get(p.id);
    return {
      id: p.id,
      name: p.name,
      email: p.email,
      role: p.role as UserRole,
      is_active: p.is_active,
      uid: cardInfo?.uid ?? null,
      balance: cardInfo?.balance ?? null,
      card_status: cardInfo?.card_status ?? null,
      plate_number: vehicleInfo?.plate_number ?? null,
      vehicle_type: vehicleInfo?.vehicle_type ?? null,
      brand: vehicleInfo?.brand ?? null,
      color: vehicleInfo?.color ?? null,
      created_at: p.created_at,
    };
  });
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

export const deleteUserFull = async (profileId: string): Promise<{ error: string | null }> => {
  const supabase = createClient();

  const { error: cardsError } = await supabase
    .from("cards")
    .delete()
    .eq("profile_id", profileId);

  if (cardsError) {
    console.error("deleteUserFull cards error:", cardsError);
    return { error: cardsError.message };
  }

  const { error: vehiclesError } = await supabase
    .from("vehicles")
    .delete()
    .eq("profile_id", profileId);

  if (vehiclesError) {
    console.error("deleteUserFull vehicles error:", vehiclesError);
    return { error: vehiclesError.message };
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .delete()
    .eq("id", profileId);

  if (profileError) {
    console.error("deleteUserFull profile error:", profileError);
    return { error: profileError.message };
  }

  return { error: null };
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
