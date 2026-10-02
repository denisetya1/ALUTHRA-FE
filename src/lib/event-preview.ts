import type { EventDefinition, EventReward, EventStage, ValidationIssue } from "../types/events";

export const PREVIEW_LABELS = { story: "Story", missions: "Missions", currency: "Currency", shop: "Exchange shop", milestones: "Milestone rewards" } as const;

export function previewTabs(event: Pick<EventDefinition, "modules">) {
  return (Object.keys(PREVIEW_LABELS) as (keyof typeof PREVIEW_LABELS)[]).filter((key) => event.modules[key]);
}

export function eventCountdown(event: Pick<EventDefinition, "start_at" | "end_at">, now: number): string {
  const start = Date.parse(event.start_at), end = Date.parse(event.end_at);
  if (!Number.isFinite(start) || !Number.isFinite(end) || start >= end) return "Schedule unavailable";
  if (now >= end) return "Event ended";
  const remaining = Math.max(0, Math.ceil(((now < start ? start : end) - now) / 1000));
  const days = Math.floor(remaining / 86400), hours = Math.floor(remaining % 86400 / 3600), minutes = Math.floor(remaining % 3600 / 60), seconds = remaining % 60;
  return `${now < start ? "Starts" : "Ends"} in ${days ? `${days}d ` : ""}${hours}h ${minutes}m ${seconds}s`;
}

export function publishBlockReason(event: Pick<EventDefinition, "status">, issues?: ValidationIssue[]): string | null {
  if (event.status === "active" || event.status === "scheduled") return "This event is already published.";
  if (event.status === "ended") return "Ended events cannot be published.";
  if (!issues) return "Validation must complete before publishing.";
  if (issues.some((issue) => issue.level === "error")) return "Resolve validation errors before publishing.";
  return null;
}

export function rewardLabel(reward: EventReward): string {
  const label = reward.type === "card" ? `Card ${reward.card_id ?? "(not selected)"}` : reward.type === "item" ? `Item ${reward.item_id ?? "(not selected)"}` : reward.type === "event_currency" ? reward.currency_code ?? "Event currency (not selected)" : reward.type === "crown" ? "Crown" : "Aether";
  return `${reward.quantity} × ${label}`;
}

export function newStoryStage(index: number) {
  return { stage_number: index + 1, name_english: "", name_indonesia: "", description_english: "", description_indonesia: "", story_text_english: "", story_text_indonesia: "", enemy_ids: [], recommended_power: 0, energy_cost: 5, difficulty: "normal", first_clear_rewards: [], repeat_rewards: [], unlock: { type: index === 0 ? "none" : "previous_stage" }, attempts_per_day: 0, repeatable: true } satisfies EventStage;
}

export function storyStagesPayload(stages: EventStage[], referencedStages: number[] = []): EventStage[] {
  const numbers = new Map(stages.map((stage, index) => [stage.stage_number, index + 1]));
  if (referencedStages.some((number) => numbers.get(number) !== number)) {
    throw new Error("A mission or shop offer references a moved or removed stage. Clear those references before changing the story order, then reconfigure them after saving.");
  }
  return stages.map((stage, index) => {
    const source = stage.unlock;
    const unlock: EventStage["unlock"] = { type: source.type };
    if (source.type === "player_level") unlock.level = source.level;
    if (source.type === "event_points") unlock.points = source.points;
    if (source.type === "mission") unlock.mission_code = source.mission_code;
    if (source.type === "datetime") unlock.at = toUtcDateTime(source.at ?? "");
    if (source.type === "previous_stage" && source.stage_number !== undefined) {
      const number = numbers.get(source.stage_number);
      if (number === undefined) throw new Error("An unlock references a removed stage. Update that condition before saving.");
      unlock.stage_number = number;
    }
    return { ...stage, stage_number: index + 1, unlock };
  });
}

export function toLocalDateTime(value?: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, -1);
}

export function toUtcDateTime(value: string): string {
  const date = new Date(value);
  if (!value || !Number.isFinite(date.getTime())) throw new Error("Enter a valid date and time.");
  return date.toISOString();
}
