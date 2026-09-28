"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ImagePlus, Loader2, Save } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { regionSchema, type RegionValues } from "./schema";
import { useManagedMutation } from "@/lib/react-query";
import "../../../../../items/new/form.css";

export default function RegionForm({ mode, arcId, chapterId, regionId, initialValues }: { mode: "add" | "edit"; arcId: string; chapterId: string; regionId?: string; initialValues: RegionValues }) {
  const router = useRouter();
  const saveRegion = useManagedMutation([["quests"], ["regions"]]);
  const back = `/admin/quests/${arcId}/${chapterId}`;
  const { control, register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<RegionValues>({ resolver: zodResolver(regionSchema), defaultValues: initialValues });
  const fail = (message: string) => { setError("root", { message }); toast.error(message); };
  async function submit(values: RegionValues) {
    await saveRegion.mutateAsync(async () => { try {
      const { image_file, realms_text, ...body } = values;
      let image = initialValues.image;
      const file = image_file?.[0];
      if (file instanceof File && file.size) {
        const upload = new FormData(); upload.set("file", file); upload.set("kind", "regions");
        const response = await fetch("/api/admin/uploads", { method: "POST", body: upload });
        const result = await response.json();
        if (!response.ok) return fail(result.message || "Unable to upload image.");
        image = result.url;
      }
      const endpoint = mode === "add" ? `/api/admin/quests/chapters/${chapterId}/regions` : `/api/admin/quests/regions/${regionId}`;
      const response = await fetch(endpoint, { method: mode === "add" ? "POST" : "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, realms: realms_text.split(",").map((value) => value.trim().toLowerCase()).filter(Boolean), image }) });
      const result = await response.json();
      if (!response.ok) return fail(result.message || "Unable to update region.");
      toast.success(mode === "add" ? "Region created successfully." : "Region updated successfully.");
      router.push(back); router.refresh();
    } catch { fail(mode === "add" ? "Unable to create region." : "Unable to update region."); } });
  }
  return <section className="item-editor"><Button variant="ghost" size="sm" asChild><Link href={back}><ArrowLeft />Back to regions</Link></Button><div className="editor-heading"><h1>Edit region</h1><p className="muted">Update names, descriptions, order, visibility, and image.</p></div><form className="item-form" noValidate onSubmit={handleSubmit(submit, () => toast.error("Please correct the highlighted region fields."))}><fieldset disabled={isSubmitting} className="editor-fieldset"><Card><CardHeader><CardTitle>Region details</CardTitle><CardDescription>Ordering is applied within this chapter.</CardDescription></CardHeader><CardContent><div className="item-fields"><div className="editor-field"><Label htmlFor="order_number">Order number *</Label><Input id="order_number" type="number" min="1" {...register("order_number", { valueAsNumber: true })}/>{errors.order_number && <small className="error">{errors.order_number.message}</small>}</div><div className="editor-field"><Label htmlFor="name_english">Name EN *</Label><Input id="name_english" {...register("name_english")}/></div><div className="editor-field"><Label htmlFor="name_indonesia">Name ID *</Label><Input id="name_indonesia" {...register("name_indonesia")}/></div><div className="editor-field editor-upload"><Label htmlFor="image_file">Region image</Label>{initialValues.image && <img className="region-image-preview" src={initialValues.image} alt="Current region"/>}<div className="upload-box"><div className="upload-icon"><ImagePlus size={22}/></div><div className="upload-copy"><p>Choose region artwork</p><span>PNG, JPG, or WebP · Up to 5 MB</span></div><Input id="image_file" type="file" accept="image/png,image/jpeg,image/webp" {...register("image_file")}/></div></div><div className="editor-field"><Label htmlFor="description_english">Description EN</Label><Textarea id="description_english" rows={4} {...register("description_english")}/></div><div className="editor-field"><Label htmlFor="description_indonesia">Description ID</Label><Textarea id="description_indonesia" rows={4} {...register("description_indonesia")}/></div><Controller control={control} name="show" render={({ field }) => <div className="shop-option"><Switch id="show" checked={field.value} onCheckedChange={field.onChange}/><div><Label htmlFor="show">Visible in game</Label><p>{field.value ? "Region is visible." : "Region is hidden."}</p></div></div>}/></div></CardContent></Card></fieldset>{errors.root && <p className="error">{errors.root.message}</p>}<div className="item-form-actions"><Button variant="outline" size="lg" asChild><Link href={back}>Cancel</Link></Button><Button type="submit" size="lg" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="animate-spin"/> : <Save/>}{isSubmitting ? "Saving…" : "Update region"}</Button></div></form></section>;
}
