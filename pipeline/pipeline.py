"""
Tollytics Big Data Pipeline
============================
Alur: Supabase → HDFS → PySpark → Supabase

Usage:
    export SUPABASE_DB_URL=postgresql://postgres:xxx@db.xxx.supabase.co:5432/postgres
    export NAME_NODE_URL=http://192.168.63.225:9870

    python pipeline.py --days 7
    python pipeline.py --list
    python pipeline.py --setup-db
"""

import os, sys, shutil, subprocess, argparse, site
from datetime import datetime, timedelta, timezone

import pandas as pd
import psycopg2
from dotenv import load_dotenv
from hdfs import InsecureClient

load_dotenv()

# ─── Config ───────────────────────────────────────────
NAME_NODE_URL = os.getenv("NAME_NODE_URL", "http://localhost:9870")
HDFS_USER = os.getenv("HDFS_USER", "hadoopuser")
HDFS_HOST = os.getenv("HDFS_HOST", "192.168.63.225")
HDFS_PORT = os.getenv("HDFS_PORT", "9000")
SUPABASE_DB_URL = os.getenv("SUPABASE_DB_URL")
HDFS_BASE = "/user/tollytics"

TABLES = ["transactions", "topups", "cards", "vehicles", "gates", "profiles"]
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

client = InsecureClient(NAME_NODE_URL, user=HDFS_USER)


# ─── Helpers ──────────────────────────────────────────

def now() -> str:
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def ensure_hdfs_path(path: str):
    for i in range(1, len(path.strip("/").split("/")) + 1):
        sub = "/" + "/".join(path.strip("/").split("/")[:i])
        try:
            client.status(sub)
        except:
            client.makedirs(sub)


def find_spark_submit() -> str:
    candidates = [
        shutil.which("spark-submit"),
        os.path.expanduser("~/tollytics-pipeline/venv/bin/spark-submit"),
    ]
    for p in site.getsitepackages():
        candidates.append(os.path.join(p, "pyspark", "bin", "spark-submit"))
    for c in candidates:
        if c and os.path.exists(c):
            return c
    return "spark-submit"


# ─── DB SETUP ─────────────────────────────────────────

SETUP_SQL = """
CREATE TABLE IF NOT EXISTS analytics_weekly (
    id BIGSERIAL PRIMARY KEY,
    week_start DATE NOT NULL UNIQUE,
    total_transactions INT DEFAULT 0,
    completed_transactions INT DEFAULT 0,
    total_revenue NUMERIC(14,2) DEFAULT 0,
    avg_fee NUMERIC(10,2) DEFAULT 0,
    avg_distance_km NUMERIC(8,2) DEFAULT 0,
    avg_duration_min NUMERIC(8,2) DEFAULT 0,
    unique_cards INT DEFAULT 0,
    unique_vehicles INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analytics_monthly (
    id BIGSERIAL PRIMARY KEY,
    month DATE NOT NULL UNIQUE,
    total_transactions INT DEFAULT 0,
    total_revenue NUMERIC(14,2) DEFAULT 0,
    avg_fee NUMERIC(10,2) DEFAULT 0,
    avg_distance_km NUMERIC(8,2) DEFAULT 0,
    unique_cards INT DEFAULT 0,
    unique_vehicles INT DEFAULT 0,
    active_gates INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
"""


def setup_database():
    print(f"[{now()}] Creating analytics tables in Supabase...")
    conn = psycopg2.connect(SUPABASE_DB_URL)
    cur = conn.cursor()
    cur.execute(SETUP_SQL)
    conn.commit()
    cur.close()
    conn.close()
    print("  Done.")


# ─── [1/4] EXTRACT ────────────────────────────────────

def extract(table: str, days: int) -> pd.DataFrame:
    print(f"  [{now()}] extract {table}...", end=" ")
    conn = psycopg2.connect(SUPABASE_DB_URL)
    df = pd.read_sql(
        f"SELECT * FROM {table} WHERE created_at >= NOW() - INTERVAL '{days} days'",
        conn,
    )
    conn.close()
    print(f"{len(df)} rows")
    return df


# ─── [2/4] UPLOAD TO HDFS ─────────────────────────────

def upload_hdfs(df: pd.DataFrame, table: str):
    path = f"{HDFS_BASE}/raw/{table}"
    ensure_hdfs_path(path)
    date_str = datetime.now().strftime("%Y-%m-%d")
    parquet_path = f"{path}/{date_str}.parquet"
    pfile = f"/tmp/tollytics_{table}.parquet"
    cfile = f"/tmp/tollytics_{table}.csv"
    df.to_parquet(pfile, index=False)
    df.to_csv(cfile, index=False)
    client.upload(parquet_path, pfile, overwrite=True)
    os.remove(pfile)
    os.remove(cfile)
    print(f"    uploaded to {parquet_path}")


# ─── [3/4] PROCESS (PySpark) ──────────────────────────

def run_spark_job(days: int):
    print(f"  [{now()}] Running PySpark aggregation job...")
    spark_script = os.path.join(SCRIPT_DIR, "process_spark.py")
    spark_submit = find_spark_submit()

    cmd = [
        spark_submit,
        "--master", "local[2]",
        "--conf", f"spark.hadoop.fs.defaultFS=hdfs://{HDFS_HOST}:{HDFS_PORT}",
        spark_script,
        "--days", str(days),
        "--hdfs-base", HDFS_BASE,
    ]

    print(f"    command: {' '.join(cmd)}")
    result = subprocess.run(cmd, capture_output=True, text=True)
    print(result.stdout)
    if result.returncode != 0:
        print(f"    [ERROR] {result.stderr}")
        sys.exit(1)
    print(f"  [{now()}] PySpark job finished.")


# ─── [4/4] LOAD TO SUPABASE ───────────────────────────

def read_parquet_from_hdfs(hdfs_dir: str) -> pd.DataFrame:
    try:
        files = client.list(hdfs_dir)
    except:
        return pd.DataFrame()
    parquet_files = sorted([f for f in files if f.endswith(".parquet")])
    if not parquet_files:
        return pd.DataFrame()
    local_path = "/tmp/tollytics_result.parquet"
    client.download(f"{hdfs_dir}/{parquet_files[0]}", local_path, overwrite=True)
    df = pd.read_parquet(local_path)
    os.remove(local_path)
    return df


def load_weekly():
    print(f"  [{now()}] Loading weekly stats to Supabase...")
    df = read_parquet_from_hdfs(f"{HDFS_BASE}/processed/weekly_stats")
    if df.empty:
        print("    no weekly data found")
        return
    conn = psycopg2.connect(SUPABASE_DB_URL)
    cur = conn.cursor()
    n = 0
    for _, r in df.iterrows():
        cur.execute("""
            INSERT INTO analytics_weekly (
                week_start, total_transactions, completed_transactions,
                total_revenue, avg_fee, avg_distance_km, avg_duration_min,
                unique_cards, unique_vehicles
            ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
            ON CONFLICT (week_start) DO UPDATE SET
                total_transactions=EXCLUDED.total_transactions,
                completed_transactions=EXCLUDED.completed_transactions,
                total_revenue=EXCLUDED.total_revenue,
                avg_fee=EXCLUDED.avg_fee,
                avg_distance_km=EXCLUDED.avg_distance_km,
                avg_duration_min=EXCLUDED.avg_duration_min,
                unique_cards=EXCLUDED.unique_cards,
                unique_vehicles=EXCLUDED.unique_vehicles
        """, (
            r["week_start"], int(r["total_transactions"]), int(r["completed_transactions"]),
            float(r["total_revenue"]), float(r["avg_fee"]), float(r["avg_distance_km"]),
            float(r["avg_duration_min"]), int(r["unique_cards"]), int(r["unique_vehicles"]),
        ))
        n += 1
    conn.commit()
    cur.close()
    conn.close()
    print(f"    inserted/updated {n} rows")


def load_monthly():
    print(f"  [{now()}] Loading monthly stats to Supabase...")
    df = read_parquet_from_hdfs(f"{HDFS_BASE}/processed/monthly_stats")
    if df.empty:
        print("    no monthly data found")
        return
    conn = psycopg2.connect(SUPABASE_DB_URL)
    cur = conn.cursor()
    n = 0
    for _, r in df.iterrows():
        cur.execute("""
            INSERT INTO analytics_monthly (
                month, total_transactions, total_revenue, avg_fee,
                avg_distance_km, unique_cards, unique_vehicles, active_gates
            ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
            ON CONFLICT (month) DO UPDATE SET
                total_transactions=EXCLUDED.total_transactions,
                total_revenue=EXCLUDED.total_revenue,
                avg_fee=EXCLUDED.avg_fee,
                avg_distance_km=EXCLUDED.avg_distance_km,
                unique_cards=EXCLUDED.unique_cards,
                unique_vehicles=EXCLUDED.unique_vehicles,
                active_gates=EXCLUDED.active_gates
        """, (
            r["month"], int(r["total_transactions"]), float(r["total_revenue"]),
            float(r["avg_fee"]), float(r["avg_distance_km"]),
            int(r["unique_cards"]), int(r["unique_vehicles"]), int(r["active_gates"]),
        ))
        n += 1
    conn.commit()
    cur.close()
    conn.close()
    print(f"    inserted/updated {n} rows")


# ─── LIST / CLEAN ─────────────────────────────────────

def list_hdfs():
    print(f"\n{HDFS_BASE}/raw/")
    try:
        for table in sorted(client.list(f"{HDFS_BASE}/raw/")):
            files = client.list(f"{HDFS_BASE}/raw/{table}")
            print(f"  {table}/ ({len(files)} files)")
            for f in sorted(files, reverse=True)[:5]:
                s = client.status(f"{HDFS_BASE}/raw/{table}/{f}").get("length", 0)
                print(f"    {f}  ({s/1024:.1f} KB)")
            if len(files) > 5:
                print(f"    ... and {len(files)-5} more")
    except Exception as e:
        print(f"  error: {e}")

    print(f"\n{HDFS_BASE}/processed/")
    try:
        for d in sorted(client.list(f"{HDFS_BASE}/processed/")):
            files = client.list(f"{HDFS_BASE}/processed/{d}")
            print(f"  {d}/ ({len(files)} files)")
            for f in sorted(files)[:5]:
                s = client.status(f"{HDFS_BASE}/processed/{d}/{f}").get("length", 0)
                print(f"    {f}  ({s/1024:.1f} KB)")
    except Exception as e:
        print(f"  error: {e}")


# ─── MAIN ─────────────────────────────────────────────

def run(days: int, skip_hdfs: bool, skip_spark: bool, skip_load: bool):
    print(f"{'='*50}")
    print(f"  Tollytics Big Data Pipeline")
    print(f"  Period: last {days} days")
    print(f"{'='*50}\n")

    t0 = datetime.now()

    # [1/4] EXTRACT
    print("[1/4] EXTRACT — Supabase → Local Parquet")
    data = {t: extract(t, days) for t in TABLES}

    # [2/4] UPLOAD
    if not skip_hdfs:
        print("\n[2/4] UPLOAD — Local → HDFS")
        for t in TABLES:
            if not data[t].empty:
                upload_hdfs(data[t], t)
            else:
                print(f"  skip {t} (empty)")
    else:
        print("\n[2/4] UPLOAD — Skipped")

    # [3/4] PROCESS (PySpark)
    if not skip_spark:
        print("\n[3/4] PROCESS — PySpark on HDFS")
        run_spark_job(days)
    else:
        print("\n[3/4] PROCESS — Skipped")

    # [4/4] LOAD
    if not skip_load:
        print("\n[4/4] LOAD — HDFS Results → Supabase")
        load_weekly()
        load_monthly()
    else:
        print("\n[4/4] LOAD — Skipped")

    elapsed = (datetime.now() - t0).total_seconds()
    print(f"\n{'='*50}")
    print(f"  Done in {elapsed:.1f}s")
    print(f"{'='*50}")


if __name__ == "__main__":
    p = argparse.ArgumentParser(description="Tollytics Big Data Pipeline")
    p.add_argument("--days", type=int, default=7, help="Days of data to process")
    p.add_argument("--list", action="store_true", help="List files in HDFS")
    p.add_argument("--setup-db", action="store_true", help="Create analytics tables in Supabase")
    p.add_argument("--skip-hdfs", action="store_true", help="Skip HDFS upload")
    p.add_argument("--skip-spark", action="store_true", help="Skip PySpark processing")
    p.add_argument("--skip-load", action="store_true", help="Skip Supabase load")
    a = p.parse_args()

    if a.setup_db:
        setup_database()
    elif a.list:
        list_hdfs()
    else:
        run(days=a.days, skip_hdfs=a.skip_hdfs, skip_spark=a.skip_spark, skip_load=a.skip_load)
