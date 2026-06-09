import { createClient } from "@/lib/supabase/client";
import type { CardWithVehicle, CardWithUser, VwUsersSummary, Profile, Vehicle, CardStatus } from "@/lib/types/supabase";

export interface VehicleWithOwner {
  id: string;
  plate_number: string;
  vehicle_type: string;
  brand: string | null;
  color: string | null;
  profile_id: string;
  owner_name: string;
  owner_email: string;
}

export const getUsersSummary = async (): Promise<VwUsersSummary[]> => {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("get_users_summary");
  if (!error) {
    return data as unknown as VwUsersSummary[];
  }

  const { data: profiles } = await supabase.from("profiles").select("*");
  const { data: cards } = await supabase.from("cards").select("profile_id, balance");
  const { data: vehicles } = await supabase.from("vehicles").select("profile_id");

  const cardCount = new Map<string, number>();
  const balanceMap = new Map<string, number>();
  (cards || []).forEach((c) => {
    cardCount.set(c.profile_id, (cardCount.get(c.profile_id) || 0) + 1);
    balanceMap.set(c.profile_id, (balanceMap.get(c.profile_id) || 0) + (c.balance || 0));
  });
  const vehicleCount = new Map<string, number>();
  (vehicles || []).forEach((v) => vehicleCount.set(v.profile_id, (vehicleCount.get(v.profile_id) || 0) + 1));

  return (profiles || []).map((p) => ({
    id: p.id,
    name: p.name,
    email: p.email,
    role: p.role,
    card_count: cardCount.get(p.id) || 0,
    vehicle_count: vehicleCount.get(p.id) || 0,
    total_balance: balanceMap.get(p.id) || 0,
    created_at: p.created_at,
  })) as VwUsersSummary[];
};

export const getAllCards = async (): Promise<CardWithUser[]> => {
  const supabase = createClient();

  const { data: cards, error } = await supabase
    .from("cards")
    .select("id, uid, balance, status, profile_id, vehicle_id");

  if (error || !cards?.length) return [];

  const profileIds = [...new Set(cards.map((c) => c.profile_id))];
  const vehicleIds = cards.filter((c) => c.vehicle_id).map((c) => c.vehicle_id!) as string[];

  const [{ data: profiles }, { data: vehicles }] = await Promise.all([
    supabase.from("profiles").select("id, name, email").in("id", profileIds),
    vehicleIds.length > 0
      ? supabase.from("vehicles").select("id, plate_number, vehicle_type").in("id", vehicleIds)
      : Promise.resolve({ data: [] }),
  ]);

  const pMap = new Map((profiles || []).map((p) => [p.id, p]));
  const vMap = new Map((vehicles || []).map((v) => [v.id, v]));

  return cards.map((c) => ({
    id: c.id,
    uid: c.uid,
    balance: c.balance ?? 0,
    status: c.status as CardStatus,
    profile_id: c.profile_id,
    profile_name: pMap.get(c.profile_id)?.name ?? "Unknown",
    profile_email: pMap.get(c.profile_id)?.email ?? "",
    vehicle_id: c.vehicle_id,
    plate_number: c.vehicle_id ? vMap.get(c.vehicle_id)?.plate_number ?? null : null,
    vehicle_type: c.vehicle_id ? vMap.get(c.vehicle_id)?.vehicle_type ?? null : null,
  }));
};

export const getAllVehicles = async (): Promise<VehicleWithOwner[]> => {
  const supabase = createClient();
  const { data: vehicles, error } = await supabase
    .from("vehicles")
    .select("id, plate_number, vehicle_type, brand, color, profile_id, profiles(name, email)");
  if (error || !vehicles?.length) return [];
  return (vehicles || []).map((v) => ({
    id: v.id,
    plate_number: v.plate_number,
    vehicle_type: v.vehicle_type,
    brand: v.brand,
    color: v.color,
    profile_id: v.profile_id,
    owner_name: (v.profiles as { name: string; email: string }).name,
    owner_email: (v.profiles as { name: string; email: string }).email,
  }));
};

export const getCardsByProfile = async (
  profileId: string
): Promise<CardWithVehicle[]> => {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("get_cards_by_profile", {
    p_profile_id: profileId,
  });
  if (!error) {
    return data as unknown as CardWithVehicle[];
  }

  const { data: cards } = await supabase
    .from("cards")
    .select("*")
    .eq("profile_id", profileId);

  if (!cards?.length) return [];

  const vehicleIds = cards.map((c) => c.vehicle_id).filter(Boolean) as string[];
  const { data: vehicles } = vehicleIds.length
    ? await supabase.from("vehicles").select("*").in("id", vehicleIds)
    : { data: [] };

  const vMap = new Map((vehicles || []).map((v) => [v.id, v]));
  return cards.map((c) => {
    const v = c.vehicle_id ? vMap.get(c.vehicle_id) : null;
    return {
      id: c.id,
      uid: c.uid,
      balance: c.balance,
      status: c.status,
      vehicle_id: c.vehicle_id,
      profile_id: c.profile_id,
      created_at: c.created_at,
      plate_number: v?.plate_number ?? null,
      vehicle_type: v?.vehicle_type ?? null,
      brand: v?.brand ?? null,
      color: v?.color ?? null,
    } as CardWithVehicle;
  });
};

export const getProfile = async (profileId: string) => {
  const supabase = createClient();
  const { data } = await supabase
    .from("profiles")
    .select("name, email, role, is_active")
    .eq("id", profileId)
    .single();
  return data as { name: string; email: string; role: string; is_active: boolean } | null;
};

export const addCard = async (params: {
  p_profile_id: string;
  p_uid: string;
  p_vehicle_id?: string;
  p_balance?: number;
}) => {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("add_card", {
    ...params,
    p_balance: params.p_balance ?? 0,
  });
  return { data: data as string | null, error };
};

export const updateCard = async (params: {
  p_card_id: string;
  p_balance?: number;
  p_status?: string;
  p_vehicle_id?: string;
}) => {
  const supabase = createClient();
  const clean: Record<string, unknown> = { p_card_id: params.p_card_id };
  if (params.p_balance !== undefined) clean.p_balance = params.p_balance;
  if (params.p_status !== undefined) clean.p_status = params.p_status;
  if (params.p_vehicle_id !== undefined) clean.p_vehicle_id = params.p_vehicle_id;
  const { error } = await supabase.rpc("update_card", clean);
  return { error };
};

export const deleteCard = async (cardId: string) => {
  const supabase = createClient();
  const { error } = await supabase.rpc("delete_card", { p_card_id: cardId });
  return { error };
};

export const updateProfile = async (profileId: string, updates: { name?: string; email?: string; role?: string }) => {
  const supabase = createClient();
  const { error } = await supabase.from("profiles").update(updates).eq("id", profileId);
  return { error };
};

export const deleteProfile = async (profileId: string) => {
  const supabase = createClient();
  const { error } = await supabase.from("profiles").delete().eq("id", profileId);
  return { error };
};

export const toggleProfileStatus = async (profileId: string, isActive: boolean) => {
  const supabase = createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ is_active: isActive })
    .eq("id", profileId);
  return { error };
};

export const updateVehicle = async (vehicleId: string, updates: { plate_number?: string; vehicle_type?: string; brand?: string; color?: string }) => {
  const supabase = createClient();
  const { error } = await supabase.rpc("update_vehicle", {
    p_vehicle_id: vehicleId,
    p_plate_number: updates.plate_number ?? null,
    p_vehicle_type: updates.vehicle_type ?? null,
    p_brand: updates.brand ?? null,
    p_color: updates.color ?? null,
  });
  return { error };
};

export const deleteVehicle = async (vehicleId: string) => {
  const supabase = createClient();
  const { error } = await supabase.rpc("delete_vehicle", { p_vehicle_id: vehicleId });
  return { error };
};
