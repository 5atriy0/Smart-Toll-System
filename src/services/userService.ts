/**
 * User Service
 * Abstraksi data layer untuk manajemen pengguna & RFID.
 * Saat ini menggunakan mock data dari lib/constants.
 * Siap diganti dengan real API (Supabase, REST, dll) di masa depan.
 */

import { MOCK_USERS } from '@/lib/constants';

// -- Tipe Data --
export interface User {
  name: string;
  plateNumber: string;
  rfid: string;
  balance: string;
  status: string;
  role: string;
}

// -- Service Functions --

export function getUsers(): User[] {
  return MOCK_USERS;
}

export function getUserByRfid(rfid: string): User | undefined {
  return MOCK_USERS.find((user) => user.rfid === rfid);
}

/**
 * Di masa depan, ganti implementasi di atas dengan:
 *
 * export async function getUsers() {
 *   const { data } = await supabase.from('users').select('*');
 *   return data;
 * }
 *
 * export async function updateUserBalance(rfid: string, amount: number) {
 *   const { data } = await supabase.from('users').update({ balance: amount }).eq('rfid', rfid);
 *   return data;
 * }
 */
