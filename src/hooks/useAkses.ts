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
    const ownerIds = [...new Set(vehicles.map((v) => v.profile_id))];
    const profileMap = new Map(data.map((u) => [u.id, u]));
    let active = 0, inactive = 0, noCard = 0;
    ownerIds.forEach((pid) => {
      const u = profileMap.get(pid);
      if (!u) return;
      if (u.is_active && u.uid) active++;
      else if (u.is_active && !u.uid) noCard++;
      else inactive++;
    });
    return {
      total,
      active,
      inactive,
      noCard,
      progressPercent: total > 0 ? (active / total) * 100 : 0,
    };
  }, [vehicles, data]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    stats: { pengguna: penggunaStats, uid: uidStats, kendaraan: kendaraanStats },
  };
}
