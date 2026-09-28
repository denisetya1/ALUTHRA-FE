"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientApi } from "@/lib/client-api";
import { useAdminQuery } from "@/hooks/use-admin-query";

export type ShopListing = { _id: string; title_english?: string; title_indonesia?: string; items: { item_id: { _id: string; name_english?: string; name_indonesia?: string; image?: string }; quantity: number }[]; currency?: "crown" | "aether"; price: number; discount: number; image?: string; description_english?: string; description_indonesia?: string };

export const useShop = () =>
  useAdminQuery<{ data: ShopListing[]; total: number }>(["shop"], "shop");
export const useShopItem = (id: string) =>
  useAdminQuery<ShopListing>(["shop-item", id], `shop/${id}`, /^[a-f\d]{24}$/i.test(id));

export function useSaveShopItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["save-shop-item"],
    mutationFn: ({ id, payload }: { id?: string; payload: Record<string, unknown> }) =>
      clientApi(id ? `/api/admin/shop/${id}` : "/api/admin/shop", {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["shop"] }),
  });
}
