"use client";

import { useEffect, useState, useMemo } from "react";
import { getTransactions } from "@/services/transactionService";
import type { VwTransactionDetails } from "@/lib/types/supabase";

const parseUTC = (ts: string | null) => {
  if (!ts) return null;
  return new Date(ts.endsWith("Z") || ts.includes("+") ? ts : ts + "Z");
};

const computeDateFrom = (range: string): string | undefined => {
  const now = new Date();
  if (range === "Hari Ini") {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return d.toISOString();
  }
  if (range === "7 Hari Terakhir") {
    const d = new Date();
    d.setDate(now.getDate() - 7);
    return d.toISOString();
  }
  if (range === "Bulan Ini") {
    const d = new Date(now.getFullYear(), now.getMonth(), 1);
    return d.toISOString();
  }
  return undefined;
};

export const useTransactions = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [dateRange, setDateRange] = useState("Hari Ini");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(10);

  const fetchData = async () => {
    try {
      setLoading(true);

      const dateFrom = computeDateFrom(dateRange);
      const result = await getTransactions({ dateFrom, limit });
      if (!result) return;

      setTotal(result.total);

      const mapped = result.data.map((item: VwTransactionDetails) => {
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
  }, [dateRange, limit]);

  const filteredLogs = useMemo(() => {
    if (!searchQuery) return logs;
    const q = searchQuery.toLowerCase();
    return logs.filter(
      (log) =>
        (log.id?.toLowerCase() || "").includes(q) ||
        (log.rfid?.toLowerCase() || "").includes(q)
    );
  }, [logs, searchQuery]);

  const exportData = (type: "csv" | "pdf") => {
    console.log("Export:", type, filteredLogs);
  };

  return {
    logs: filteredLogs,
    total,
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
