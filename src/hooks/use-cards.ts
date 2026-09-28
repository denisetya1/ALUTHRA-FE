"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientApi } from "@/lib/client-api";
import { useAdminQuery } from "@/hooks/use-admin-query";

export type Card = { _id: string; id?: number; name?: string; realm?: string; rarity?: number; level?: number; level_max?: number; cost?: number; valor?: number; valor_max?: number; fortitude?: number; fortitude_max?: number; evolution?: number; evolution_max?: number; evolve_cost_crown?: number; evolve_materials?: { item_id: string; amount: number }[]; gacha?: boolean; high?: boolean; price?: number; images?: { evolution: number; thumb?: string }[] };

export const useCards = (query: string) =>
  useAdminQuery<{ data: Card[]; total: number }>(["cards", query], `cards?${query}`);

export const useCard = (id: string) =>
  useAdminQuery<Card>(["card", id], `cards/${id}`, /^[a-f\d]{24}$/i.test(id));

export function useSaveCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["save-card"],
    mutationFn: ({ id, payload }: { id?: string; payload: Record<string, unknown> }) =>
      clientApi(id ? `/api/admin/cards/${id}` : "/api/admin/cards", {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cards"] }),
  });
}
