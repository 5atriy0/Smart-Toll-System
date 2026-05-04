/**
 * Global State Store
 * 
 * Placeholder untuk state management global.
 * Gunakan file ini untuk menyimpan state yang perlu diakses
 * dari banyak komponen secara bersamaan (shared/global state).
 * 
 * Contoh penggunaan di masa depan dengan Zustand:
 * 
 * ```ts
 * import { create } from 'zustand';
 * 
 * interface AppState {
 *   esp32Status: 'Online' | 'Offline' | 'Error';
 *   setEsp32Status: (status: 'Online' | 'Offline' | 'Error') => void;
 *   maintenanceMode: boolean;
 *   toggleMaintenanceMode: () => void;
 * }
 * 
 * export const useAppStore = create<AppState>((set) => ({
 *   esp32Status: 'Online',
 *   setEsp32Status: (status) => set({ esp32Status: status }),
 *   maintenanceMode: false,
 *   toggleMaintenanceMode: () => set((state) => ({ maintenanceMode: !state.maintenanceMode })),
 * }));
 * ```
 * 
 * CATATAN:
 * - Jangan gunakan store untuk data statis atau constants
 * - Gunakan store hanya untuk state yang benar-benar global/shared
 * - Data yang hanya dibutuhkan satu komponen → gunakan useState di hooks/
 */

// Placeholder export agar file tidak kosong
export {};
