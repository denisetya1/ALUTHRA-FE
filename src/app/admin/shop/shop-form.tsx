"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ImagePlus, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ItemOption } from "@/lib/admin-master-data";
import { shopSchema, type ShopValues } from "./schema";
import "../items/new/form.css";
import "../cards/cards.css";

export type ShopDefaults = Omit<ShopValues, "image_file"> & { image?: string };

export default function ShopForm({ mode = "create", listingId, initialValues, items }: { mode?: "create" | "edit"; listingId?: string; initialValues?: ShopDefaults; items: ItemOption[] }) {
  const router = useRouter();
  const { control, register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<ShopValues>({ resolver: zodResolver(shopSchema), defaultValues: initialValues ?? { title_english: "", title_indonesia: "", items: [{ item_id: "", quantity: 1 }], currency: "crown", price: 0, discount: 0, description_english: "", description_indonesia: "" } });
  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  async function submit(values: ShopValues) {
    try {
      const { image_file, ...body } = values;
      let image = initialValues?.image ?? "";
      const file = image_file?.[0];
      if (file) {
        const upload = new FormData();
        upload.set("file", file);
        upload.set("kind", "shop");
        const uploaded = await fetch("/api/admin/uploads", { method: "POST", body: upload });
        const uploadResult = await uploaded.json();
        if (!uploaded.ok) return setError("root", { message: uploadResult.message || "Unable to upload image." });
        image = uploadResult.url;
      }
      const response = await fetch(mode === "edit" ? `/api/admin/shop/${listingId}` : "/api/admin/shop", { method: mode === "edit" ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, image }) });
      const result = await response.json();
      if (!response.ok) return setError("root", { message: result.message || "Unable to save shop item." });
      router.push(`/admin/shop?${mode === "edit" ? "updated" : "created"}=1`); router.refresh();
    } catch { setError("root", { message: "Unable to save shop item." }); }
  }
  return <section className="item-editor">
    <Button variant="ghost" size="sm" asChild><Link href="/admin/shop"><ArrowLeft />Back to shop</Link></Button>
    <div className="editor-heading"><h1>{mode === "edit" ? "Edit shop item" : "Add shop item"}</h1><p className="muted">Choose an item and configure its selling price.</p></div>
    <form className="item-form" noValidate onSubmit={handleSubmit(submit)}><fieldset disabled={isSubmitting} className="editor-fieldset"><Card><CardHeader><CardTitle>Shop item</CardTitle><CardDescription>Each item can have one shop listing.</CardDescription></CardHeader><CardContent><div className="item-fields">
      <div className="editor-field"><Label htmlFor="title_english">Title (English) *</Label><Input id="title_english" {...register("title_english")}/>{errors.title_english && <small className="error">{errors.title_english.message}</small>}</div>
      <div className="editor-field"><Label htmlFor="title_indonesia">Title (Indonesia)</Label><Input id="title_indonesia" {...register("title_indonesia")}/>{errors.title_indonesia && <small className="error">{errors.title_indonesia.message}</small>}</div>
      <div className="editor-field editor-upload"><div className="evolve-material-heading"><div><Label>Bundle items *</Label><p className="muted">Add one or more items and set the quantity received.</p></div><Button type="button" variant="outline" size="sm" onClick={() => append({ item_id: "", quantity: 1 })}><Plus />Add item</Button></div><div className="evolve-material-list">{fields.map((field, index) => <div className="evolve-material-row" key={field.id}><div className="editor-field"><Label htmlFor={`shop-item-${index}`}>Item *</Label><select id={`shop-item-${index}`} {...register(`items.${index}.item_id`)}><option value="">Select item</option>{items.map((item) => <option key={item._id} value={item._id}>{item.name_english || item.name_indonesia || item._id}</option>)}</select>{errors.items?.[index]?.item_id && <small className="error">{errors.items[index]?.item_id?.message}</small>}</div><div className="editor-field"><Label htmlFor={`shop-quantity-${index}`}>Quantity *</Label><Input id={`shop-quantity-${index}`} type="number" min="1" step="1" {...register(`items.${index}.quantity`, { valueAsNumber: true })}/>{errors.items?.[index]?.quantity && <small className="error">{errors.items[index]?.quantity?.message}</small>}</div><Button type="button" variant="ghost" size="icon" aria-label={`Remove item ${index + 1}`} disabled={fields.length === 1} onClick={() => remove(index)}><Trash2 /></Button></div>)}</div>{errors.items?.message && <small className="error">{errors.items.message}</small>}</div>
      <div className="editor-field"><Label htmlFor="currency">Price currency *</Label><select id="currency" {...register("currency")}><option value="crown">Crown</option><option value="aether">Aether</option></select>{errors.currency && <small className="error">{errors.currency.message}</small>}</div>
      <div className="editor-field"><Label htmlFor="price">Price *</Label><Input id="price" type="number" min="0" step="1" {...register("price", { valueAsNumber: true })}/>{errors.price && <small className="error">{errors.price.message}</small>}</div>
      <div className="editor-field"><Label htmlFor="discount">Discount (%) *</Label><Input id="discount" type="number" min="0" max="100" step="1" {...register("discount", { valueAsNumber: true })}/>{errors.discount && <small className="error">{errors.discount.message}</small>}</div>
      <div className="editor-field editor-upload"><Label htmlFor="image_file">Shop image</Label><div className="upload-box"><div className="upload-icon"><ImagePlus size={22}/></div><div className="upload-copy"><p>Choose an image for this shop listing</p><span>PNG, JPG, or WebP · Up to 5 MB{initialValues?.image ? " · Leave empty to keep current image" : ""}</span></div><Input id="image_file" type="file" accept="image/png,image/jpeg,image/webp" {...register("image_file")}/></div>{errors.image_file && <small className="error">{errors.image_file.message}</small>}</div>
      <div className="editor-field"><Label htmlFor="description_english">Description (English)</Label><Textarea id="description_english" rows={4} {...register("description_english")}/>{errors.description_english && <small className="error">{errors.description_english.message}</small>}</div>
      <div className="editor-field"><Label htmlFor="description_indonesia">Description (Indonesia)</Label><Textarea id="description_indonesia" rows={4} {...register("description_indonesia")}/>{errors.description_indonesia && <small className="error">{errors.description_indonesia.message}</small>}</div>
    </div></CardContent></Card></fieldset>{errors.root && <p className="error">{errors.root.message}</p>}<div className="item-form-actions"><Button type="button" variant="outline" size="lg" asChild><Link href="/admin/shop">Cancel</Link></Button><Button type="submit" size="lg" className="form-save-button" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="animate-spin" /> : <Save />}{isSubmitting ? "Saving…" : mode === "edit" ? "Update shop item" : "Save shop item"}</Button></div></form>
  </section>;
}
