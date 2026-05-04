/**
 * Transaction Service
 * Abstraksi data layer untuk transaksi tol.
 * Saat ini menggunakan mock data dari lib/constants.
 * Siap diganti dengan real API (Supabase, REST, dll) di masa depan.
 */

import { MOCK_TRANSACTIONS } from '@/lib/constants';

// -- Tipe Data --
export interface Transaction {
  id: string;
  time: string;
  rfid: string;
  plate: string;
  status: string;
  loc: string;
}

// -- Service Functions --

export function getTransactions(): Transaction[] {
  return MOCK_TRANSACTIONS;
}

export function getTransactionById(id: string): Transaction | undefined {
  return MOCK_TRANSACTIONS.find((tx) => tx.id === id);
}

/**
 * Di masa depan, ganti implementasi di atas dengan:
 *
 * export async function getTransactions() {
 *   const { data } = await supabase.from('transactions').select('*').order('time', { ascending: false });
 *   return data;
 * }
 */
