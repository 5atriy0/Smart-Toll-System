"use client";

import { useState, useEffect, useMemo } from "react";
import { getUsers } from "@/services/userService";
import { getAllCards, getAllVehicles } from "@/services/cardService";
import type { UserWithIsActive } from "@/services/userService";
import type { CardWithUser } from "@/lib/types/supabase";

export interface AksesStats {
  total: number;
  active: number;
  inactive: number;
  noCard: number;
  progressPercent: number;
  types?: { label: string; count: number }[];
}

export function useAkses() {
  const [data, setData] = useState<UserWithIsActive[]>([]);
  const [cards, setCards] = useState<CardWithUser[]>([]);
  const [vehicles, setVehicles] = useState<Awaited<ReturnType<typeof getAllVehicles>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersResult, cardsResult, vehiclesResult] = await Promise.all([getUsers(), getAllCards(), getAllVehicles()]);
      setData(usersResult);
      setCards(cardsResult);
      setVehicles(vehiclesResult);
    } catch {
      setError("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const penggunaStats = useMemo<AksesStats>(() => {
    const total = data.length;
    const active = data.filter((u) => u.is_active).length;
    const noCard = data.filter((u) => u.is_active && !u.uid).length;
    const inactive = data.filter((u) => !u.is_active).length;
    return {
      total,
      active: active - noCard,
      inactive,
      noCard,
      progressPercent: total > 0 ? ((active - noCard) / total) * 100 : 0,
    };
  }, [data]);

  const uidStats = useMemo<AksesStats>(() => {
    const total = cards.length;
    const active = cards.filter((c) => c.status === "ACTIVE").length;
    const inactive = cards.filter((c) => c.status === "BLOCKED").length;
    const noCard = cards.filter((c) => c.status === "LOST").length;
    return { total, active, inactive, noCard, progressPercent: 0 };
  }, [cards]);

  const kendaraanStats = useMemo<AksesStats>(() => {
    const total = vehicles.length;
    const typeMap: Record<string, number> = {};
    vehicles.forEach((v) => {
      const t = v.vehicle_type || "UNKNOWN";
      typeMap[t] = (typeMap[t] || 0) + 1;
    });
    const TYPE_LABELS: Record<string, string> = {
      CAR: "Mobil",
      PICKUP: "Pickup",
      MINIBUS: "Minibus",
      BUS: "Bus",
      LIGHT_TRUCK: "Truk Ringan",
      HEAVY_TRUCK: "Truk Berat",
    };
    const types = Object.entries(typeMap)
      .map(([key, count]) => ({ label: TYPE_LABELS[key] || key, count }))
      .sort((a, b) => b.count - a.count);
    return { total, active: 0, inactive: 0, noCard: 0, progressPercent: 0, types };
  }, [vehicles]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    stats: { pengguna: penggunaStats, uid: uidStats, kendaraan: kendaraanStats },
  };
}
