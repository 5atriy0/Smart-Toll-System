"use client";

import { useState, useMemo, useEffect } from "react";
import { getUsers, topUp, createUser, updateCardStatus } from "@/services/userService";
import type { VwUserDetails } from "@/types/supabase";

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
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchUsers = async () => {
    setLoading(true);
    const data = await getUsers();
    setUsers(data as UserItem[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.uid.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.plate_number || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "All" || user.card_status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [users, searchQuery, statusFilter]);

  const addBalance = async (uid: string, amount: number) => {
    const { error } = await topUp(uid, amount, "00000000-0000-0000-0000-000000000000");
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
    users: filteredUsers,
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
