"use client";

import { useEffect, useState } from "react";
import { getTransactions } from "@/services/transactionService";
import { supabase } from "@/services/supabaseClient";
import { calculateDuration, calculateSpeed } from "@/lib/utils";

export const useTransactions = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState("Hari Ini");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(10);

  const fetchData = async () => {
    try {
      setLoading(true);

      const data = await getTransactions(limit);
      if (!data) return;

      // Sorting Descending (Terbaru ke terlama)
      data.sort(
        (a: any, b: any) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      const mapped = data.map((item: any) => {
        let duration = null;
        let speed = null;

        if (item.tap_in_time && item.tap_out_time) {
          duration = calculateDuration(item.tap_in_time, item.tap_out_time);
          speed = calculateSpeed(duration);
        }

        return {
          id: item.id,
          time: new Date(item.tap_in_time || item.created_at).toLocaleString(),
          loc: `${item.gate_in || "-"} → ${item.gate_out || "-"}`,
          rfid: item.uid,
          plate: "-",

          // Status Transaction
          status: item.tap_out_time
            ? "SELESAI"
            : item.tap_in_time
            ? "DI PERJALANAN"
            : "BELUM MASUK",

          duration,
          speed,
        };
      });

      setLogs(mapped);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Ambil data Realtime
    const channel = supabase
      .channel("transactions")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transactions" },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [limit]);

  // Filter Tanggal
  const filterByDate = (logs: any[]) => {
    const now = new Date();

    return logs.filter((log) => {
      const date = new Date(log.time);

      if (dateRange === "Hari Ini") {
        return date.toDateString() === now.toDateString();
      }

      if (dateRange === "7 Hari Terakhir") {
        const last7 = new Date();
        last7.setDate(now.getDate() - 7);
        return date >= last7;
      }

      if (dateRange === "Bulan Ini") {
        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
      }

      return true;
    });
  };

  // Filterring
  const filteredLogs = filterByDate(logs).filter((log) =>
    (log.id?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (log.rfid?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const exportData = (type: "csv" | "pdf") => {
    console.log("Export:", type, filteredLogs);
  };

 return {
    logs: filteredLogs,
    loading,
    limit,
    setLimit,
    dateRange,
    setDateRange,
    searchQuery,
    setSearchQuery,
    exportData,
  };
};