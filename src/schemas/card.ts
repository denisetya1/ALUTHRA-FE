import { z } from "zod";

const whole = z
  .number({ error: "Enter a number." })
  .int("Use a whole number.")
  .min(0, "Must be zero or greater.")
  .max(Number.MAX_SAFE_INTEGER);
const positive = z
  .number({ error: "Enter a number." })
  .int("Use a whole number.")
  .min(1, "Must be at least 1.")
  .max(1000);
const imageFile = z
  .custom<FileList | undefined>(
    (value) =>
      value === undefined ||
      (typeof FileList !== "undefined" && value instanceof FileList),
    "Choose a valid file.",
  )
  .refine(
    (files) => !files?.length || files[0].size <= 5 * 1024 * 1024,
    "Maximum image size is 5 MB.",
  )
  .refine(
    (files) =>
      !files?.length ||
      ["image/png", "image/jpeg", "image/webp"].includes(files[0].type),
    "Choose a PNG, JPG, or WebP image.",
  );

export const cardSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required.").max(200),
    realm: z.string().trim().min(1, "Realm is required.").max(50),
    rarity: z.number().int().min(0).max(4),
    level: positive,
    level_max: positive,
    cost: whole,
    valor: whole,
    valor_max: whole,
    fortitude: whole,
    fortitude_max: whole,
    evolution: positive.max(100),
    evolution_max: positive.max(20),
    evolve_cost_crown: whole,
    evolve_materials: z
      .array(
        z.object({
          item_id: z.string().regex(/^[a-f\d]{24}$/i, "Select an item."),
          amount: z.number().int().min(1, "Must be at least 1."),
        }),
      )
      .max(100),
    price: whole,
    gacha: z.boolean(),
    high: z.boolean(),
    skills: z
      .array(
        z.object({
          skill_id: z.string().regex(/^[a-f\d]{24}$/i),
          min_evolution: z.number().int().min(1).max(20),
        }),
      )
      .max(100),
    description_english: z.string().max(5000),
    description_indonesia: z.string().max(5000),
    evolution_images: z
      .array(
        z.object({
          full: imageFile,
          default: imageFile,
          deck: imageFile,
          thumb: imageFile,
        }),
      )
      .max(20),
  })
  .refine((data) => data.level <= data.level_max, {
    path: ["level_max"],
    message: "Max level cannot be below level.",
  })
  .refine((data) => data.valor <= data.valor_max, {
    path: ["valor_max"],
    message: "Max valor cannot be below valor.",
  })
  .refine((data) => data.fortitude <= data.fortitude_max, {
    path: ["fortitude_max"],
    message: "Max fortitude cannot be below fortitude.",
  })
  .refine((data) => data.evolution <= data.evolution_max, {
    path: ["evolution_max"],
    message: "Max evolution cannot be below evolution.",
  })
  .refine(
    (data) =>
      new Set(data.evolve_materials.map((material) => material.item_id)).size ===
      data.evolve_materials.length,
    {
      path: ["evolve_materials"],
      message: "The same material cannot be selected twice.",
    },
  )
  .refine(
    (data) =>
      data.skills.every((skill) => skill.min_evolution <= data.evolution_max),
    {
      path: ["skills"],
      message: "Skill unlock evolution cannot exceed max evolution.",
    },
  )
  .refine(
    (data) =>
      new Set(data.skills.map((skill) => skill.skill_id)).size ===
      data.skills.length,
    {
      path: ["skills"],
      message: "The same skill cannot be selected twice.",
    },
  );

export type CardValues = z.infer<typeof cardSchema>;
