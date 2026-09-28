"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ImagePlus, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CardOption, ItemOption, PlayerOption } from "@/lib/admin-master-data";
import { presentSchema, type PresentValues } from "@/schemas/present";
import { useSavePresent } from "@/hooks/use-presents";
import { useUpload } from "@/hooks/use-upload";

export type PresentDefaults = Omit<PresentValues, "image_file"> & { image?: string };
export default function PresentForm({ mode = "create", presentId, initialValues, items, cards, players }: { mode?: "create" | "edit"; presentId?: string; initialValues?: PresentDefaults; items: ItemOption[]; cards: CardOption[]; players: PlayerOption[] }) {
  const router = useRouter();
  const savePresent = useSavePresent();
  const uploadImage = useUpload();
  const { control, register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<PresentValues>({ resolver: zodResolver(presentSchema), defaultValues: initialValues ?? { title: "", player_id: "", status: "unclaimed", items: [], cards: [], gacha: 0, gold: 0, aether: 0 } });
  const itemFields = useFieldArray({ control, name: "items" });
  const cardFields = useFieldArray({ control, name: "cards" });
  const fail = (message: string) => { setError("root", { message }); toast.error(message); };
  async function submit(values: PresentValues) {
    try {
      const { image_file, ...body } = values;
      let image = initialValues?.image ?? "";
      if (image_file?.[0]) image = (await uploadImage.mutateAsync({ file: image_file[0], kind: "presents" })).url;
      await savePresent.mutateAsync({ id: mode === "edit" ? presentId : undefined, payload: { ...body, image } });
      toast.success(mode === "edit" ? "Present updated successfully." : "Present created successfully.");
      router.push(`/admin/presents?${mode === "edit" ? "updated" : "created"}=1`); router.refresh();
    } catch (error) { fail(error instanceof Error ? error.message : "Unable to save present."); }
  }
  const pending = isSubmitting || savePresent.isPending;
  const rewards = (kind: "items" | "cards") => {
    const fields = kind === "items" ? itemFields.fields : cardFields.fields;
    const options = kind === "items" ? items : cards;
    const append = kind === "items" ? itemFields.append : cardFields.append;
    const remove = kind === "items" ? itemFields.remove : cardFields.remove;
    return <div className="grid min-w-0 content-start gap-2 col-span-full"><div className="flex items-start justify-between gap-4"><div><Label>{kind === "items" ? "Items" : "Cards"}</Label><p className="text-muted-foreground">Optional rewards with quantity.</p></div><Button type="button" variant="outline" size="sm" onClick={() => append({ id: "", quantity: 1 })}><Plus />Add {kind === "items" ? "item" : "card"}</Button></div><div className="mt-4 grid gap-3">{fields.map((field, index) => <div className="grid grid-cols-[minmax(0,1fr)_minmax(100px,180px)_40px] items-end gap-3 max-[800px]:grid-cols-[minmax(0,1fr)_110px_40px]" key={field.id}><div className="grid min-w-0 content-start gap-2"><Label>Reward *</Label><select {...register(`${kind}.${index}.id` as const)}><option value="">Select {kind === "items" ? "item" : "card"}</option>{options.map((option) => <option key={option._id} value={option._id}>{kind === "cards" ? (option as CardOption).name : (option as ItemOption).name_english || (option as ItemOption).name_indonesia || option._id}</option>)}</select></div><div className="grid min-w-0 content-start gap-2"><Label>Quantity *</Label><Input type="number" min="1" {...register(`${kind}.${index}.quantity` as const, { valueAsNumber: true })}/></div><Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} aria-label={`Remove ${kind} reward`}><Trash2 /></Button></div>)}</div>{errors[kind]?.message && <small className="text-sm text-destructive">{errors[kind]?.message}</small>}</div>;
  };
  return <section className="mx-auto max-w-[960px]"><Button variant="ghost" size="sm" asChild><Link href="/admin/presents"><ArrowLeft />Back to presents</Link></Button><div className="my-6 mb-7"><h1>{mode === "edit" ? "Edit present" : "Add present"}</h1><p className="text-muted-foreground">Send a reward package to a player.</p></div><form className="mt-6" noValidate onSubmit={handleSubmit(submit, () => toast.error("Please correct the highlighted present fields."))}><fieldset disabled={pending} className="m-0 grid min-w-0 gap-6 border-0 p-0 disabled:opacity-65"><Card><CardHeader><CardTitle>Present details</CardTitle><CardDescription>Recipient, status, artwork, and rewards.</CardDescription></CardHeader><CardContent><div className="grid grid-cols-2 gap-6 max-[800px]:grid-cols-1">
    <div className="grid min-w-0 content-start gap-2"><Label htmlFor="title">Title *</Label><Input id="title" {...register("title")}/>{errors.title && <small className="text-sm text-destructive">{errors.title.message}</small>}</div>
    <div className="grid min-w-0 content-start gap-2"><Label htmlFor="player_id">Player *</Label><select id="player_id" {...register("player_id")}><option value="">Select player</option>{players.map((player) => <option key={player._id} value={player._id}>{player.username || player.email} · {player.email}</option>)}</select>{errors.player_id && <small className="text-sm text-destructive">{errors.player_id.message}</small>}</div>
    <div className="grid min-w-0 content-start gap-2"><Label htmlFor="status">Status *</Label><select id="status" {...register("status")}><option value="unclaimed">Unclaimed</option><option value="claimed">Claimed</option></select></div>
    <div className="grid min-w-0 content-start gap-2 col-span-full"><Label htmlFor="image_file">Present image</Label><div className="flex flex-wrap items-center gap-4 rounded-lg border border-dashed border-border bg-[var(--page)] p-[22px]"><div className="rounded-lg border border-border bg-background p-3 text-muted-foreground"><ImagePlus size={22}/></div><div className="min-w-0 flex-1"><p>Choose present artwork</p><span>PNG, JPG, or WebP · Up to 5 MB{initialValues?.image ? " · Leave empty to keep current image" : ""}</span></div><Input id="image_file" type="file" accept="image/png,image/jpeg,image/webp" {...register("image_file")}/></div>{errors.image_file && <small className="text-sm text-destructive">{errors.image_file.message}</small>}</div>
    {rewards("items")}{rewards("cards")}
    {(["gacha", "gold", "aether"] as const).map((name) => <div className="grid min-w-0 content-start gap-2" key={name}><Label htmlFor={name}>{name === "gold" ? "Gold (Crown)" : name[0].toUpperCase() + name.slice(1)} *</Label><Input id={name} type="number" min="0" step="1" {...register(name, { valueAsNumber: true })}/>{errors[name] && <small className="text-sm text-destructive">{errors[name]?.message}</small>}</div>)}
  </div></CardContent></Card></fieldset>{errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}<div className="flex justify-end gap-3 py-6"><Button type="button" variant="outline" size="lg" asChild><Link href="/admin/presents">Cancel</Link></Button><Button type="submit" size="lg" className="min-w-[136px]" disabled={pending}>{pending ? <Loader2 className="animate-spin"/> : <Save />}{pending ? "Saving…" : mode === "edit" ? "Update present" : "Save present"}</Button></div></form></section>;
}
