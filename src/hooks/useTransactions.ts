"use client";

import { useEffect, useState } from "react";
import { getTransactions } from "@/services/transactionService";
import type { VwTransactionDetails } from "@/types/supabase";

const parseUTC = (ts: string | null) => {
  if (!ts) return null;
  return new Date(ts.endsWith("Z") || ts.includes("+") ? ts : ts + "Z");
};

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

      const mapped = data.map((item: VwTransactionDetails) => {
        const statusLabel =
          item.status === "COMPLETED"
            ? "SELESAI"
            : item.status === "IN_PROGRESS"
              ? "DI PERJALANAN"
              : "BELUM MASUK";

        const tapInDate = parseUTC(item.tap_in_time);
        const tapOutDate = parseUTC(item.tap_out_time);

        return {
          id: item.id,
          timeIn: tapInDate?.toLocaleString() ?? "-",
          timeOut: tapOutDate?.toLocaleString() ?? "-",
          rawTime: item.tap_in_time,
          loc: `${item.gate_in_name || "-"} → ${item.gate_out_name || "-"}`,
          rfid: item.uid,
          plate: item.plate_number || "-",

          balance: null,
          tarif: item.fee ?? null,

          status: statusLabel,

          duration: item.duration_minutes ?? null,
          speed: item.average_speed ?? null,
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
  }, [limit]);

  const filterByDate = (logs: any[]) => {
    return logs.filter((log) => {
      const date = parseUTC(log.rawTime);
      const now = new Date();
      if (!date) return false;

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

  const filteredLogs = filterByDate(logs).filter(
    (log) =>
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