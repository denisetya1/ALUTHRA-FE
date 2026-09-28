"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientApi } from "@/lib/client-api";
import type { ItemFormValues } from "@/schemas/item";
import { useAdminQuery } from "@/hooks/use-admin-query";

export type Item = { _id: string; name_english?: string; name_indonesia?: string; image?: string; effect?: string; effect_amount?: number; desc_english?: string; desc_indonesia?: string };

export const useItems = (query: string) =>
  useAdminQuery<{ data: Item[]; total: number }>(["items", query], `items?${query}`);
export const useItem = (id: string) =>
  useAdminQuery<Item>(["item", id], `items/${id}`, /^[a-f\d]{24}$/i.test(id));

type SaveItemInput = Omit<ItemFormValues, "image_file"> & { id?: string; image: string };

export function useSaveItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["save-item"],
    mutationFn: ({ id, ...payload }: SaveItemInput) =>
      clientApi(id ? `/api/admin/items/${id}` : "/api/admin/items", {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["items"] }),
  });
}
