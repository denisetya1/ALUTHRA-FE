import type { EventDefinition } from "../types/events";

const readOnlyFields = new Set(["_id", "__v", "createdAt", "updatedAt", "template", "requires_reschedule"]);

function writableValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(writableValue);
  if (value && typeof value === "object") {
    const optionalReferences = new Set(["item_id", "card_id", "character_id", "currency_code", "mission_code", "at", "starts_at", "ends_at", "available_from", "available_until"]);
    return Object.fromEntries(Object.entries(value).filter(([key, entry]) => !readOnlyFields.has(key) && !(optionalReferences.has(key) && entry === "")).map(([key, entry]) => [key, writableValue(entry)]));
  }
  return value;
}

export function storyFormValues(event: Pick<EventDefinition, "stages">) {
  return { stages: (event.stages ?? []).map((stage) => ({
    ...stage,
    name_indonesia: stage.name_indonesia ?? "",
    description_english: stage.description_english ?? "",
    description_indonesia: stage.description_indonesia ?? "",
    story_text_english: stage.story_text_english ?? "",
    story_text_indonesia: stage.story_text_indonesia ?? "",
    enemy_ids: stage.enemy_ids ?? [],
    recommended_power: stage.recommended_power ?? 0,
    energy_cost: stage.energy_cost ?? 0,
    attempts_per_day: stage.attempts_per_day ?? 0,
    first_clear_rewards: stage.first_clear_rewards ?? [],
    repeat_rewards: stage.repeat_rewards ?? [],
    unlock: { ...stage.unlock, type: stage.unlock?.type ?? "none" },
  })) };
}

export function eventSavePayload(current: object, changes: Record<string, unknown> = {}): Record<string, unknown> {
  return writableValue({ ...current, ...changes }) as Record<string, unknown>;
}
