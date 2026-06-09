# Demo Guide — Big Data Pipeline Tollytics

> **Presentasi:** 10 Juni 2026
> **Durasi:** ~10-15 menit

---

## 1. Persiapan (Sebelum Demo — 5 menit)

### 1.1 Nyalakan VM

Buka VirtualBox → Start kedua VM:

| VM | Hostname | IP |
|----|----------|----|
| VM 1 | `hadoop-namenode` | `192.168.100.163` |
| VM 2 | `hadoop-datanode` | `192.168.100.165` (port 9866) |

### 1.2 SSH & Start Hadoop

```powershell
ssh hadoopuser@192.168.100.163
```

```bash
start-dfs.sh
```

Tunggu ~10 detik sampai services jalan.

---

## 2. Cek Cluster Hadoop (3 menit)

### 2.1 Status Cluster

```bash
hdfs dfsadmin -report
```

**Yang ditunjukkin:**
- `Live datanodes (1):` → tunjukkin DataNode **aktif**
- `Configured Capacity: 109.68 GB` → kapasitas cluster
- `DFS Used: 216 KB` → data udah tersimpan

### 2.2 Cek Struktur Folder HDFS

```bash
hdfs dfs -ls -R /user/tollytics
```

**Yang ditunjukkin:**
- Folder `raw/` — data mentah dari Supabase
- Folder `processed/` — hasil agregasi PySpark
- File `.parquet` — format penyimpanan terdistribusi

---

## 3. Jalankan Pipeline (5 menit)

### 3.1 Setup Environment

```bash
cd ~/tollytics-pipeline
source venv/bin/activate
```

### 3.2 Run Pipeline

```bash
python pipeline.py --days 7
```

### 3.3 Narasi Saat Pipeline Berjalan

| Step | Waktu | Narasi |
|------|-------|--------|
| **[1/4] EXTRACT** | ~30 detik | "Data transaksi 7 hari terakhir diambil dari Supabase PostgreSQL menggunakan psycopg2, disimpan sebagai file Parquet" |
| **[2/4] UPLOAD** | ~10 detik | "File Parquet diupload ke HDFS melalui WebHDFS API — disimpan secara terdistribusi di DataNode" |
| **[3/4] PROCESS** | ~90 detik | **Ini yang paling penting.** "PySpark membaca Parquet dari HDFS, melakukan agregasi mingguan & bulanan menggunakan Spark DataFrame API — semua proses dilakukan di dalam cluster Hadoop" |
| **[4/4] LOAD** | ~5 detik | "Hasil agregasi dikembalikan ke Supabase ke tabel analytics_weekly & analytics_monthly untuk ditampilkan di dashboard" |

### 3.4 Highlight di Step 3 — Tunjukkin Output PySpark

Saat PySpark selesai, tunjukkin:

```
[PySpark] Loaded transactions: 29 rows
[PySpark] Weekly stats saved to /user/tollytics/processed/weekly_stats
[PySpark] Monthly stats saved to /user/tollytics/processed/monthly_stats
[PySpark] Job completed successfully
```

Dan tabel hasil agregasi:

```
+----------+------------------+-------------+-------+---------------+------------------+
|week_start|total_transactions|total_revenue|avg_fee|avg_distance_km|  avg_duration_min|
+----------+------------------+-------------+-------+---------------+------------------+
|2026-06-08|                27|       270000|10000.0|            2.0|3.2359259259259257|
|2026-06-01|                 2|        20000|10000.0|            2.0|              2.29|
+----------+------------------+-------------+-------+---------------+------------------+
```

---

## 4. Verifikasi Hasil (2 menit)

### 4.1 Cek Isi HDFS

```bash
python pipeline.py --list
```

Tunjukkin bahwa data masih tersimpan di HDFS setelah pipeline selesai.

### 4.2 Cek Supabase

Buka browser → Supabase Dashboard → Table Editor:

| Tabel | Data |
|-------|------|
| `analytics_weekly` | ✅ 2 baris (minggu 1 Jun & 8 Jun) |
| `analytics_monthly` | ✅ 1 baris (Juni 2026) |

Tunjukkin kolom: `total_transactions`, `total_revenue`, `avg_fee`, `avg_distance_km`

---

## 5. Argumen & Poin Presentasi

### Arsitektur

```
Supabase ──→ Python ──→ HDFS ──→ PySpark ──→ HDFS ──→ Supabase ──→ Next.js
(Source)    (Extract)  (Store)   (Process)   (Result) (Display)   (Dashboard)
```

### Poin Kunci

| No | Poin | Detail |
|----|------|--------|
| 1 | **Big Data** | Data transaksi historis disimpan di **HDFS cluster** (distributed storage), bukan di database relasional |
| 2 | **Distributed Processing** | Agregasi dilakukan dengan **PySpark** di dalam cluster — bisa scale out dengan tambah node |
| 3 | **Batch Mingguan** | Pipeline berjalan otomatis tiap minggu (cron), memproses data 7 hari terakhir |
| 4 | **End-to-End** | Data mengalir dari sumber (Supabase) → storage (HDFS) → processing (PySpark) → kembali ke Supabase untuk dashboard |
| 5 | **Format Parquet** | Data disimpan dalam format **Parquet** — columnar storage, kompresi tinggi, optimal untuk analytics |

### Keunggulan Dibanding Pendekatan Konvensional

| Aspek | Konvensional (Direct DB Query) | Pipeline Ini |
|-------|-------------------------------|--------------|
| Beban Database | Tinggi — query agregasi berat | Rendah — data dipindah ke HDFS |
| Scalability | Terbatas vertikal | Horizontal — tambah DataNode |
| Storage | Mahal (cloud) | Lokal (VM) — data mentah tetap aman |
| Kecepatan Agregasi | Bergantung DB | **Parallel processing** dengan Spark |

---

## 6. Troubleshooting Demo

### Error: Hadoop Tidak Jalan

```bash
start-dfs.sh
hdfs dfsadmin -report   # verifikasi
```

### Error: Connection Refused (HDFS)

```bash
# Cek port NameNode
ss -tlnp | grep java
# Pastikan port 9000 listen di IP yang benar
```

### Error: PySpark Java Version

```bash
java -version   # harus Java 11
# Spark 3.5.3 support Java 8/11, Spark 4.x butuh Java 17
```

### Pipeline Error di Tengah Jalan

```bash
python pipeline.py --days 7 --skip-hdfs   # skip upload, ulang dari step 3
python pipeline.py --days 7 --skip-spark  # skip PySpark, ulang dari step 4
python pipeline.py --days 7 --skip-load   # skip load ke Supabase
```

---

## 7. Checklist Sebelum Presentasi

| No | Item | Status |
|----|------|--------|
| 1 | VM 1 (Namenode) nyala | ❌ |
| 2 | VM 2 (Datanode) nyala | ❌ |
| 3 | Hadoop services jalan (`start-dfs.sh`) | ❌ |
| 4 | `cd ~/tollytics-pipeline && source venv/bin/activate` | ❌ |
| 5 | Pipeline pernah di-test & sukses | ✅ |
| 6 | Supabase dashboard siap dibuka di browser | ✅ |
| 7 | File `.env` terisi dengan benar | ✅ |
| 8 | Slide / diagram arsitektur siap | ❌ |

---

## 8. Catatan

- Jangan lupa **start VM** sebelum demo — booting ~1-2 menit
- Pipeline butuh ~2 menit untuk selesai (29 transaksi)
- Pipeline otomatis **overwrite** data minggu yang sama (UPSERT)
- Semua file pipeline ada di `~/tollytics-pipeline/`
