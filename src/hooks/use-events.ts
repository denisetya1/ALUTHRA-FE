"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientApi } from "@/lib/client-api";
import { eventSavePayload } from "@/lib/event-payload";
import { useAdminQuery } from "@/hooks/use-admin-query";
import type { EventDefinition, EventListItem, EventOption, ValidationIssue } from "@/types/events";

const valid = (id: string) => /^[a-f\d]{24}$/i.test(id);

type ListResult = { data: EventListItem[]; total: number; page: number; limit: number };

export const useEvents = (query: string) =>
  useAdminQuery<ListResult>(["events", query], `events?${query}`);
export const useEvent = (id: string) =>
  useAdminQuery<EventDefinition>(["event", id], `events/${id}`, valid(id));
export const useEventOptions = () =>
  useAdminQuery<{ data: EventOption[] }>(["event-options"], "events/options");
export const useEventValidation = (id: string) =>
  useAdminQuery<{ issues: ValidationIssue[] }>(["event-validation", id], `events/${id}/validation`, valid(id));

async function eventAction(id: string, action: "publish" | "disable" | "archive" | "duplicate") {
  return clientApi<EventDefinition>(`/api/admin/events/${id}/${action}`, { method: "POST" });
}

function useEventAction(action: "publish" | "disable" | "archive" | "duplicate", invalidate: string[]) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [action, "event"],
    mutationFn: ({ id }: { id: string }) => eventAction(id, action),
    onSuccess: () => {
      for (const key of invalidate) queryClient.invalidateQueries({ queryKey: [key] });
      queryClient.invalidateQueries({ queryKey: ["event-validation"] });
      queryClient.invalidateQueries({ queryKey: ["event-options"] });
    },
  });
}

export const usePublishEvent = () => useEventAction("publish", ["events", "event"]);
export const useDisableEvent = () => useEventAction("disable", ["events", "event"]);
export const useArchiveEvent = () => useEventAction("archive", ["events", "event"]);
export const useDuplicateEvent = () => useEventAction("duplicate", ["events"]);

type SaveEventPayload = Record<string, unknown>;

export function useSaveEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["save-event"],
    mutationFn: ({ id, payload }: { id?: string; payload: SaveEventPayload }) =>
      clientApi<EventDefinition>(id ? `/api/admin/events/${id}` : "/api/admin/events", {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: (event: EventDefinition) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      if (event?._id) queryClient.invalidateQueries({ queryKey: ["event", event._id] });
      queryClient.invalidateQueries({ queryKey: ["event-validation"] });
      queryClient.invalidateQueries({ queryKey: ["event-options"] });
    },
  });
}

export type SaveModuleInput = { eventId: string; field: keyof EventDefinition; payload: unknown[] };

/** Saves one module's embedded array (stages, missions, currencies, shop_items, milestones). */
export function useSaveEventModule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["save-event-module"],
    mutationFn: async ({ eventId, field, payload }: SaveModuleInput) => {
      const current = await clientApi<EventDefinition>(`/api/admin/query/events/${eventId}`);
      return clientApi<EventDefinition>(`/api/admin/events/${eventId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventSavePayload(current, { [field]: payload })),
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event", variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ["event-validation"] });
      queryClient.invalidateQueries({ queryKey: ["event-options"] });
    },
  });
}
