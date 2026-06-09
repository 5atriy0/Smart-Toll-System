# Big Data Pipeline — Tollytics

## Gambaran Umum

Pipeline big data untuk memproses **data transaksi historis** dari Supabase menggunakan **Hadoop HDFS** sebagai distributed storage dan **PySpark** sebagai processing engine.

```
Supabase (PostgreSQL)
    │
    ▼  [1] Extract (Python)
    │  psycopg2 → pandas → Parquet
    │
    ▼  [2] Upload ke HDFS (WebHDFS)
    │  /user/tollytics/raw/transactions/
    │
    ▼  [3] Process (PySpark)
    │  Baca dari HDFS → Spark DataFrame API
    │  Agregasi weekly & monthly
    │  Simpan ke /user/tollytics/processed/
    │
    ▼  [4] Load ke Supabase
    │  Baca hasil dari HDFS → INSERT/UPSERT
    │
    ▼
Supabase (analytics_weekly / analytics_monthly)
    │
    ▼
Next.js Dashboard
```

## Arsitektur Cluster

| VM | Hostname | IP | RAM | Services |
|----|----------|----|-----|----------|
| VM 1 | `hadoop-namenode` | `192.168.1.10` | 3 GB | NameNode, DataNode, Python pipeline, PySpark |
| VM 2 | `hadoop-datanode` | `192.168.1.11` | 2 GB | DataNode |

### Diagram Infrastruktur

```
Laptop (Windows PowerShell)
  │
  ├── SSH → VM 1 (hadoop-namenode)
  │        ├── HDFS NameNode (port 9000 RPC, 9870 WebHDFS)
  │        ├── Python pipeline.py (extract → upload → trigger spark → load)
  │        └── PySpark (baca HDFS → agregasi → simpan HDFS)
  │
  ├── SSH → VM 2 (hadoop-datanode)
  │        └── HDFS DataNode (blok replikasi)
  │
  └── Browser → Supabase (cloud)
             ├── Tabel transaksional (transactions, topups, dll)
             └── Tabel analytics (analytics_weekly, analytics_monthly)
```

## Data Flow Detail

### Storage di HDFS

```
/user/tollytics/
├── raw/
│   ├── transactions/
│   │   └── YYYY-MM-DD.parquet
│   ├── topups/
│   │   └── YYYY-MM-DD.parquet
│   ├── cards/
│   │   └── YYYY-MM-DD.parquet
│   ├── vehicles/
│   │   └── YYYY-MM-DD.parquet
│   ├── gates/
│   │   └── YYYY-MM-DD.parquet
│   └── profiles/
│       └── YYYY-MM-DD.parquet
└── processed/
    ├── weekly_stats/
    │   └── part-*.parquet
    └── monthly_stats/
        └── part-*.parquet
```

### Tabel Supabase

#### `analytics_weekly`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | BIGSERIAL | Primary key |
| `week_start` | DATE | Awal minggu (UNIQUE) |
| `total_transactions` | INT | Total transaksi selesai |
| `completed_transactions` | INT | = total_transactions |
| `total_revenue` | NUMERIC(14,2) | Total fee |
| `avg_fee` | NUMERIC(10,2) | Rata-rata fee |
| `avg_distance_km` | NUMERIC(8,2) | Rata-rata jarak |
| `avg_duration_min` | NUMERIC(8,2) | Rata-rata durasi |
| `unique_cards` | INT | Kartu unik |
| `unique_vehicles` | INT | Kendaraan unik |
| `created_at` | TIMESTAMPTZ | Waktu insert |

#### `analytics_monthly`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | BIGSERIAL | Primary key |
| `month` | DATE | Awal bulan (UNIQUE) |
| `total_transactions` | INT | Total transaksi |
| `total_revenue` | NUMERIC(14,2) | Total fee |
| `avg_fee` | NUMERIC(10,2) | Rata-rata fee |
| `avg_distance_km` | NUMERIC(8,2) | Rata-rata jarak |
| `unique_cards` | INT | Kartu unik |
| `unique_vehicles` | INT | Kendaraan unik |
| `active_gates` | INT | Gerbang aktif |
| `created_at` | TIMESTAMPTZ | Waktu insert |

## Struktur File Pipeline

```
tollytics-pipeline/
├── pipeline.py          # Main orchestrator (extract → upload → spark → load)
├── process_spark.py     # PySpark job (baca HDFS → agregasi)
├── setup_tables.sql     # SQL buat tabel analytics di Supabase
├── requirements.txt     # Python dependencies
└── .env                 # Konfigurasi (jangan di-commit)
```

## Cara Menjalankan

### 1. Setup Tabel di Supabase

Buka Supabase SQL Editor, jalankan SQL dari `setup_tables.sql`.

### 2. Setup Environment di VM

```bash
cd ~/tollytics-pipeline
source venv/bin/activate
pip install -r requirements.txt
```

Buat file `.env`:
```
SUPABASE_DB_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
NAME_NODE_URL=http://192.168.1.10:9870
HDFS_USER=hadoopuser
HDFS_HOST=192.168.1.10
HDFS_PORT=9000
```

### 3. Jalankan Pipeline

```bash
# Pipeline mingguan (default 7 hari)
python pipeline.py --days 7

# Setup tabel analytics saja
python pipeline.py --setup-db

# Lihat file di HDFS
python pipeline.py --list

# Skip HDFS / Skip Spark / Skip Load (debugging)
python pipeline.py --days 7 --skip-hdfs
python pipeline.py --days 7 --skip-spark
python pipeline.py --days 7 --skip-load
```

### 4. Otomatis (Cron) — nanti

```bash
0 2 * * 0 cd /home/hadoopuser/tollytics-pipeline && source venv/bin/activate && python pipeline.py --days 7 >> pipeline.log 2>&1
```

## Cara Transfer File ke VM

```bash
# Dari PowerShell (laptop)
scp pipeline/* hadoopuser@192.168.1.10:~/tollytics-pipeline/
```

Atau pakai Git:
```bash
# Laptop
git push origin main
# VM
git pull origin main
```

## Teknologi yang Digunakan

| Library/Tools | Fungsi |
|---------------|--------|
| `psycopg2-binary` | Koneksi ke Supabase PostgreSQL |
| `pandas` | Manipulasi data di tahap extract |
| `pyarrow` | Format Parquet |
| `hdfs` | Upload/download dari HDFS via WebHDFS API |
| `python-dotenv` | Load konfigurasi `.env` |
| **PySpark** | **Distributed processing di HDFS (agregasi)** |
| Hadoop HDFS | Distributed storage (NameNode + DataNode) |

## Status Implementasi

| No | Item | Status |
|----|------|--------|
| 1 | VirtualBox + 2 VM | ✅ Dari dosen |
| 2 | Hadoop HDFS (NameNode + DataNode) | ✅ Dari dosen |
| 3 | Setup Python + PySpark di VM master | ✅ |
| 4 | Tabel analytics_weekly & analytics_monthly di Supabase | ❌ (jalankan setup_tables.sql) |
| 5 | pipeline.py (extract → upload → spark → load) | ✅ Siap |
| 6 | process_spark.py (PySpark aggregation) | ✅ Siap |
| 7 | Transfer & uji coba pertama | ❌ |
| 8 | Cron otomatis | ❌ (nanti) |
| 9 | Integrasi dashboard frontend | ❌ (nanti) |

## Catatan

- **HDFS RPC port**: `9000` (untuk PySpark konek ke HDFS)
- **WebHDFS port**: `9870` (untuk Python upload/download)
- **VM harus nyala** sebelum pipeline dijalankan
- **Hadoop services harus jalan**: `start-dfs.sh`
- Data tetap aman di VM lokal — hanya hasil agregasi yang dikirim ke Supabase
