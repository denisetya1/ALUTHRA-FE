import { z } from "zod";

export const regionSchema = z.object({
  source_id: z.string().trim().min(1, "Source ID is required.").max(100),
  order_number: z.number().int().min(1, "Order must be at least 1."),
  name_english: z.string().trim().min(1, "English name is required.").max(200),
  name_indonesia: z.string().trim().min(1, "Indonesian name is required.").max(200),
  description_english: z.string().trim().max(5000),
  description_indonesia: z.string().trim().max(5000),
  scope: z.string().trim().min(1).max(100),
  realms_text: z.string().trim().min(1, "At least one realm is required.").max(200),
  requirement: z.string().trim().min(1).max(100),
  image: z.string(),
  image_file: z.custom<FileList | undefined>((value) => value === undefined || (typeof FileList !== "undefined" && value instanceof FileList), "Choose a valid file.").refine((files) => !files?.length || files.length === 1, "Choose one image.").refine((files) => !files?.length || files[0].size <= 5 * 1024 * 1024, "Maximum image size is 5 MB.").refine((files) => !files?.length || ["image/png", "image/jpeg", "image/webp"].includes(files[0].type), "Choose a PNG, JPG, or WebP image."),
  show: z.boolean(),
});
export type RegionValues = z.infer<typeof regionSchema>;
