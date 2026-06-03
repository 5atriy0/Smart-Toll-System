# Tollytics — Smart Toll System Dashboard

Platform dashboard all-in-one untuk memantau lalu lintas, mengelola gerbang, menganalisis data transaksi, dan menjaga kesehatan infrastruktur tol elektronik secara real-time.

---

## Fitur Utama

- **Dashboard Monitoring Real-time** — Metrik lalu lintas, pendapatan, dan status sistem dalam satu tampilan
- **Manajemen Pengguna & RFID** — Registrasi pengguna, aktivasi/blokir kartu, top-up saldo
- **Transaksi Tap-In / Tap-Out** — Pencatatan otomatis setiap kendaraan masuk/keluar gerbang
- **Analitik & Grafik** — Visualisasi data dengan Recharts (line, bar, pie)
- **Kontrol Gerbang Jarak Jauh** — Buka/tutup gerbang secara manual dari dashboard
- **Monitoring ESP32 Gateway** — Status perangkat, suhu, tegangan, sinyal Wi-Fi secara real-time
- **3D Toll Scene Interaktif** — Visualisasi 3D jalan tol dengan kendaraan bergerak (Three.js)
- **Dark / Light Mode** — Toggle tema yang persist di localStorage
- **Autentikasi** — Email/password + Google OAuth
- **Reset Password** — Flow forgot password via email recovery link
- **Landing Page** — Halaman publik dengan hero 3D, fitur, statistik, dan CTA

## Tech Stack

| Kategori | Teknologi |
|---|---|
| **Frontend** | Next.js 16, React 18, TypeScript, Tailwind CSS, SCSS Modules |
| **Backend** | Supabase (PostgreSQL, Auth, Realtime, RPC) |
| **Charts** | Recharts |
| **3D** | Three.js (plain, tanpa @react-three/fiber) |
| **Icons** | Lucide React |
| **Hardware** | ESP32, MFRC522 RFID, HC-SR04 Ultrasonic, Servo Motor SG90 |
| **State** | React Context (Auth, Toast) |

## Struktur Proyek

```
src/
├── app/                        # Next.js App Router pages
│   ├── (dashboard)/            # Dashboard group (protected route)
│   │   ├── dashboard/
│   │   ├── analytics/
│   │   ├── transactions/
│   │   ├── users/
│   │   ├── settings/
│   │   └── profile/
│   ├── login/                  # Halaman login / register
│   ├── reset-password/         # Reset password via recovery link
│   ├── auth/callback/          # OAuth callback handler
│   ├── api/auth/               # Auth API routes
│   └── api/transactions/       # Transaction API (ESP32)
├── components/
│   ├── landing/                # Landing page components
│   │   ├── LandingNavbar.tsx
│   │   ├── Hero3D.tsx          # Three.js 3D scene
│   │   ├── FeatureCards.tsx
│   │   └── LiveStats.tsx
│   ├── layout/                 # Sidebar, Navbar, ThemeToggle
│   ├── dashboard/              # Dashboard widgets
│   ├── auth/                   # ProtectedRoute wrapper
│   └── ui/                     # Reusable primitives (Card, Skeleton, Toast)
├── contexts/                   # AuthContext, ToastContext
├── hooks/                      # useAnalytics, useTransactions, useUsers, useLogin
├── services/                   # authService, analyticsService, transactionService, dll
├── types/                      # TypeScript interfaces & Supabase types
├── views/                      # Page-level view components
└── styles/                     # SCSS global & abstractions

firmware/
└── esp32/                      # Firmware ESP32 untuk gateway tol
    ├── tollytics-gateway-v2.ino
    ├── gate-utara-in.ino
    └── gate-selatan-out.ino
```

## Database Schema

### Tables (10)

| Tabel | Deskripsi |
|---|---|
| `profiles` | Data pengguna (nama, email, role ADMIN/USER) |
| `vehicles` | Kendaraan terdaftar per pengguna |
| `cards` | Kartu RFID (uid, saldo, status ACTIVE/BLOCKED/LOST) |
| `transactions` | Riwayat transaksi tap-in/tap-out |
| `topups` | Riwayat top-up saldo kartu |
| `gates` | Data gerbang tol (nama, lokasi, status) |
| `devices` | Perangkat ESP32 per gerbang |
| `device_health` | Status kesehatan perangkat (suhu, tegangan, sinyal) |
| `system_settings` | Konfigurasi sistem (tarif, saldo minimum, dll) |
| `firmware_updates` | Riwayat update firmware ESP32 |

### Views

| View | Deskripsi |
|---|---|
| `vw_transaction_details` | Join transaksi + profil + kendaraan + gerbang |
| `vw_user_details` | Join profil + kartu + kendaraan |
| `vw_user_dashboard` | Ringkasan pengguna dengan jumlah transaksi |

### RPC Functions

| Function | Deskripsi |
|---|---|
| `tap_in` | Catat kendaraan masuk gerbang |
| `tap_out` | Catat kendaraan keluar + hitung fee |
| `top_up` | Tambah saldo kartu |
| `update_card_status` | Aktifkan/blokir/tandai hilang kartu |
| `create_user_with_card` | Buat pengguna + kartu + kendaraan |
| `get_dashboard_stats` | Metrik agregat dashboard |
| `check_card` | Validasi kartu sebelum tap-in |

### Enums

`UserRole`, `VehicleType`, `CardStatus`, `TransactionStatus`, `GateStatus`

## Halaman & Routes

| Route | Halaman | Deskripsi |
|---|---|---|
| `/` | Landing | Halaman publik dengan 3D scene, fitur, statistik |
| `/login` | Login | Masuk / daftar / lupa password |
| `/reset-password` | Reset Password | Atur password baru via link email |
| `/dashboard` | Dashboard | Metrik utama, grafik, alert |
| `/users` | Manajemen Pengguna | CRUD pengguna, kartu RFID, top-up |
| `/transactions` | Transaksi | Riwayat tap-in/tap-out dengan filter & ekspor |
| `/analytics` | Analitik | Grafik lalu lintas, pendapatan, kecepatan |
| `/settings` | Pengaturan | Konfigurasi tarif & sistem |
| `/profile` | Profil | Edit profil pengguna |

### API Routes

| Route | Method | Deskripsi |
|---|---|---|
| `/api/auth/login` | POST | Login email/password |
| `/api/auth/register` | POST | Registrasi akun baru |
| `/api/auth/logout` | POST | Logout + hapus session |
| `/api/auth/me` | GET | Ambil user & profil saat ini |
| `/api/transactions` | POST | Tap-in / tap-out (dipanggil ESP32) |
| `/auth/callback` | GET | Handler OAuth Google callback |

## Cara Install & Jalankan

### Prerequisites

- Node.js 18+
- Akun Supabase (gratis)

### Langkah

```bash
# Clone repository
git clone https://github.com/username/tollytics.git
cd tollytics

# Install dependencies
npm install

# Setup environment variables
# Buat file .env.local dan isi dengan credential Supabase
# (lihat Supabase Dashboard > Settings > API)

# Jalankan development server
npm run dev
```

Akses [http://localhost:3000](http://localhost:3000) di browser.

> **Catatan:** Pastikan tabel, view, dan RPC functions sudah dibuat di Supabase project sesuai schema yang terdefinisi di `src/types/supabase.ts`.

## Hardware & Firmware

Sistem ini terintegrasi dengan **ESP32** sebagai gateway gerbang tol fisik.

### Komponen

- **ESP32** — Mikrokontroler utama
- **MFRC522** — RFID reader untuk scan kartu
- **HC-SR04** — Sensor ultrasonik deteksi kendaraan
- **Servo SG90** — Penggerak palang gerbang
- **LCD I2C 16x2** — Display informasi pengguna

### Cara Flash Firmware

1. Buka Arduino IDE
2. Install board ESP32 dan library yang diperlukan (MFRC522, Servo, LiquidCrystal_I2C, ArduinoJson, HTTPClient)
3. Buka file `firmware/esp32/tollytics-gateway-v2.ino`
4. Sesuaikan SSID Wi-Fi, password, dan URL API di dalam kode
5. Upload ke ESP32

Firmware varian untuk gerbang tunggal juga tersedia di `gate-utara-in.ino` dan `gate-selatan-out.ino`.

## License

MIT
