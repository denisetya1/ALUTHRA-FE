import { z } from "zod";
const amount = z
  .number({ error: "Enter a number." })
  .int("Use a whole number.")
  .min(0, "Must be zero or greater.")
  .max(Number.MAX_SAFE_INTEGER);
export const relicSchema = z.object({
  name_english: z.string().trim().min(1, "English name is required.").max(200),
  name_indonesia: z.string().trim().max(200),
  desc_english: z.string().max(5000),
  desc_indonesia: z.string().max(5000),
  effect: z.string().trim().min(1, "Effect is required.").max(100),
  effect_amount: amount,
  price: amount,
  discount: amount,
  shop: z.boolean(),
  image_file: z
    .custom<FileList | undefined>(
      (v) =>
        v === undefined ||
        (typeof FileList !== "undefined" && v instanceof FileList),
      "Choose a valid file.",
    )
    .refine(
      (f) => !f?.length || f[0].size <= 5 * 1024 * 1024,
      "Maximum image size is 5 MB.",
    )
    .refine(
      (f) =>
        !f?.length ||
        ["image/png", "image/jpeg", "image/webp"].includes(f[0].type),
      "Choose a PNG, JPG, or WebP image.",
    ),
});
export type RelicValues = z.infer<typeof relicSchema>;
