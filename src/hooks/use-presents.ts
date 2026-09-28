"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientApi } from "@/lib/client-api";
import { useAdminQuery } from "@/hooks/use-admin-query";

export type Present = { _id: string; title: string; status: string; image?: string; player_id?: { username?: string; email?: string }; items?: unknown[]; cards?: unknown[]; gacha?: number; gold?: number; aether?: number };

export const usePresents = () =>
  useAdminQuery<{ data: Present[]; total: number }>(["presents"], "presents");
export const usePresent = (id: string) =>
  useAdminQuery<Present>(["present", id], `presents/${id}`, /^[a-f\d]{24}$/i.test(id));

export function useSavePresent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["save-present"],
    mutationFn: ({ id, payload }: { id?: string; payload: Record<string, unknown> }) =>
      clientApi(id ? `/api/admin/presents/${id}` : "/api/admin/presents", {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["presents"] }),
  });
}
