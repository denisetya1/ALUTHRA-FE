export type EventModules = {
  story: boolean;
  missions: boolean;
  boss: boolean;
  currency: boolean;
  shop: boolean;
  login_rewards: boolean;
  milestones: boolean;
  challenge_rules: boolean;
};

export type EventReward = {
  type: "item" | "card" | "crown" | "aether" | "event_currency";
  item_id?: string;
  card_id?: string;
  currency_code?: string;
  quantity: number;
};

export type EventUnlock = {
  type: "none" | "previous_stage" | "player_level" | "event_points" | "mission" | "datetime";
  level?: number;
  points?: number;
  stage_number?: number;
  mission_code?: string;
  at?: string;
};

export type EventStage = {
  stage_number: number;
  name_english: string;
  name_indonesia?: string;
  description_english?: string;
  description_indonesia?: string;
  story_text_english?: string;
  story_text_indonesia?: string;
  enemy_ids?: string[];
  recommended_power?: number;
  energy_cost?: number;
  difficulty: "normal" | "hard" | "very_hard";
  first_clear_rewards: EventReward[];
  repeat_rewards: EventReward[];
  unlock: EventUnlock;
  attempts_per_day?: number;
  repeatable: boolean;
};

export type EventCondition = {
  type: string;
  target: number;
  filters?: {
    realm?: string;
    rarity?: number;
    character_id?: string;
    stage_number?: number;
    battle_type?: string;
    item_id?: string;
    currency?: string;
  };
};

export type EventMission = {
  mission_code: string;
  name_english: string;
  name_indonesia?: string;
  description_english?: string;
  description_indonesia?: string;
  condition: EventCondition;
  rewards: EventReward[];
  points?: number;
  repeatable: boolean;
  reset_type: "none" | "daily" | "weekly";
  starts_at?: string;
  ends_at?: string;
};

export type EventCurrency = {
  currency_code: string;
  name_english: string;
  name_indonesia?: string;
  icon_image?: string;
  max_carry?: number;
  grace_period_days?: number;
};

export type EventShopItem = {
  rewards: EventReward[];
  price: number;
  currency_code: string;
  purchase_limit?: number;
  daily_limit?: number;
  unlock: EventUnlock;
  available_from?: string;
  available_until?: string;
  display_order: number;
};

export type EventMilestone = {
  required_points: number;
  rewards: EventReward[];
  claimable: boolean;
  display_order: number;
};

export type EventDefinition = {
  _id: string;
  code: string;
  name_english: string;
  name_indonesia?: string;
  description_short_english?: string;
  description_short_indonesia?: string;
  description_english?: string;
  description_indonesia?: string;
  status: "draft" | "scheduled" | "active" | "ended" | "disabled";
  start_at: string;
  end_at: string;
  visibility_start_at?: string;
  visibility_end_at?: string;
  min_player_level?: number;
  realm_restriction?: string[];
  banner_image?: string;
  background_image?: string;
  icon_image?: string;
  priority?: number;
  featured?: boolean;
  tags?: string[];
  modules: EventModules;
  template?: string;
  stages: EventStage[];
  missions: EventMission[];
  currencies: EventCurrency[];
  shop_items: EventShopItem[];
  milestones: EventMilestone[];
  createdAt?: string;
  updatedAt?: string;
};

export type EventListItem = Pick<
  EventDefinition,
  "_id" | "code" | "name_english" | "name_indonesia" | "status" | "start_at" | "end_at" | "modules" | "featured" | "priority" | "realm_restriction" | "tags" | "banner_image" | "updatedAt"
>;

export type ValidationIssue = { level: "error" | "warning"; field: string; message: string };

export type EventOption = { _id: string; code: string; name_english: string; status: string };
