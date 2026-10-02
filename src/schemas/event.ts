import { z } from "zod";

export const EVENT_MODULE_KEYS = [
  "story",
  "missions",
  "boss",
  "currency",
  "shop",
  "login_rewards",
  "milestones",
  "challenge_rules",
] as const;

export const MODULE_LABELS: Record<(typeof EVENT_MODULE_KEYS)[number], string> = {
  story: "Story",
  missions: "Missions",
  boss: "Boss",
  currency: "Currency",
  shop: "Exchange Shop",
  login_rewards: "Login Rewards",
  milestones: "Milestones",
  challenge_rules: "Challenge Rules",
};

export const MISSION_CONDITION_TYPES = [
  "BATTLE_WIN",
  "BATTLE_COMPLETE",
  "BOSS_DEFEAT",
  "BOSS_DAMAGE",
  "CARD_LEVEL_UP",
  "CARD_EVOLVE",
  "SUMMON",
  "PVP_WIN",
  "PVP_BATTLE",
  "EVENT_STAGE_CLEAR",
  "LOGIN",
  "SPEND_GOLD",
  "SPEND_DIAMOND",
  "COLLECT_ITEM",
] as const;

export const EVENT_TEMPLATES = {
  blank: { label: "Blank (no modules)", modules: null },
  mini: {
    label: "Mini Event",
    description: "Missions, Milestone Rewards, Login Rewards",
    modules: { story: false, missions: true, boss: false, currency: false, shop: false, login_rewards: true, milestones: true, challenge_rules: false },
  },
  standard: {
    label: "Standard Event",
    description: "Story, Missions, Event Currency, Exchange Shop",
    modules: { story: true, missions: true, boss: false, currency: true, shop: true, login_rewards: false, milestones: false, challenge_rules: false },
  },
  major: {
    label: "Major Event",
    description: "Story, Boss, Missions, Currency, Shop, Login Rewards, Milestones",
    modules: { story: true, missions: true, boss: true, currency: true, shop: true, login_rewards: true, milestones: true, challenge_rules: false },
  },
} as const;

export const EVENT_STATUSES = ["draft", "scheduled", "active", "ended", "disabled"] as const;

const quantity = z.number({ error: "Enter a number." }).int("Use a whole number.").min(1, "Must be at least 1.").max(Number.MAX_SAFE_INTEGER, "Value is too large.");

export const rewardSchema = z.object({
  type: z.enum(["item", "card", "crown", "aether", "event_currency"]),
  item_id: z.string().optional(),
  card_id: z.string().optional(),
  currency_code: z.string().optional(),
  quantity,
}).superRefine((reward, context) => {
  for (const [type, field] of [["item", "item_id"], ["card", "card_id"]] as const) {
    if (reward.type === type && !/^[a-f\d]{24}$/i.test(reward[field] ?? "")) {
      context.addIssue({ code: "custom", path: [field], message: `Choose a valid ${type}.` });
    }
  }
  if (reward.type === "event_currency" && !reward.currency_code?.trim()) {
    context.addIssue({ code: "custom", path: ["currency_code"], message: "Choose an event currency." });
  }
});

export const unlockSchema = z.object({
  type: z.enum(["none", "previous_stage", "player_level", "event_points", "mission", "datetime"]),
  level: z.number().int().min(0).optional(),
  points: z.number().int().min(0).optional(),
  stage_number: z.number().int().min(1).optional(),
  mission_code: z.string().optional(),
  at: z.string().optional(),
});

export const eventBaseSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(2, "Internal code is required.")
      .max(60, "Maximum 60 characters.")
      .regex(/^[a-z0-9][a-z0-9_-]*$/, "Use lowercase letters, numbers, dashes, or underscores."),
    name_english: z.string().trim().min(1, "English name is required.").max(200, "Maximum 200 characters."),
    name_indonesia: z.string().trim().max(200, "Maximum 200 characters."),
    description_short_english: z.string().max(500, "Maximum 500 characters."),
    description_short_indonesia: z.string().max(500, "Maximum 500 characters."),
    description_english: z.string().max(20000, "Maximum 20,000 characters."),
    description_indonesia: z.string().max(20000, "Maximum 20,000 characters."),
    start_at: z.string().min(1, "Start date is required."),
    end_at: z.string().min(1, "End date is required."),
    visibility_start_at: z.string().optional(),
    visibility_end_at: z.string().optional(),
    min_player_level: z.number().int().min(1).max(9999).optional(),
    realm_restriction: z.array(z.string()).max(3),
    banner_image: z.string().max(500),
    background_image: z.string().max(500),
    icon_image: z.string().max(500),
    priority: z.number().int().min(0).max(9999),
    featured: z.boolean(),
    tags: z.array(z.string().trim().max(50)).max(20),
    modules: z.object({
      story: z.boolean(),
      missions: z.boolean(),
      boss: z.boolean(),
      currency: z.boolean(),
      shop: z.boolean(),
      login_rewards: z.boolean(),
      milestones: z.boolean(),
      challenge_rules: z.boolean(),
    }),
  })
  .refine((values) => new Date(values.start_at) < new Date(values.end_at), {
    error: "Start date must be earlier than end date.",
    path: ["end_at"],
  })
  .refine(
    (values) =>
      !values.visibility_start_at || !values.visibility_end_at || new Date(values.visibility_start_at) <= new Date(values.visibility_end_at),
    { error: "Visibility start must be before visibility end.", path: ["visibility_end_at"] },
  );

export type EventBaseValues = z.infer<typeof eventBaseSchema>;

export const eventStageSchema = z.object({
  stage_number: z.number({ error: "Enter a number." }).int("Use a whole number.").min(1, "Must be at least 1.").max(999),
  name_english: z.string().trim().min(1, "Stage name is required.").max(200),
  name_indonesia: z.string().trim().max(200),
  description_english: z.string().max(5000),
  description_indonesia: z.string().max(5000),
  story_text_english: z.string().max(20000),
  story_text_indonesia: z.string().max(20000),
  enemy_ids: z.array(z.string()).max(10),
  recommended_power: z.number().int().min(0).max(10_000_000).optional(),
  energy_cost: z.number().int().min(0).max(999).optional(),
  difficulty: z.enum(["normal", "hard", "very_hard"]),
  first_clear_rewards: z.array(rewardSchema).max(20),
  repeat_rewards: z.array(rewardSchema).max(20),
  unlock: unlockSchema,
  attempts_per_day: z.number().int().min(0).max(999).optional(),
  repeatable: z.boolean(),
});

export type EventStageValues = z.infer<typeof eventStageSchema>;

export const eventMissionSchema = z.object({
  mission_code: z
    .string()
    .trim()
    .min(1, "Mission code is required.")
    .max(50)
    .regex(/^[a-z0-9_-]+$/, "Use lowercase letters, numbers, dashes, or underscores."),
  name_english: z.string().trim().min(1, "Mission name is required.").max(200),
  name_indonesia: z.string().trim().max(200),
  description_english: z.string().max(5000),
  description_indonesia: z.string().max(5000),
  condition: z.object({
    type: z.enum(MISSION_CONDITION_TYPES),
    target: quantity,
    filters: z.object({
      realm: z.string().max(50).optional(),
      rarity: z.number().int().min(0).max(4).optional(),
      character_id: z.string().optional(),
      stage_number: z.number().int().min(1).optional(),
      battle_type: z.string().max(50).optional(),
      item_id: z.string().optional(),
      currency: z.string().max(50).optional(),
    }),
  }),
  rewards: z.array(rewardSchema).min(1, "Add at least one reward."),
  points: z.number().int().min(0).max(1_000_000).optional(),
  repeatable: z.boolean(),
  reset_type: z.enum(["none", "daily", "weekly"]),
  starts_at: z.string().optional(),
  ends_at: z.string().optional(),
});

export type EventMissionValues = z.infer<typeof eventMissionSchema>;

export const eventCurrencySchema = z.object({
  currency_code: z
    .string()
    .trim()
    .min(1, "Currency code is required.")
    .max(50)
    .regex(/^[a-z0-9_-]+$/, "Use lowercase letters, numbers, dashes, or underscores."),
  name_english: z.string().trim().min(1, "Name is required.").max(100),
  name_indonesia: z.string().trim().max(100),
  icon_image: z.string().max(500),
  max_carry: z.number().int().min(0).max(10_000_000).optional(),
  grace_period_days: z.number().int().min(0).max(365).optional(),
});

export type EventCurrencyValues = z.infer<typeof eventCurrencySchema>;

export const eventShopItemSchema = z.object({
  rewards: z.array(rewardSchema).min(1, "Add at least one reward."),
  price: quantity,
  currency_code: z.string().trim().min(1, "Currency is required.").max(50),
  purchase_limit: z.number().int().min(0).max(999_999).optional(),
  daily_limit: z.number().int().min(0).max(999).optional(),
  unlock: unlockSchema,
  available_from: z.string().optional(),
  available_until: z.string().optional(),
  display_order: z.number().int().min(0).max(9999),
});

export type EventShopItemValues = z.infer<typeof eventShopItemSchema>;

export const eventMilestoneSchema = z.object({
  required_points: quantity,
  rewards: z.array(rewardSchema).min(1, "Add at least one reward."),
  claimable: z.boolean(),
  display_order: z.number().int().min(0).max(9999),
});

export type EventMilestoneValues = z.infer<typeof eventMilestoneSchema>;
