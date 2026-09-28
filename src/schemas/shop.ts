import { z } from "zod";

const money = z.number({ error: "Enter a number." }).int("Use a whole number.").min(0, "Must be zero or greater.").max(Number.MAX_SAFE_INTEGER);

export const shopSchema = z.object({
  title_english: z.string().trim().min(1, "English title is required.").max(200),
  title_indonesia: z.string().trim().max(200),
  items: z.array(z.object({
    item_id: z.string().regex(/^[a-f\d]{24}$/i, "Select an item."),
    quantity: z.number({ error: "Enter a quantity." }).int("Use a whole number.").min(1, "Must be at least 1."),
  })).min(1, "Add at least one item.").max(100).refine((items) => new Set(items.map((item) => item.item_id)).size === items.length, "The same item cannot be added twice."),
  currency: z.enum(["crown", "aether"]),
  price: money,
  discount: z.number({ error: "Enter a number." }).int("Use a whole number.").min(0).max(100, "Maximum discount is 100%."),
  description_english: z.string().max(5000, "Maximum 5,000 characters."),
  description_indonesia: z.string().max(5000, "Maximum 5,000 characters."),
  image_file: z
    .custom<FileList | undefined>((value) => value === undefined || (typeof FileList !== "undefined" && value instanceof FileList), "Choose a valid file.")
    .refine((files) => !files?.length || files.length === 1, "Choose one image.")
    .refine((files) => !files?.length || files[0].size <= 5 * 1024 * 1024, "Maximum image size is 5 MB.")
    .refine((files) => !files?.length || ["image/png", "image/jpeg", "image/webp"].includes(files[0].type), "Choose a PNG, JPG, or WebP image."),
});
export type ShopValues = z.infer<typeof shopSchema>;
