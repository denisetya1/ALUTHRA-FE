import { z } from "zod";

const stat = z.number().int("Must be a whole number.").min(0, "Cannot be negative.").max(1_000_000_000);

export const gameConfigSchema = z.object({
  maintenance_mode: z.boolean(),
  starting_player_stats: z.object({
    level: stat.min(1, "Level must be at least 1."),
    experience: stat,
    experience_next: stat.min(1, "Next EXP must be at least 1."),
    stamina: stat,
    stamina_max: stat,
    valor: stat,
    valor_max: stat,
    fortitude: stat,
    fortitude_max: stat,
    crown: stat,
    aether: stat,
    honor: stat,
    honor_max: stat,
    attribute_point: stat,
    allies: stat,
    allies_max: stat,
    cards: stat,
    cards_max: stat,
    total_win: stat,
    total_lose: stat,
    charge_meter: stat,
    event_point: stat,
  }),
  first_cards: z.object({
    solaris: z.string().regex(/^[a-f\d]{24}$/i, "Select a Solaris card."),
    sylvara: z.string().regex(/^[a-f\d]{24}$/i, "Select a Sylvara card."),
    umbra: z.string().regex(/^[a-f\d]{24}$/i, "Select an Umbra card."),
  }),
  force_update_enabled: z.boolean(),
  minimum_supported_version: z.string().trim().regex(/^\d+\.\d+\.\d+$/, "Use semantic version format, for example 1.2.0."),
});

export type GameConfigValues = z.infer<typeof gameConfigSchema>;
