# Tollytics — Smart Toll System

Dashboard all-in-one buat manajemen gerbang tol elektronik, dari hardware ESP32 sampai cloud AWS + Supabase.

```
┌─────────────┐     ┌──────────────┐     ┌──────────┐     ┌──────────┐
│   ESP32     │────→│  AWS IoT     │────→│  Lambda  │────→│ Supabase │
│  (Ger bang)  │MQTT│  Core        │Rule │  Node.js │REST │  DB+RPC  │
│   RFID+IR   │←───│              │     │          │     │          │
│   Servo+LCD │     │  MQTT Response     │          │     │          │
└─────────────┘     └──────────────┘     └──────────┘     └──────────┘
```

---

## Tech Stack

| Kategori | Teknologi |
|----------|-----------|
| Frontend | Next.js 16, React 18, TypeScript, Tailwind CSS |
| Backend | Supabase (PostgreSQL, Auth, RPC) |
| Cloud MQTT | AWS IoT Core + Lambda |
| 3D | Three.js |
| Hardware | ESP32, MFRC522 RFID, HC-SR04, Servo SG90, LCD I2C |

---

## Alur Transaksi

```
1. Kendaraan terdeteksi sensor IR
2. Pengguna tempel kartu RFID ke reader
3. ESP32 publish MQTT ke AWS IoT Core:
   → topic: tollytics/{gate}/tap-in / tap-out
4. IoT Rule trigger Lambda function
5. Lambda panggil Supabase RPC:
   → check_card() — validasi kartu
   → tap_in() / tap_out() — catat transaksi
6. Lambda publish response balik ke MQTT:
   → topic: tollytics/{gate}/response
7. ESP32 terima response:
   → success → servo buka (tampil "AKSES DITERIMA")
   → failed → tampil pesan error di LCD
8. Kendaraan lewat → sensor IR deteksi → servo tutup
```

---

## Yang Udah Dilakukan (AWS)

### 1. AWS IoT Core

| Resource | Nama | Fungsi |
|----------|------|--------|
| Thing | `tollytics-gate-utara` | Identitas ESP32 Gate Utara |
| Thing | `tollytics-gate-selatan` | Identitas ESP32 Gate Selatan |
| Policy | `TollyticsDevicePolicy` | Izin MQTT (Connect, Publish, Subscribe, Receive) |
| Certificate | 2 set per Thing | Auth mTLS (device cert + private key) |
| Endpoint | `a3pf3s6etaywb0-ats.iot.ap-southeast-1.amazonaws.com` | Broker MQTT |

### 2. AWS Lambda

| Nama | Runtime | Fungsi |
|------|---------|--------|
| `tollytics-mqtt-processor` | Node.js 22 | Terima MQTT → panggil Supabase RPC → publish response |

### 3. IoT Rules

| Nama | SQL Query | Action |
|------|-----------|--------|
| `TollyticsTapInRule` | `SELECT * FROM 'tollytics/+/tap-in'` | → Lambda |
| `TollyticsTapOutRule` | `SELECT * FROM 'tollytics/+/tap-out'` | → Lambda |

---

## Firmware

```
firmware/esp32/
├── tollytics-gateway-v2.ino       ← MQTT — dual gate (Wokwi)
├── gate-utara-in-mqtt.ino         ← MQTT — gate utara
├── gate-selatan-out-mqtt.ino      ← MQTT — gate selatan
├── gate-utara-in.ino              ← HTTP — backup
├── gate-selatan-out.ino           ← HTTP — backup
└── certs/                         ← Certificate AWS IoT Core
```

### Hardware per Gate

| Komponen | Fungsi |
|----------|--------|
| ESP32 | Mikrokontroler + WiFi |
| MFRC522 | RFID reader |
| HC-SR04 (x2) | Deteksi kendaraan & lewat |
| Servo SG90 | Palang gerbang |
| LCD I2C 16x2 | Display info |

---

## Cara Mulai

```bash
# Frontend
npm install

# isi .env.local dengan Supabase credentials
# NEXT_PUBLIC_SUPABASE_URL=
# NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
# SUPABASE_SERVICE_ROLE_KEY=   ← wajib untuk admin create/reset password user

npm run dev
```

## Role-Based Routing

| Role | Login → Redirect | Akses |
|------|------------------|-------|
| **Admin** | `/dashboard` | Sidebar + semua menu (manajemen akses, settings, users, dll) |
| **User** | `/user` | Header simpel + wallet pribadi, topup, kartu, riwayat transaksi |

- Admin bisa tambah pengguna **dengan password** (via modal Tambah Pengguna)
- Admin bisa **reset password** user lain (via modal Detail Pengguna → Reset Password)
- User registrasi mandiri → role `USER`, hanya bisa akses `/user/*`

## Dashboard Layout

### Filter Waktu
Filter **Hari Ini | 7 Hari Terakhir | Bulan Ini | Semua Waktu** di atas mengubah:
- **Pendapatan** — dihitung dari transaksi di periode terpilih
- **Kecepatan Rata-rata** & **Waktu Tempuh** — dari transaksi di periode
- **Transaksi Terbaru** — tabel ikut terfilter
- **Total Pengguna** & **Kendaraan Terdaftar** — tetap all-time

### Komponen Dashboard
1. **Compact Stat Cards** (5 kartu dengan warna variatif) — tanpa sparkline
2. **Mini Charts** — Volume Per Jam (BarChart) + Tren Pendapatan (LineChart)
3. **Transaksi Terbaru** — tabel dengan kolom Waktu (relative), UID, Plat, Rute, Tarif, Status
4. **Pintasan Cepat** — navigasi ke halaman Pengguna, Transaksi, Analitik, Pengaturan

> Notifikasi/peringatan & status gateway dihapus untuk menjaga fokus pada data inti.

## Proteksi Route

- **Middleware** (`middleware.ts`) — refresh session cookie via Supabase SSR
- **`ProtectedRoute`** — client-side guard per layout:
  - Dashboard → `allowedRoles: ['ADMIN']`
  - User → `allowedRoles: ['USER', 'ADMIN']`
- **API Routes** — semua route yang pakai `SUPABASE_SERVICE_ROLE_KEY` wajib validasi session + role admin

# Database Setup
# Skema database, RPC functions, dan trigger sudah ada di Supabase.
# Untuk informasi detail tentang tabel, views, RPC, dan arsitektur database,
# lihat docs/DATABASE.md

# Firmware (Arduino IDE)
# 1. Buka file .ino MQTT yang sesuai
# 2. Install library: PubSubClient, ArduinoJson, MFRC522, ESP32Servo, LiquidCrystal_I2C
# 3. Upload ke ESP32
```
