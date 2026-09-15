import { z } from "zod";

export const gameConfigSchema = z.object({
  maintenance_mode: z.boolean(),
  start_crown: z.number().int("Crown must be a whole number.").min(0, "Crown cannot be negative.").max(1_000_000_000),
  start_aether: z.number().int("Aether must be a whole number.").min(0, "Aether cannot be negative.").max(1_000_000_000),
  first_cards: z.object({
    solaris: z.string().regex(/^[a-f\d]{24}$/i, "Select a Solaris card."),
    sylvara: z.string().regex(/^[a-f\d]{24}$/i, "Select a Sylvara card."),
    umbra: z.string().regex(/^[a-f\d]{24}$/i, "Select an Umbra card."),
  }),
  force_update_enabled: z.boolean(),
  minimum_supported_version: z.string().trim().regex(/^\d+\.\d+\.\d+$/, "Use semantic version format, for example 1.2.0."),
});

export type GameConfigValues = z.infer<typeof gameConfigSchema>;
