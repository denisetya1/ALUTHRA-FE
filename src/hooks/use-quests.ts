"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientApi } from "@/lib/client-api";
import { useAdminQuery } from "@/hooks/use-admin-query";

export type QuestArc = { _id: string; source_id: string; order_number: number; name_english: string; name_indonesia: string; description_english: string; chapter_count: number };
export type QuestChapter = { _id: string; source_id: string; order_number: number; name_english: string; name_indonesia: string; description_english: string; convergence_stage: string; region_count: number };
export type QuestRegion = { _id: string; source_id: string; order_number: number; name_english: string; name_indonesia: string; description_english: string; scope: string; realms: string[]; requirement: string; show: boolean; quest_count: number };
export type QuestItem = { _id: string; source_id: string; order_number: number; quest_type: string; name_english: string; name_indonesia: string; objective_english: string; energy_cost: number; progress_per_explore: number; requirement: string; reward_notes_english?: string; boss_english?: string; prerequisites: unknown; dialogues: unknown[] };

const valid = (id: string) => /^[a-f\d]{24}$/i.test(id);
export const useQuestArcs = () => useAdminQuery<{ data: QuestArc[]; total: number }>(["quests", "arcs"], "quests/arcs");
export const useQuestArc = (id: string) => useAdminQuery<QuestArc>(["quests", "arc", id], `quests/arcs/${id}`, valid(id));
export const useQuestChapters = (arcId: string) => useAdminQuery<{ data: QuestChapter[]; total: number }>(["quests", "chapters", arcId], `quests/arcs/${arcId}/chapters`, valid(arcId));
export const useQuestChapter = (id: string) => useAdminQuery<QuestChapter>(["quests", "chapter", id], `quests/chapters/${id}`, valid(id));
export const useQuestRegions = (chapterId: string) => useAdminQuery<{ data: QuestRegion[]; total: number }>(["quests", "regions", chapterId], `quests/chapters/${chapterId}/regions`, valid(chapterId));
export const useQuestRegion = (id: string) => useAdminQuery<QuestRegion>(["quests", "region", id], `quests/regions/${id}`, valid(id));
export const useQuestItems = (regionId: string, query = "") => useAdminQuery<{ data: QuestItem[]; total: number }>(["quests", "items", regionId, query], `quests/regions/${regionId}/quests${query ? `?${query}` : ""}`, valid(regionId));
export const useQuestItem = (id: string) => useAdminQuery<QuestItem>(["quests", "item", id], `quests/items/${id}`, valid(id));

export function useSaveQuestContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["save-quest-content"],
    mutationFn: ({ endpoint, method, payload }: { endpoint: string; method: "POST" | "PUT"; payload: Record<string, unknown> }) =>
      clientApi(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["quests"] }),
  });
}
