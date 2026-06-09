# Database Supabase — Tollytics

> Update terakhir: 9 Juni 2026 (berdasarkan query `information_schema`)

## Tabel (10)

| Tabel | Primary Key | Kolom | Keterangan |
|-------|-------------|-------|------------|
| `profiles` | `id` (UUID) | `auth_user_id`, `name`, `email`, `role` (USER-DEFINED `user_role`), `is_active`, `created_at` | Profil user. `auth_user_id` nullable, FK ke `auth.users(id)` |
| `vehicles` | `id` (UUID) | `profile_id`, `plate_number`, `vehicle_type` (USER-DEFINED), `brand`, `color`, `created_at` | Kendaraan. `plate_number` unique. `brand` & `color` opsional |
| `cards` | `id` (UUID) | `profile_id`, `vehicle_id`, `uid`, `balance`, `status` (USER-DEFINED `card_status`), `created_at` | Kartu RFID. `uid` unique, `balance` default 0 |
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

## Functions / RPC (20)

| Function | Return | Parameters | Fungsi |
|----------|--------|-----------|--------|
| `tap_in` | `uuid` | `p_uid text`, `p_gate_id uuid` | Buat transaksi masuk, validasi saldo & kartu aktif |
| `tap_out` | `void` | `p_uid text`, `p_gate_out uuid` | Selesaikan transaksi, hitung fee & durasi |
| `top_up` | `void` | `p_card_uid text`, `p_amount bigint`, `p_method text`, `p_created_by uuid` | Insert topup (trigger tambah saldo otomatis) |
| `update_card_status` | `void` | `p_card_uid text`, `p_status` (USER-DEFINED) | Ubah status kartu |
| `create_user_with_card` | `uuid` | `p_name text`, `p_email text`, `p_uid text`, `p_plate_number text`, `p_vehicle_type` (USER-DEFINED), `p_role` (USER-DEFINED) | Buat profil + kendaraan + kartu 1x transaksi |
| `add_card` | `uuid` | `p_profile_id uuid`, `p_uid text`, `p_vehicle_id uuid`, `p_balance numeric` | Tambah kartu RFID baru |
| `update_card` | `void` | `p_card_id uuid`, `p_balance numeric`, `p_status text`, `p_vehicle_id uuid` | Update field kartu |
| `delete_card` | `void` | `p_card_id uuid` | Hapus kartu berdasarkan ID |
| `check_card` | `json` | `p_uid text` | Validasi kartu sebelum tap-in |
| `get_dashboard_stats` | `json` | — | Statistik dashboard (total user, kartu, kendaraan, transaksi hari ini, revenue) |
| `get_full_dashboard` | `json` | — | Semua data dashboard + grafik (1 call, aggregation di server) |
| `get_transactions` | `json` | `p_date_from text`, `p_date_to text`, `p_search text`, `p_limit integer`, `p_offset integer` | Filter + pagination transaksi server-side |
| `search_users` | `json` | `p_search text`, `p_status text`, `p_limit integer`, `p_offset integer` | Search user by name/uid/plate + filter status |
| `get_cards_by_profile` | `record` | `p_profile_id uuid` | Kartu + join kendaraan untuk user tertentu |
| `get_users_summary` | USER-DEFINED | — | Semua user dengan jumlah kartu & kendaraan |
| `get_all_settings` | `json` | — | Return semua settings sebagai JSON object |
| `is_admin` | `boolean` | — | Cek apakah user login adalah ADMIN |
| `handle_new_user` | `trigger` | — | Trigger: auto-create profile pas user daftar |
| `process_topup` | `trigger` | — | Trigger: tambah saldo otomatis pas insert topup |
| `process_transaction_completion` | `trigger` | — | Trigger: kurangin saldo otomatis pas transaksi selesai |

### Catatan parameter function

| Function | Catatan |
|----------|---------|
| `add_card` | Parameter `p_profile_id` terdaftar 2x di `information_schema` (duplikasi) — parameter aktual: `p_profile_id`, `p_uid`, `p_vehicle_id`, `p_balance` |
| `update_card` | Parameter `p_card_id` & `p_balance` terdaftar 2x — parameter aktual: `p_card_id`, `p_balance`, `p_status`, `p_vehicle_id` |

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
