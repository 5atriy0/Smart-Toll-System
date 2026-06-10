"""
Tollytics — PySpark Aggregation Job
=====================================
Baca data mentah dari HDFS, agregasi weekly & monthly,
simpan hasil kembali ke HDFS.

Usage:
    spark-submit --master local[2] process_spark.py --days 7 --hdfs-base /user/tollytics
"""

import argparse
from datetime import datetime, timedelta

from pyspark.sql import SparkSession
from pyspark.sql.functions import (
    col, count, sum as spark_sum, avg, countDistinct,
    date_trunc, weekofyear, year, month, to_date, lit, coalesce,
)
from pyspark.sql.types import DateType


def main(days: int, hdfs_base: str):
    spark = SparkSession.builder \
        .appName("Tollytics Analytics") \
        .getOrCreate()

    spark.conf.set("spark.sql.session.timeZone", "UTC")
    print(f"[PySpark] Session started")
    print(f"[PySpark] Days: {days}, HDFS base: {hdfs_base}")

    # ── Read raw data from HDFS ──────────────────────
    tx_path = f"{hdfs_base}/raw/transactions"
    topup_path = f"{hdfs_base}/raw/topups"
    gates_path = f"{hdfs_base}/raw/gates"

    try:
        tx = spark.read.parquet(tx_path)
        print(f"[PySpark] Loaded transactions: {tx.count()} rows")
    except Exception as e:
        print(f"[PySpark] No transactions data: {e}")
        spark.stop()
        return

    try:
        topups = spark.read.parquet(topup_path)
        print(f"[PySpark] Loaded topups: {topups.count()} rows")
    except:
        topups = None
        print("[PySpark] No topups data")

    try:
        gates_df = spark.read.parquet(gates_path)
        print(f"[PySpark] Loaded gates: {gates_df.count()} rows")
    except:
        gates_df = None
        print("[PySpark] No gates data")

    # ── Date filter ──────────────────────────────────
    cutoff_date = datetime.now() - timedelta(days=days)

    tx = tx.filter(col("created_at") >= cutoff_date.isoformat())
    tx = tx.filter(col("status") == "COMPLETED")

    if tx.count() == 0:
        print("[PySpark] No completed transactions in period")
        spark.stop()
        return

    # ── Weekly aggregation ────────────────────────────
    tx = tx.withColumn("week_start", date_trunc("week", col("tap_in_time")).cast(DateType()))

    weekly = tx.groupBy("week_start").agg(
        count("*").alias("total_transactions"),
        spark_sum("fee").alias("total_revenue"),
        avg("fee").alias("avg_fee"),
        avg("distance_km").alias("avg_distance_km"),
        avg("duration_minutes").alias("avg_duration_min"),
        countDistinct("card_id").alias("unique_cards"),
        countDistinct("vehicle_id").alias("unique_vehicles"),
    )

    weekly = weekly.withColumn("completed_transactions", col("total_transactions"))

    for c in ["total_revenue", "avg_fee", "avg_distance_km", "avg_duration_min"]:
        weekly = weekly.withColumn(c, coalesce(col(c), lit(0)))
    for c in ["total_transactions", "completed_transactions", "unique_cards", "unique_vehicles"]:
        weekly = weekly.withColumn(c, coalesce(col(c), lit(0)))

    weekly_path = f"{hdfs_base}/processed/weekly_stats"
    weekly.coalesce(1).write.mode("overwrite").parquet(weekly_path)
    print(f"[PySpark] Weekly stats saved to {weekly_path}")
    weekly.show(5)

    # ── Monthly aggregation ───────────────────────────
    tx = tx.withColumn("month", date_trunc("month", col("tap_in_time")).cast(DateType()))

    monthly = tx.groupBy("month").agg(
        count("*").alias("total_transactions"),
        spark_sum("fee").alias("total_revenue"),
        avg("fee").alias("avg_fee"),
        avg("distance_km").alias("avg_distance_km"),
        countDistinct("card_id").alias("unique_cards"),
        countDistinct("vehicle_id").alias("unique_vehicles"),
    )

    # active gates in period
    if gates_df is not None:
        gates_agg = gates_df.filter(col("created_at") >= cutoff_date.isoformat()) \
            .agg(count("*").alias("active_gates"))
        active_gates = gates_agg.collect()[0]["active_gates"]
    else:
        from pyspark.sql import Row
        active_gates = tx.select("gate_in_id").distinct().count()

    monthly = monthly.withColumn("active_gates", lit(active_gates))
    for c in ["total_revenue", "avg_fee", "avg_distance_km"]:
        monthly = monthly.withColumn(c, coalesce(col(c), lit(0)))
    for c in ["total_transactions", "unique_cards", "unique_vehicles"]:
        monthly = monthly.withColumn(c, coalesce(col(c), lit(0)))

    monthly_path = f"{hdfs_base}/processed/monthly_stats"
    monthly.coalesce(1).write.mode("overwrite").parquet(monthly_path)
    print(f"[PySpark] Monthly stats saved to {monthly_path}")
    monthly.show(5)

    spark.stop()
    print("[PySpark] Job completed successfully")


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--days", type=int, required=True)
    p.add_argument("--hdfs-base", type=str, default="/user/tollytics")
    a = p.parse_args()
    main(days=a.days, hdfs_base=a.hdfs_base)
