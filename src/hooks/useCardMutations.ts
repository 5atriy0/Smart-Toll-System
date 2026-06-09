"use client";

import { useState } from "react";
import { updateCardStatus } from "@/services/userService";
import { addCard, updateCard, deleteCard } from "@/services/cardService";

export function useCardMutations(onSuccess?: () => void) {
  const [loading, setLoading] = useState(false);

  const toggleStatus = async (uid: string, newStatus: string) => {
    setLoading(true);
    const { error } = await updateCardStatus(uid, newStatus as any);
    if (!error && onSuccess) onSuccess();
    setLoading(false);
    return { error };
  };

  const editCard = async (params: {
    p_card_id: string;
    p_balance?: number;
    p_status?: string;
    p_vehicle_id?: string;
  }) => {
    setLoading(true);
    const { error } = await updateCard(params);
    if (!error && onSuccess) onSuccess();
    setLoading(false);
    return { error };
  };

  const removeCard = async (cardId: string) => {
    setLoading(true);
    const { error } = await deleteCard(cardId);
    if (!error && onSuccess) onSuccess();
    setLoading(false);
    return { error };
  };

  const createCard = async (params: {
    p_profile_id: string;
    p_uid: string;
    p_vehicle_id: string;
    p_balance?: number;
  }) => {
    setLoading(true);
    const { data, error } = await addCard(params);
    if (!error && onSuccess) onSuccess();
    setLoading(false);
    return { data, error };
  };

  return { toggleStatus, editCard, removeCard, createCard, loading };
}
