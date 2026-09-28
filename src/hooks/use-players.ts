"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientApi } from "@/lib/client-api";
import { useAdminQuery } from "@/hooks/use-admin-query";

export type Player = {
  _id: string;
  email?: string;
  username?: string;
  display_name?: string;
  realm_id?: string;
  level?: number;
  experience?: number;
  crown?: number;
  status?: "active" | "suspended" | "banned";
  last_login_at?: string;
  createdAt?: string;
};

export const usePlayers = (query: string) =>
  useAdminQuery<{ data: Player[]; total: number; limit: number }>(["players", query], `players?${query}`);

export type PlayerCard = { _id: string; card_id: { _id: string; name?: string; name_english?: string; name_indonesia?: string; rarity?: string; realm?: string }; level?: number; evolution?: number; acquired_at?: string; is_leader?: boolean };
export const usePlayer = (id: string) => useAdminQuery<Player>(["player", id], `players/${id}`, /^[a-f\d]{24}$/i.test(id));
export const usePlayerCards = (id: string) => useAdminQuery<{ data: PlayerCard[]; total: number }>(["player", id, "cards"], `players/${id}/cards`, /^[a-f\d]{24}$/i.test(id));

export function useResetPlayer(playerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["reset-player", playerId],
    mutationFn: () => clientApi(`/api/admin/players/${playerId}/reset`, { method: "POST" }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["players"] }),
        queryClient.invalidateQueries({ queryKey: ["player", playerId] }),
      ]);
    },
  });
}

export function useDeletePlayerCard(playerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["delete-player-card", playerId],
    mutationFn: (cardId: string) =>
      clientApi(`/api/admin/players/${playerId}/cards/${cardId}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["player", playerId] }),
  });
}
