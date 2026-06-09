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

| Role | Login → Redirect | Layout | Akses |
|------|------------------|--------|-------|
| **Admin** | `/dashboard` | Sidebar (navigasi kiri) + Navbar (judul halaman + profil) | Manajemen akses, transaksi, analitik, pengaturan, users |
| **User** | `/user` | Navbar (logo Tollytics + profil), tanpa sidebar | Wallet pribadi, topup, kartu, riwayat transaksi |

- Admin bisa tambah pengguna **dengan password** (via modal Tambah Pengguna)
- Admin bisa **reset password** user lain (via modal Detail Pengguna → Reset Password)
- User registrasi mandiri → role `USER`, hanya bisa akses `/user/*`

## NFC Scan (User)

User bisa scan UID kartu secara otomatis lewat NFC di HP Android.

| Teknologi | Keterangan |
|-----------|------------|
| **Web NFC API** | `NDEFReader` — client-side, tanpa backend/cloud |
| **Support** | Chrome Android v89+, Samsung Internet |
| **Tidak support** | iOS, Desktop — tombol NFC otomatis tidak muncul |

**Cara pakai:**
1. Buka modal Tambah Kartu atau Edit Kartu di HP Android
2. Tap tombol NFC (icon `Nfc`) di samping input UID
3. Izinkan akses NFC saat diminta browser
4. Tempelkan kartu RFID ke belakang HP
5. UID terisi otomatis

**File:** `src/hooks/useNfcScan.ts` — hook reusable, `src/components/nfc/NfcScanButton.tsx` — tombol dengan animasi loading + timeout 30 detik.

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

## Theme Custom Colors

| Variable | Light | Dark | Penggunaan |
|----------|-------|------|-----------|
| `--primary` | Navy `215 52% 22%` | `215 40% 35%` | Sidebar, stat cards, tombol umum |
| `--accent` | Amber `38 91% 41%` | same | Tombol Tambah Kartu, aksen aktif |
| `--topup` | Emerald `160 84% 39%` | `160 60% 45%` | Tombol & panel Top Up |
| `--success` | Blue `210 60% 45%` | `210 50% 40%` | Status badges |
| `--sidebar-bg` | Navy `215 52% 22%` | `215 40% 18%` | Background sidebar |

---

# Database Setup

Skema database, RPC functions, dan trigger sudah ada di Supabase.
Untuk informasi detail tentang tabel, views, RPC, dan arsitektur database,
lihat `docs/DATABASE.md`

# Firmware (Arduino IDE)

1. Buka file `.ino` MQTT yang sesuai di `firmware/esp32/`
2. Install library: PubSubClient, ArduinoJson, MFRC522, ESP32Servo, LiquidCrystal_I2C
3. Upload ke ESP32

---

# Struktur Proyek (Frontend)

```
src/
├── app/
│   ├── (dashboard)/    ← Admin layout (Sidebar + Navbar)
│   │   ├── dashboard/
│   │   ├── transactions/
│   │   ├── analytics/
│   │   ├── manajemen-akses/
│   │   ├── settings/
│   │   └── profile/
│   ├── user/            ← User layout (Navbar with branding)
│   │   ├── page.tsx     ← Wallet, kartu, top up, riwayat
│   │   └── profile/
│   ├── layout.tsx       ← Root layout
│   └── globals.css      ← CSS variables (light/dark)
├── components/
│   ├── layout/          ← Sidebar, Navbar, ThemeToggle
│   ├── nfc/             ← NfcScanButton
│   ├── auth/            ← ProtectedRoute
│   └── ui/              ← Card, ConfirmModal, dll
├── hooks/
│   ├── useAnalytics.ts
│   ├── useNfcScan.ts    ← Web NFC scan logic
│   └── ...
└── services/
    ├── cardService.ts
    └── ...
```
```
