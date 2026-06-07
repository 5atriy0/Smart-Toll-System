"use client";

import { useState, useEffect } from "react";
import {
  searchUsers,
  topUp,
  createUser,
  updateCardStatus,
} from "@/services/userService";
import type { VwUserDetails } from "@/lib/types/supabase";

export type UserItem = {
  id: string;
  name: string;
  email: string;
  role: string;
  uid: string;
  balance: number;
  card_status: string;
  plate_number: string;
  vehicle_type: string;
  brand: string | null;
  color: string | null;
};

export function useUsers() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchUsers = async () => {
    setLoading(true);
    const result = await searchUsers({
      search: searchQuery || undefined,
      status: statusFilter !== "All" ? statusFilter : undefined,
      limit: 50,
    });
    setUsers(result.data as UserItem[]);
    setTotal(result.total);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [searchQuery, statusFilter]);

  const addBalance = async (uid: string, amount: number) => {
    const { error } = await topUp(
      uid,
      amount,
      "00000000-0000-0000-0000-000000000000"
    );
    if (!error) {
      await fetchUsers();
    }
    return { error };
  };

  const addUser = async (newUser: {
    name: string;
    email: string;
    uid: string;
    plate_number: string;
    vehicle_type: string;
    role: string;
  }) => {
    const { error } = await createUser({
      p_name: newUser.name,
      p_email: newUser.email,
      p_uid: newUser.uid,
      p_plate_number: newUser.plate_number,
      p_vehicle_type: newUser.vehicle_type as any,
      p_role: newUser.role as any,
    });
    if (!error) {
      await fetchUsers();
    }
    return { error };
  };

  const updateUserStatus = async (uid: string, newStatus: string) => {
    const { error } = await updateCardStatus(uid, newStatus as any);
    if (!error) {
      await fetchUsers();
    }
    return { error };
  };

  return {
    users,
    total,
    loading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    addBalance,
    addUser,
    updateUserStatus,
  };
}
