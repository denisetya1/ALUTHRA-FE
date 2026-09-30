"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientApi } from "@/lib/client-api";
import { useAdminQuery } from "@/hooks/use-admin-query";
import type { RelicValues } from "@/schemas/relic";

export type Relic = { _id: string; name_english: string; name_indonesia?: string; image?: string; effect: string; effect_amount: number; price: number; discount: number; desc_english?: string; shop: boolean };
export type RelicDetail = Omit<RelicValues, "image_file"> & { _id: string; image?: string };

export const useRelics = (query: string) =>
  useAdminQuery<{ data: Relic[]; total: number }>(["relics", query], `relics?${query}`);
export const useRelic = (id: string) =>
  useAdminQuery<RelicDetail>(["relic", id], `relics/${id}`, /^[a-f\d]{24}$/i.test(id));

export function useSaveRelic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["save-relic"],
    mutationFn: ({ id, payload }: { id?: string; payload: Record<string, unknown> }) =>
      clientApi(id ? `/api/admin/relics/${id}` : "/api/admin/relics", {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["relics"] }),
  });
}
