// ─────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────
export type UserRole = "ADMIN" | "USER";

export type VehicleType =
  | "CAR"
  | "PICKUP"
  | "MINIBUS"
  | "BUS"
  | "LIGHT_TRUCK"
  | "HEAVY_TRUCK";

export type CardStatus = "ACTIVE" | "BLOCKED" | "LOST";

export type TransactionStatus = "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export type GateStatus = "ONLINE" | "OFFLINE" | "ERROR";

// ─────────────────────────────────────────────
// TABLE TYPES
// ─────────────────────────────────────────────
export interface Profile {
  id: string;
  auth_user_id: string | null;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface Vehicle {
  id: string;
  profile_id: string;
  plate_number: string;
  vehicle_type: VehicleType;
  brand: string | null;
  color: string | null;
  created_at: string;
}

export interface Card {
  id: string;
  profile_id: string;
  vehicle_id: string | null;
  uid: string;
  balance: number;
  status: CardStatus;
  created_at: string;
}

export interface Transaction {
  id: string;
  card_id: string;
  vehicle_id: string;
  gate_in_id: string;
  gate_out_id: string | null;
  tap_in_time: string;
  tap_out_time: string | null;
  distance_km: number;
  duration_minutes: number;
  average_speed: number;
  fee: number;
  status: TransactionStatus;
  created_at: string;
}

export interface Topup {
  id: string;
  card_id: string;
  amount: number;
  method: string;
  created_by: string | null;
  created_at: string;
}

export interface Gate {
  id: string;
  name: string;
  location: string;
  status: GateStatus;
  created_at: string;
}

export interface Device {
  id: string;
  name: string;
  type: string;
  gate_id: string;
  status: string;
  firmware_version: string;
  created_at: string;
}

export interface DeviceHealth {
  id: string;
  device_id: string;
  status: string;
  rssi: number;
  voltage: number;
  temperature: number;
  uptime: number;
  created_at: string;
}

export interface SystemSetting {
  key: string;
  value: string;
  updated_at: string;
}

export interface FirmwareUpdate {
  id: string;
  device_id: string;
  version: string;
  status: string;
  created_at: string;
}

// ─────────────────────────────────────────────
// VIEW TYPES
// ─────────────────────────────────────────────
export interface VwTransactionDetails {
  id: string;
  uid: string;
  profile_id: string;
  name: string;
  email: string;
  vehicle_id: string;
  plate_number: string;
  vehicle_type: VehicleType;
  gate_in_name: string;
  gate_out_name: string | null;
  tap_in_time: string;
  tap_out_time: string | null;
  distance_km: number;
  duration_minutes: number;
  average_speed: number;
  fee: number;
  status: TransactionStatus;
  created_at: string;
}

export interface VwUserDetails {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  uid: string;
  balance: number;
  card_status: CardStatus;
  plate_number: string;
  vehicle_type: VehicleType;
  brand: string | null;
  color: string | null;
  created_at: string;
}

export interface VwUserDashboard {
  id: string;
  name: string;
  email: string;
  uid: string;
  balance: number;
  plate_number: string;
  vehicle_type: VehicleType;
  total_transactions: number;
}

// ─────────────────────────────────────────────
// VIEW TYPES (additional)
// ─────────────────────────────────────────────
export interface VwUsersSummary {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  card_count: number;
  vehicle_count: number;
  created_at: string;
}

export interface CardWithVehicle {
  id: string;
  uid: string;
  balance: number;
  status: CardStatus;
  vehicle_id: string | null;
  plate_number: string | null;
  vehicle_type: VehicleType | null;
  brand: string | null;
  color: string | null;
}

export interface CardWithUser {
  id: string;
  uid: string;
  balance: number;
  status: CardStatus;
  profile_id: string;
  profile_name: string;
  profile_email: string;
  vehicle_id: string | null;
  plate_number: string | null;
  vehicle_type: string | null;
}

// ─────────────────────────────────────────────
// RPC PARAMETERS
// ─────────────────────────────────────────────
export interface TapInParams {
  p_uid: string;
  p_gate_id: string;
}

export interface TapOutParams {
  p_uid: string;
  p_gate_out: string;
}

export interface TopUpParams {
  p_card_uid: string;
  p_amount: number;
  p_method: string;
  p_created_by: string;
}

export interface UpdateCardStatusParams {
  p_card_uid: string;
  p_status: CardStatus;
}

export interface CreateUserWithCardParams {
  p_name: string;
  p_email: string;
  p_role: UserRole;
  p_uid?: string;
  p_plate_number?: string;
  p_vehicle_type?: VehicleType;
}

export interface CheckCardParams {
  p_uid: string;
}

export interface GetCardsByProfileParams {
  p_profile_id: string;
}

export interface AddCardParams {
  p_profile_id: string;
  p_uid: string;
  p_vehicle_id: string;
  p_balance?: number;
}

export interface UpdateCardParams {
  p_card_id: string;
  p_balance?: number;
  p_status?: CardStatus;
  p_vehicle_id?: string;
}

export interface DeleteCardParams {
  p_card_id: string;
}

export interface UpdateVehicleParams {
  p_vehicle_id: string;
  p_plate_number?: string;
  p_vehicle_type?: string;
  p_brand?: string;
  p_color?: string;
}

export interface DeleteVehicleParams {
  p_vehicle_id: string;
}

// ─────────────────────────────────────────────
// RPC RETURN TYPES
// ─────────────────────────────────────────────
export interface CheckCardResult {
  valid: boolean;
  uid: string;
  balance: number;
  status: CardStatus;
  owner: string;
  vehicle_type: VehicleType;
}

export interface DashboardStats {
  total_users: number;
  total_cards: number;
  total_vehicles: number;
  total_transactions: number;
  today_revenue: number;
}

export interface FullDashboardResult {
  stats: DashboardStats & { today_avg_speed: number; today_avg_duration: number };
  hourly_volume: { name: string; volume: number }[];
  revenue_trend: { name: string; revenue: number }[];
  vehicles_in_out: { name: string; in: number; out: number }[];
  avg_speed: { name: string; speed: number }[];
  travel_time: { name: string; time: number }[];
}

export type TapInResult = string; // transaction_id (UUID)
export type TapOutResult = void;
export type TopUpResult = void;
export type UpdateCardStatusResult = void;
export type CreateUserWithCardResult = string; // profile_id (UUID)
export type GetUsersSummaryResult = VwUsersSummary[];
export type GetCardsByProfileResult = CardWithVehicle[];
export type AddCardResult = string; // card_id (UUID)
export type UpdateCardResult = void;
export type DeleteCardResult = void;
export type UpdateVehicleResult = void;
export type DeleteVehicleResult = void;

// ─────────────────────────────────────────────
// DATABASE TYPE MAP (for generated types)
// ─────────────────────────────────────────────
export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      vehicles: { Row: Vehicle; Insert: Partial<Vehicle>; Update: Partial<Vehicle> };
      cards: { Row: Card; Insert: Partial<Card>; Update: Partial<Card> };
      transactions: { Row: Transaction; Insert: Partial<Transaction>; Update: Partial<Transaction> };
      topups: { Row: Topup; Insert: Partial<Topup>; Update: Partial<Topup> };
      gates: { Row: Gate; Insert: Partial<Gate>; Update: Partial<Gate> };
      devices: { Row: Device; Insert: Partial<Device>; Update: Partial<Device> };
      device_health: { Row: DeviceHealth; Insert: Partial<DeviceHealth>; Update: Partial<DeviceHealth> };
      system_settings: { Row: SystemSetting; Insert: Partial<SystemSetting>; Update: Partial<SystemSetting> };
      firmware_updates: { Row: FirmwareUpdate; Insert: Partial<FirmwareUpdate>; Update: Partial<FirmwareUpdate> };
    };
    Views: {
      vw_transaction_details: { Row: VwTransactionDetails };
      vw_user_details: { Row: VwUserDetails };
      vw_user_dashboard: { Row: VwUserDashboard };
    };
    Functions: {
      tap_in: { Args: TapInParams; Returns: TapInResult };
      tap_out: { Args: TapOutParams; Returns: TapOutResult };
      top_up: { Args: TopUpParams; Returns: TopUpResult };
      update_card_status: { Args: UpdateCardStatusParams; Returns: UpdateCardStatusResult };
      create_user_with_card: { Args: CreateUserWithCardParams; Returns: CreateUserWithCardResult };
      get_dashboard_stats: { Args: Record<string, never>; Returns: DashboardStats };
      get_full_dashboard: { Args: Record<string, never>; Returns: FullDashboardResult };
      check_card: { Args: CheckCardParams; Returns: CheckCardResult };
      get_users_summary: { Args: Record<string, never>; Returns: GetUsersSummaryResult };
      get_cards_by_profile: { Args: GetCardsByProfileParams; Returns: GetCardsByProfileResult };
      add_card: { Args: AddCardParams; Returns: AddCardResult };
      update_card: { Args: UpdateCardParams; Returns: UpdateCardResult };
      delete_card: { Args: DeleteCardParams; Returns: DeleteCardResult };
      update_vehicle: { Args: UpdateVehicleParams; Returns: UpdateVehicleResult };
      delete_vehicle: { Args: DeleteVehicleParams; Returns: DeleteVehicleResult };
    };
  };
}
