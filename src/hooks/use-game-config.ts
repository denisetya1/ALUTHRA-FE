"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientApi } from "@/lib/client-api";
import type { GameConfigValues } from "@/schemas/game-config";
import { useAdminQuery } from "@/hooks/use-admin-query";

export const useGameConfig = () =>
  useAdminQuery<GameConfigValues>(["game-config"], "game-config");

export function useSaveGameConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["save-game-config"],
    mutationFn: (payload: GameConfigValues) =>
      clientApi("/api/admin/game-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["game-config"] }),
  });
}
