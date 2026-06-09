# Database Supabase — Tollytics

> Update terakhir: 9 Juni 2026 (riwayat perubahan — lihat Catatan Perubahan di bawah)

## Tabel (10)

| Tabel | Primary Key | Kolom | Keterangan |
|-------|-------------|-------|------------|
| `profiles` | `id` (UUID) | `auth_user_id`, `name`, `email`, `role` (USER-DEFINED `user_role`), `is_active`, `created_at` | Profil user. `auth_user_id` nullable, FK ke `auth.users(id)`. `email` UNIQUE, `auth_user_id` UNIQUE — constraint ditambahkan untuk mencegah duplikasi |
| `vehicles` | `id` (UUID) | `profile_id`, `plate_number`, `vehicle_type` (USER-DEFINED), `brand`, `color`, `created_at` | Kendaraan. `plate_number` unique. `brand` & `color` opsional |
| `cards` | `id` (UUID) | `profile_id`, `vehicle_id`, `uid`, `balance`, `status` (USER-DEFINED `card_status`), `created_at` | Kartu RFID. `uid` unique, `balance` default 0. `vehicle_id` nullable (diubah dari NOT NULL jadi nullable — sebelumnya error waktu hapus kendaraan karena FK) |
| `transactions` | `id` (UUID) | `card_id`, `vehicle_id`, `gate_in_id`, `gate_out_id`, `tap_in_time`, `tap_out_time`, `fee`, `status` (USER-DEFINED `transaction_status`), `distance_km`, `duration_minutes`, `average_speed`, `created_at` | Transaksi tap in/out. `distance_km` default 2.00 |
| `topups` | `id` (UUID) | `card_id`, `amount`, `method`, `created_by`, `created_at` | Riwayat top up saldo |
| `gates` | `id` (UUID) | `name`, `location`, `status` (USER-DEFINED `device_status`), `created_at` | Gerbang tol. `name` unique |
| `devices` | `id` (UUID) | `gate_id`, `device_name`, `firmware_version`, `ip_address`, `status` (USER-DEFINED `device_status`), `last_online`, `created_at` | Perangkat ESP32. `device_name` unique |
| `device_health` | `id` (UUID) | `device_id`, `voltage`, `wifi_rssi`, `temperature`, `free_heap`, `uptime`, `created_at` | Health check ESP32. `free_heap` = sisa RAM (bytes) |
| `firmware_updates` | `id` (UUID) | `version`, `file_url`, `release_notes`, `created_at` | Riwayat firmware OTA. `version` unique |
| `system_settings` | `key` (text) | `value`, `updated_at` | Key-value settings |

### Catatan perbedaan dari dokumentasi lama

| Item | Dokumen Lama | Real Database |
|------|-------------|---------------|
| `vehicles.brand` | Tidak disebut | ✅ Ada (text, nullable) |
| `vehicles.color` | Tidak disebut | ✅ Ada (text, nullable) |
| `devices.ip_address` | Tidak disebut | ✅ Ada (text, nullable) |
| `devices.last_online` | Tidak disebut | ✅ Ada (timestamp, nullable) |
| `device_health.rssi` | Ada | ❌ Namanya `wifi_rssi` |
| `device_health.free_heap` | Tidak disebut | ✅ Ada (bigint, nullable) |

## Views (7)

| View | Fungsi |
|------|--------|
| `vw_transaction_details` | Join transaksi + kartu + profil + kendaraan + gerbang — untuk logs |
| `vw_user_details` | Join profil + kartu + kendaraan — untuk manajemen user |
| `vw_user_dashboard` | Profil + kartu + kendaraan + total transaksi — untuk dashboard |
| `vw_users_summary` | Profil + jumlah kartu & kendaraan per user |
| `analytics_transactions` | Transaksi per hari (completed) — untuk grafik |
| `analytics_total_vehicles` | Jumlah kendaraan per tipe |
| `analytics_low_balance_cards` | Kartu dengan saldo di bawah threshold |

## Functions / RPC (22)

| Function | Return | Parameters | Fungsi |
|----------|--------|-----------|--------|
| `tap_in` | `uuid` | `p_uid text`, `p_gate_id uuid` | Buat transaksi masuk, validasi saldo & kartu aktif |
| `tap_out` | `void` | `p_uid text`, `p_gate_out uuid` | Selesaikan transaksi, hitung fee & durasi |
| `top_up` | `void` | `p_card_uid text`, `p_amount bigint`, `p_method text`, `p_created_by uuid` | Insert topup (trigger tambah saldo otomatis) |
| `update_card_status` | `void` | `p_card_uid text`, `p_status` (USER-DEFINED) | Ubah status kartu |
| `create_user_with_card` | `uuid` | `p_name text`, `p_email text`, `p_role` (USER-DEFINED), `p_uid text?`, `p_plate_number text?`, `p_vehicle_type` (USER-DEFINED?) | Buat profil + opsional kendaraan + kartu 1x transaksi. `p_uid`, `p_plate_number`, `p_vehicle_type` dibuat optional untuk fleksibilitas (admin bisa daftarkan user tanpa UID dulu) |
| `add_card` | `uuid` | `p_profile_id uuid`, `p_uid text`, `p_vehicle_id uuid`, `p_balance numeric` | Tambah kartu RFID baru |
| `update_card` | `void` | `p_card_id uuid`, `p_balance numeric`, `p_status text`, `p_vehicle_id uuid` | Update field kartu (UID tidak bisa via RPC — dilakukan direct table `cards.uid` dari service) |
| `delete_card` | `void` | `p_card_id uuid` | Hapus kartu berdasarkan ID. **SECURITY DEFINER** (bypass RLS). Cascade: hapus `transactions` + `topups` terkait sebelum hapus kartu — karena FK `transactions.card_id` pakai NO ACTION |
| `update_vehicle` | `void` | `p_vehicle_id uuid`, `p_plate_number text?`, `p_vehicle_type text?`, `p_brand text?`, `p_color text?` | Update field kendaraan. **SECURITY DEFINER** + `SET search_path = public` |
| `delete_vehicle` | `void` | `p_vehicle_id uuid` | Hapus kendaraan. **SECURITY DEFINER** + `SET search_path = public`. Cascade: UPDATE `cards SET vehicle_id = NULL` lalu DELETE `transactions` (karena NO ACTION) lalu hapus `vehicles` |
| `check_card` | `json` | `p_uid text` | Validasi kartu sebelum tap-in |
| `get_dashboard_stats` | `json` | — | Statistik dashboard (total user, kartu, kendaraan, transaksi hari ini, revenue) |
| `get_full_dashboard` | `json` | — | Semua data dashboard + grafik (1 call, aggregation di server) |
| `get_transactions` | `json` | `p_date_from text`, `p_date_to text`, `p_search text`, `p_limit integer`, `p_offset integer` | Filter + pagination transaksi server-side |
| `search_users` | `json` | `p_search text`, `p_status text`, `p_limit integer`, `p_offset integer` | Search user by name/uid/plate + filter status |
| `get_cards_by_profile` | `record` | `p_profile_id uuid` | Kartu + join kendaraan untuk user tertentu |
| `get_users_summary` | USER-DEFINED | — | Semua user dengan jumlah kartu & kendaraan |
| `get_all_settings` | `json` | — | Return semua settings sebagai JSON object |
| `is_admin` | `boolean` | — | Cek apakah user login adalah ADMIN. **SECURITY DEFINER** (dibuat dengan security definer untuk mencegah RLS recursion — tanpa ini, query ke `profiles` dari dalam RLS policy akan infinite loop) |
| `handle_new_user` | `trigger` | — | Trigger: auto-create profile pas user daftar |
| `process_topup` | `trigger` | — | Trigger: tambah saldo otomatis pas insert topup |
| `process_transaction_completion` | `trigger` | — | Trigger: kurangin saldo otomatis pas transaksi selesai |

### Client-side direct update pattern

Beberapa operasi tidak bisa dilakukan via RPC dan menggunakan **supabase client langsung ke tabel** dari service layer:

| Operasi | Alasan | File |
|---------|--------|------|
| `cards.uid` update | `update_card` RPC tidak punya parameter `p_uid` | `src/services/cardService.ts` — `updateCard()` → `supabase.from("cards").update({ uid })` |

### Catatan parameter function

| Function | Catatan |
|----------|---------|
| `add_card` | Parameter `p_profile_id` terdaftar 2x di `information_schema` (duplikasi) — parameter aktual: `p_profile_id`, `p_uid`, `p_vehicle_id`, `p_balance` |
| `update_card` | Parameter `p_card_id` & `p_balance` terdaftar 2x — parameter aktual: `p_card_id`, `p_balance`, `p_status`, `p_vehicle_id` |
| `delete_card`, `update_vehicle`, `delete_vehicle` | Fungsi-fungsi ini menggunakan **`SECURITY DEFINER`** — jalan dengan privilege pemilik function, bukan user yang manggil. Ini diperlukan karena RLS di tabel `cards`, `vehicles`, dll. memblokir operasi DELETE/UPDATE dari client. |
| `update_vehicle`, `delete_vehicle` | Juga menggunakan **`SET search_path = 'public'`** untuk memastikan resolusi tabel yang aman saat dijalankan sebagai SECURITY DEFINER |

## Triggers (3)

| Trigger | Table | Event | Timing | Fungsi |
|---------|-------|-------|--------|--------|
| `handle_new_user` | auth.users | INSERT | AFTER | Auto-create profile via `handle_new_user()` |
| `process_topup` | topups | INSERT | AFTER | Tambah saldo kartu via `process_topup()` |
| `process_transaction_completion` | transactions | UPDATE (status) | AFTER | Kurangin saldo kartu via `process_transaction_completion()` |

## Catatan Arsitektur

- **Aggregation di server** — `get_full_dashboard()` handle semua aggregation PostgreSQL, bukan di browser
- **Filter di server** — `get_transactions()`, `search_users()`, `get_all_settings()` pindahin filtering & aggregation ke Supabase
- **RLS di `profiles`** — SELECT, INSERT, UPDATE by `auth_user_id = auth.uid()`
- **Server client** (`@/services/supabaseClient`) — untuk read-only public queries
- **Browser client** (`createClient` dari `@/lib/supabase/client`) — untuk authenticated operations
- **Auto-profile** — Trigger `handle_new_user()` bikin profile otomatis pas user daftar
- **Saldo otomatis** — Trigger `process_topup` tambah saldo; `process_transaction_completion` kurangi saldo
- **Pencarian & pagination** — Semua filter + pagination di-handle RPC, bukan client
- **SECURITY DEFINER RPC pattern** — RPC yang melakukan operasi admin (delete_card, update_vehicle, delete_vehicle, is_admin) di-set sebagai `SECURITY DEFINER` untuk bypass RLS. Untuk RPC yang mengubah data (`delete_card`, `delete_vehicle`, `update_vehicle`), ditambahkan juga `SET search_path` untuk keamanan

## Catatan Perubahan

| Tanggal | Perubahan |
|---------|-----------|
| 10 Juni 2026 | `updateCard` service — tambah dukungan `p_uid` via direct table `cards.uid` (karena RPC `update_card` tidak support) |
| 9 Juni 2026 | Dokumentasi awal (berdasarkan query `information_schema`) |
| Juni 2026 | `create_user_with_card`: parameter `p_uid`, `p_plate_number`, `p_vehicle_type` dijadikan optional |
| Juni 2026 | `update_card`: fix duplicate RPC (2 versi beda tipe parameter — text vs character varying — di-drop, 1 recreate dengan TEXT) |
| Juni 2026 | `delete_card`: tambah **SECURITY DEFINER** + cascade hapus `transactions` + `topups` (karena FK `transactions.card_id` NO ACTION) |
| Juni 2026 | `is_admin`: dijadikan **SECURITY DEFINER** untuk cegah RLS recursion |
| Juni 2026 | `cards.vehicle_id`: diubah dari `NOT NULL` jadi nullable. Sebelumnya `ALTER COLUMN vehicle_id DROP NOT NULL` — karena `delete_vehicle` perlu `UPDATE cards SET vehicle_id = NULL` |
| Juni 2026 | `update_vehicle`: RPC baru **SECURITY DEFINER** + `SET search_path` |
| Juni 2026 | `delete_vehicle`: RPC baru **SECURITY DEFINER** + `SET search_path` — handle UPDATE cards + DELETE transactions sebelum hapus vehicle |
| Juni 2026 | `profiles(email)` dan `profiles(auth_user_id)`: ditambahkan UNIQUE constraint untuk cegah duplikasi |
