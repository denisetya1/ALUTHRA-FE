import { z } from "zod";
import type { EventDefinition, EventReward, EventUnlock } from "@/types/events";
import { eventMissionSchema, eventCurrencySchema, eventShopItemSchema, eventMilestoneSchema, type EventMissionValues, type EventCurrencyValues, type EventShopItemValues, type EventMilestoneValues } from "@/schemas/event";

export type ModuleFormValues = {
  missions: EventMissionValues[];
  currencies: EventCurrencyValues[];
  shop_items: EventShopItemValues[];
  milestones: EventMilestoneValues[];
};
export type ModuleField = keyof ModuleFormValues;

export function optionalNumber(value: unknown): number | undefined {
  return value === "" || value === undefined || value === null ? undefined : Number(value);
}

export function utcInput(value?: string): string {
  if (!value) return "";
  const date = new Date(value.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(value) ? value : `${value}Z`);
  return Number.isNaN(date.getTime()) ? value : date.toISOString().slice(0, -1);
}

export function utcIso(value?: string): string | undefined {
  if (!value) return undefined;
  return new Date(`${utcInput(value)}Z`).toISOString();
}

export function moduleFormValues(event: Partial<EventDefinition>): ModuleFormValues {
  return {
    missions: (event.missions ?? []).map((row) => ({
      ...row, name_indonesia: row.name_indonesia ?? "", description_english: row.description_english ?? "",
      description_indonesia: row.description_indonesia ?? "", repeatable: row.repeatable ?? false,
      reset_type: row.reset_type ?? "none", condition: { ...row.condition, type: row.condition.type as EventMissionValues["condition"]["type"], filters: { ...row.condition.filters } },
      rewards: (row.rewards ?? []).map((reward) => ({ ...reward })), starts_at: utcInput(row.starts_at), ends_at: utcInput(row.ends_at),
    })),
    currencies: (event.currencies ?? []).map((row) => ({ ...row, name_indonesia: row.name_indonesia ?? "", icon_image: row.icon_image ?? "" })),
    shop_items: (event.shop_items ?? []).map((row, index) => ({ ...row, rewards: (row.rewards ?? []).map((reward) => ({ ...reward })), unlock: row.unlock?.type === "datetime" ? { ...row.unlock, at: utcInput(row.unlock.at) } : { ...(row.unlock ?? { type: "none" }) }, available_from: utcInput(row.available_from), available_until: utcInput(row.available_until), display_order: index })),
    milestones: (event.milestones ?? []).map((row, index) => ({ ...row, rewards: (row.rewards ?? []).map((reward) => ({ ...reward })), claimable: row.claimable ?? true, display_order: index })),
  };
}

export function emptyModuleRow(field: ModuleField): ModuleFormValues[ModuleField][number] {
  const rewards: EventReward[] = [{ type: "crown", quantity: 1 }];
  switch (field) {
    case "missions": return { mission_code: "", name_english: "", name_indonesia: "", description_english: "", description_indonesia: "", condition: { type: "BATTLE_WIN", target: 1, filters: {} }, rewards, repeatable: false, reset_type: "none", starts_at: "", ends_at: "" };
    case "currencies": return { currency_code: "", name_english: "", name_indonesia: "", icon_image: "" };
    case "shop_items": return { rewards, price: 1, currency_code: "", unlock: { type: "none" }, display_order: 0, available_from: "", available_until: "" };
    case "milestones": return { required_points: 1, rewards, claimable: true, display_order: 0 };
  }
}

const schemas = { missions: eventMissionSchema, currencies: eventCurrencySchema, shop_items: eventShopItemSchema, milestones: eventMilestoneSchema };

export function moduleSchema(field: ModuleField, currencies: { currency_code: string }[]) {
  return z.object({
    missions: z.array(z.custom<EventMissionValues>()), currencies: z.array(z.custom<EventCurrencyValues>()),
    shop_items: z.array(z.custom<EventShopItemValues>()), milestones: z.array(z.custom<EventMilestoneValues>()),
  }).superRefine((values, ctx) => {
    const rows = values[field];
    const parsed = z.array(schemas[field]).safeParse(rows.map(row => "unlock" in row ? { ...row, unlock: cleanUnlock(row.unlock, false) } : row));
    if (!parsed.success) for (const issue of parsed.error.issues) ctx.addIssue({ ...issue, path: [field, ...issue.path] });
    const codes = new Set<string>();
    const currencyCodes = new Set(currencies.map((row) => row.currency_code));
    rows.forEach((row, index) => {
      const issue = (path: string, message: string) => ctx.addIssue({ code: "custom", path: [field, index, ...path.split(".")], message });
      if ("mission_code" in row || "currency_code" in row && field === "currencies") {
        const key = field === "missions" ? "mission_code" : "currency_code";
        const code = String((row as Record<string, unknown>)[key]).trim();
        if (codes.has(code)) issue(key, "Codes must be unique within this event.");
        codes.add(code);
      }
      if (field === "shop_items" && "currency_code" in row && !currencyCodes.has(row.currency_code)) issue("currency_code", "Select an existing event currency.");
      if ("rewards" in row) row.rewards.forEach((reward, rewardIndex) => {
        const key = reward.type === "item" ? "item_id" : reward.type === "card" ? "card_id" : reward.type === "event_currency" ? "currency_code" : undefined;
        if (key && !reward[key]?.trim()) issue(`rewards.${rewardIndex}.${key}`, "Select a reward target.");
        if (reward.type === "event_currency" && reward.currency_code && !currencyCodes.has(reward.currency_code)) issue(`rewards.${rewardIndex}.currency_code`, "Select an existing event currency.");
      });
      const dates = "starts_at" in row || field === "missions" ? ["starts_at", "ends_at"] : field === "shop_items" ? ["available_from", "available_until"] : [];
      const record = row as Record<string, unknown>;
      dates.forEach((key) => {
        const value = record[key] as string | undefined;
        if (value && !validDate(value)) issue(key, "Enter a valid UTC date and time.");
      });
      if (dates.length && record[dates[0]] && record[dates[1]] && validDate(String(record[dates[0]])) && validDate(String(record[dates[1]])) && utcIso(String(record[dates[0]]))! >= utcIso(String(record[dates[1]]))!) issue(dates[1], "End must be after start.");
      if ("unlock" in row) {
        const unlock = row.unlock;
        const key = { none: undefined, player_level: "level", event_points: "points", previous_stage: "stage_number", mission: "mission_code", datetime: "at" }[unlock.type] as keyof EventUnlock | undefined;
        if (key && (unlock[key] === undefined || unlock[key] === "")) issue(`unlock.${key}`, "Complete the unlock condition.");
        if (unlock.type === "datetime" && unlock.at && !validDate(unlock.at)) issue("unlock.at", "Enter a valid UTC date and time.");
      }
    });
  });
}

function validDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})?$/.test(value) && !Number.isNaN(new Date(`${utcInput(value)}Z`).getTime());
}

function cleanRewards(rewards: EventReward[]): EventReward[] {
  return rewards.map((reward) => ({ type: reward.type, quantity: reward.quantity,
    ...(reward.type === "item" ? { item_id: reward.item_id } : reward.type === "card" ? { card_id: reward.card_id } : reward.type === "event_currency" ? { currency_code: reward.currency_code } : {}),
  }));
}

function cleanUnlock(unlock: EventUnlock, serializeDate = true): EventUnlock {
  switch (unlock.type) {
    case "player_level": return { type: unlock.type, level: unlock.level };
    case "event_points": return { type: unlock.type, points: unlock.points };
    case "previous_stage": return { type: unlock.type, stage_number: unlock.stage_number };
    case "mission": return { type: unlock.type, mission_code: unlock.mission_code };
    case "datetime": return { type: unlock.type, at: serializeDate ? utcIso(unlock.at) : unlock.at };
    default: return { type: "none" };
  }
}

export function modulePayload(field: ModuleField, rows: ModuleFormValues[ModuleField]): unknown[] {
  return rows.map((row, index) => {
    const parsed = schemas[field].parse("unlock" in row ? { ...row, unlock: cleanUnlock(row.unlock, false) } : row);
    if ("mission_code" in parsed) return { ...parsed, condition: { ...parsed.condition, filters: Object.fromEntries(Object.entries(parsed.condition.filters).filter(([, value]) => value !== "" && value !== undefined)) }, rewards: cleanRewards(parsed.rewards), starts_at: utcIso(parsed.starts_at), ends_at: utcIso(parsed.ends_at) };
    if ("price" in parsed) return { ...parsed, rewards: cleanRewards(parsed.rewards), unlock: cleanUnlock(parsed.unlock), available_from: utcIso(parsed.available_from), available_until: utcIso(parsed.available_until), display_order: index };
    if ("required_points" in parsed) return { ...parsed, rewards: cleanRewards(parsed.rewards), display_order: index };
    return parsed;
  });
}
