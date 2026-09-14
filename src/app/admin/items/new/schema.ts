import { z } from "zod";

const amount = z
  .number({ error: "Enter a number." })
  .int("Use a whole number.")
  .min(0, "Must be zero or greater.")
  .max(Number.MAX_SAFE_INTEGER, "Value is too large.");
export const itemFormSchema = z.object({
  name_english: z
    .string()
    .trim()
    .min(1, "English name is required.")
    .max(200, "Maximum 200 characters."),
  name_indonesia: z.string().trim().max(200, "Maximum 200 characters."),
  desc_english: z.string().max(5000, "Maximum 5,000 characters."),
  desc_indonesia: z.string().max(5000, "Maximum 5,000 characters."),
  effect: z
    .string()
    .trim()
    .min(1, "Effect is required.")
    .max(100, "Maximum 100 characters."),
  effect_amount: amount,
  price: amount,
  discount: amount,
  shop: z.boolean(),
  image_file: z
    .custom<FileList | undefined>(
      (value) =>
        value === undefined ||
        (typeof FileList !== "undefined" && value instanceof FileList),
      "Choose a valid file.",
    )
    .refine(
      (files) => !files?.length || files.length === 1,
      "Choose one image.",
    )
    .refine(
      (files) => !files?.length || files[0].size <= 5 * 1024 * 1024,
      "Maximum image size is 5 MB.",
    )
    .refine(
      (files) => !files?.length || files[0].size > 0,
      "The image is empty.",
    )
    .refine(
      (files) =>
        !files?.length ||
        ["image/png", "image/jpeg", "image/webp"].includes(files[0].type),
      "Choose a PNG, JPG, or WebP image.",
    ),
});
export type ItemFormValues = z.infer<typeof itemFormSchema>;
