import { z } from "zod";

const amount = z.number({ error: "Enter a number." }).int("Use a whole number.").min(0, "Must be zero or greater.").max(Number.MAX_SAFE_INTEGER);
const reward = z.object({ id: z.string().regex(/^[a-f\d]{24}$/i, "Select a reward."), quantity: amount.min(1, "Must be at least 1.") });
const uniqueRewards = (values: { id: string }[]) => new Set(values.map((value) => value.id)).size === values.length;
const imageFile = z.custom<FileList | undefined>((value) => value === undefined || (typeof FileList !== "undefined" && value instanceof FileList), "Choose a valid file.").refine((files) => !files?.length || files[0].size <= 5 * 1024 * 1024, "Maximum image size is 5 MB.").refine((files) => !files?.length || ["image/png", "image/jpeg", "image/webp"].includes(files[0].type), "Choose a PNG, JPG, or WebP image.");

export const presentSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(200),
  player_id: z.string().regex(/^[a-f\d]{24}$/i, "Select a player."),
  status: z.enum(["unclaimed", "claimed"]),
  items: z.array(reward).max(100).refine(uniqueRewards, "The same item cannot be added twice."),
  cards: z.array(reward).max(100).refine(uniqueRewards, "The same card cannot be added twice."),
  gacha: amount,
  gold: amount,
  aether: amount,
  image_file: imageFile,
});
export type PresentValues = z.infer<typeof presentSchema>;
