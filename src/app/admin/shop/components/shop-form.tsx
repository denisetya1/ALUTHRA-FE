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
import { Textarea } from "@/components/ui/textarea";
import type { ItemOption } from "@/lib/admin-master-data";
import { shopSchema, type ShopValues } from "@/schemas/shop";
import { useSaveShopItem } from "@/hooks/use-shop";
import { useUpload } from "@/hooks/use-upload";

export type ShopDefaults = Omit<ShopValues, "image_file"> & { image?: string };

export default function ShopForm({ mode = "create", listingId, initialValues, items }: { mode?: "create" | "edit"; listingId?: string; initialValues?: ShopDefaults; items: ItemOption[] }) {
  const router = useRouter();
  const saveShopItem = useSaveShopItem();
  const uploadImage = useUpload();
  const { control, register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<ShopValues>({ resolver: zodResolver(shopSchema), defaultValues: initialValues ?? { title_english: "", title_indonesia: "", items: [{ item_id: "", quantity: 1 }], currency: "crown", price: 0, discount: 0, description_english: "", description_indonesia: "" } });
  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const fail = (message: string) => { setError("root", { message }); toast.error(message); };
  async function submit(values: ShopValues) {
    try {
      const { image_file, ...body } = values;
      let image = initialValues?.image ?? "";
      const file = image_file?.[0];
      if (file) {
        image = (await uploadImage.mutateAsync({ file, kind: "shop" })).url;
      }
      await saveShopItem.mutateAsync({ id: mode === "edit" ? listingId : undefined, payload: { ...body, image } });
      toast.success(mode === "edit" ? "Shop item updated successfully." : "Shop item created successfully.");
      router.push(`/admin/shop?${mode === "edit" ? "updated" : "created"}=1`); router.refresh();
    } catch (error) { fail(error instanceof Error ? error.message : "Unable to save shop item."); }
  }
  const pending = isSubmitting || saveShopItem.isPending;
  return <section className="mx-auto max-w-[960px]">
    <Button variant="ghost" size="sm" asChild><Link href="/admin/shop"><ArrowLeft />Back to shop</Link></Button>
    <div className="my-6 mb-7"><h1>{mode === "edit" ? "Edit shop item" : "Add shop item"}</h1><p className="text-muted-foreground">Choose an item and configure its selling price.</p></div>
    <form className="mt-6" noValidate onSubmit={handleSubmit(submit, () => toast.error("Please correct the highlighted shop fields."))}><fieldset disabled={pending} className="m-0 grid min-w-0 gap-6 border-0 p-0 disabled:opacity-65"><Card><CardHeader><CardTitle>Shop item</CardTitle><CardDescription>Each item can have one shop listing.</CardDescription></CardHeader><CardContent><div className="grid grid-cols-2 gap-6 max-[800px]:grid-cols-1">
      <div className="grid min-w-0 content-start gap-2"><Label htmlFor="title_english">Title (English) *</Label><Input id="title_english" {...register("title_english")}/>{errors.title_english && <small className="text-sm text-destructive">{errors.title_english.message}</small>}</div>
      <div className="grid min-w-0 content-start gap-2"><Label htmlFor="title_indonesia">Title (Indonesia)</Label><Input id="title_indonesia" {...register("title_indonesia")}/>{errors.title_indonesia && <small className="text-sm text-destructive">{errors.title_indonesia.message}</small>}</div>
      <div className="grid min-w-0 content-start gap-2 col-span-full"><div className="flex items-start justify-between gap-4"><div><Label>Bundle items *</Label><p className="text-muted-foreground">Add one or more items and set the quantity received.</p></div><Button type="button" variant="outline" size="sm" onClick={() => append({ item_id: "", quantity: 1 })}><Plus />Add item</Button></div><div className="mt-4 grid gap-3">{fields.map((field, index) => <div className="grid grid-cols-[minmax(0,1fr)_minmax(100px,180px)_40px] items-end gap-3 max-[800px]:grid-cols-[minmax(0,1fr)_110px_40px]" key={field.id}><div className="grid min-w-0 content-start gap-2"><Label htmlFor={`shop-item-${index}`}>Item *</Label><select id={`shop-item-${index}`} {...register(`items.${index}.item_id`)}><option value="">Select item</option>{items.map((item) => <option key={item._id} value={item._id}>{item.name_english || item.name_indonesia || item._id}</option>)}</select>{errors.items?.[index]?.item_id && <small className="text-sm text-destructive">{errors.items[index]?.item_id?.message}</small>}</div><div className="grid min-w-0 content-start gap-2"><Label htmlFor={`shop-quantity-${index}`}>Quantity *</Label><Input id={`shop-quantity-${index}`} type="number" min="1" step="1" {...register(`items.${index}.quantity`, { valueAsNumber: true })}/>{errors.items?.[index]?.quantity && <small className="text-sm text-destructive">{errors.items[index]?.quantity?.message}</small>}</div><Button type="button" variant="ghost" size="icon" aria-label={`Remove item ${index + 1}`} disabled={fields.length === 1} onClick={() => remove(index)}><Trash2 /></Button></div>)}</div>{errors.items?.message && <small className="text-sm text-destructive">{errors.items.message}</small>}</div>
      <div className="grid min-w-0 content-start gap-2"><Label htmlFor="currency">Price currency *</Label><select id="currency" {...register("currency")}><option value="crown">Crown</option><option value="aether">Aether</option></select>{errors.currency && <small className="text-sm text-destructive">{errors.currency.message}</small>}</div>
      <div className="grid min-w-0 content-start gap-2"><Label htmlFor="price">Price *</Label><Input id="price" type="number" min="0" step="1" {...register("price", { valueAsNumber: true })}/>{errors.price && <small className="text-sm text-destructive">{errors.price.message}</small>}</div>
      <div className="grid min-w-0 content-start gap-2"><Label htmlFor="discount">Discount (%) *</Label><Input id="discount" type="number" min="0" max="100" step="1" {...register("discount", { valueAsNumber: true })}/>{errors.discount && <small className="text-sm text-destructive">{errors.discount.message}</small>}</div>
      <div className="grid min-w-0 content-start gap-2 col-span-full"><Label htmlFor="image_file">Shop image</Label><div className="flex flex-wrap items-center gap-4 rounded-lg border border-dashed border-border bg-[var(--page)] p-[22px]"><div className="rounded-lg border border-border bg-background p-3 text-muted-foreground"><ImagePlus size={22}/></div><div className="min-w-0 flex-1"><p>Choose an image for this shop listing</p><span>PNG, JPG, or WebP · Up to 5 MB{initialValues?.image ? " · Leave empty to keep current image" : ""}</span></div><Input id="image_file" type="file" accept="image/png,image/jpeg,image/webp" {...register("image_file")}/></div>{errors.image_file && <small className="text-sm text-destructive">{errors.image_file.message}</small>}</div>
      <div className="grid min-w-0 content-start gap-2"><Label htmlFor="description_english">Description (English)</Label><Textarea id="description_english" rows={4} {...register("description_english")}/>{errors.description_english && <small className="text-sm text-destructive">{errors.description_english.message}</small>}</div>
      <div className="grid min-w-0 content-start gap-2"><Label htmlFor="description_indonesia">Description (Indonesia)</Label><Textarea id="description_indonesia" rows={4} {...register("description_indonesia")}/>{errors.description_indonesia && <small className="text-sm text-destructive">{errors.description_indonesia.message}</small>}</div>
    </div></CardContent></Card></fieldset>{errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}<div className="flex justify-end gap-3 py-6"><Button type="button" variant="outline" size="lg" asChild><Link href="/admin/shop">Cancel</Link></Button><Button type="submit" size="lg" className="min-w-[136px]" disabled={pending}>{pending ? <Loader2 className="animate-spin" /> : <Save />}{pending ? "Saving…" : mode === "edit" ? "Update shop item" : "Save shop item"}</Button></div></form>
  </section>;
}
